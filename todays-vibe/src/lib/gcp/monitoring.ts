import { JWT } from "google-auth-library";

const MONITORING_BASE = "https://monitoring.googleapis.com/v3";
const SCOPES = ["https://www.googleapis.com/auth/monitoring.read"];

// serviceruntime 은 모든 GCP API에 항상 존재하는 범용 메트릭
const METRIC_REQUEST_SERVICERUNTIME = "serviceruntime.googleapis.com/api/request_count";

// Gemini 전용 메트릭 (존재 여부는 프로젝트마다 다름 — 없으면 fallback)
const GEMINI_CANDIDATES: Record<"input" | "output" | "request", string[]> = {
  input: [
    "generativelanguage.googleapis.com/generate_content_input_token_count",
    "aiplatform.googleapis.com/prediction/online/token_count",         // Vertex AI
  ],
  output: [
    "generativelanguage.googleapis.com/generate_content_output_token_count",
    "aiplatform.googleapis.com/prediction/online/response_token_count",
  ],
  request: [
    "generativelanguage.googleapis.com/generate_content_request_count",
    METRIC_REQUEST_SERVICERUNTIME,
  ],
};

async function getAccessToken(): Promise<string> {
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const client = new JWT({
    email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
    key:   privateKey,
    scopes: SCOPES,
  });
  const res = await client.getAccessToken();
  if (!res.token) throw new Error("GCP access token 획득 실패");
  return res.token;
}

interface TimeSeriesPoint {
  interval: { startTime: string; endTime: string };
  value: { int64Value?: string; doubleValue?: number };
}

interface TimeSeries {
  metric: { labels?: Record<string, string> };
  points: TimeSeriesPoint[];
}

interface MonitoringResponse {
  timeSeries?: TimeSeries[];
  error?: { code: number; message: string; status: string };
}

interface QueryOpts {
  projectId:  string;
  metricType: string;
  filter?:    string;
  startTime:  string;
  endTime:    string;
  token:      string;
}

/** 단일 메트릭 조회. 없거나 빈 경우 null 반환, 403은 throw */
async function queryTimeSeries(opts: QueryOpts): Promise<number | null> {
  const { projectId, metricType, filter, startTime, endTime, token } = opts;

  const baseFilter = filter
    ? `metric.type="${metricType}" AND ${filter}`
    : `metric.type="${metricType}"`;

  const durationSec = Math.round(
    (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
  );

  const params = new URLSearchParams({
    "filter":                         baseFilter,
    "interval.startTime":             startTime,
    "interval.endTime":               endTime,
    "aggregation.alignmentPeriod":    `${durationSec}s`,
    "aggregation.perSeriesAligner":   "ALIGN_SUM",
    "aggregation.crossSeriesReducer": "REDUCE_SUM",
  });

  const url = `${MONITORING_BASE}/projects/${projectId}/timeSeries?${params}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const json: MonitoringResponse = await res.json();

  if (res.status === 403) {
    throw Object.assign(new Error(json.error?.message ?? "Permission denied"), { status: 403 });
  }

  if (!res.ok) return null;                          // 404 / metric 없음 → null
  if (!json.timeSeries?.length) return null;         // 데이터 없음 → null

  return json.timeSeries.reduce((total, series) => {
    return total + (series.points ?? []).reduce((s, p) => {
      const v = p.value?.int64Value ? parseInt(p.value.int64Value) : (p.value?.doubleValue ?? 0);
      return s + v;
    }, 0);
  }, 0);
}

/** 후보 메트릭을 순서대로 시도하고 첫 번째로 값이 있는 것을 반환 */
async function queryFirstAvailable(
  projectId: string,
  candidates: string[],
  startTime: string,
  endTime: string,
  token: string,
  filter?: string,
): Promise<{ value: number; metricType: string } | null> {
  for (const metricType of candidates) {
    const value = await queryTimeSeries({ projectId, metricType, filter, startTime, endTime, token });
    if (value !== null) return { value, metricType };
  }
  return null;
}

/** 사용 가능한 메트릭 목록 조회 (디버그용) */
export async function listGeminiMetrics(): Promise<string[]> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
  const token = await getAccessToken();
  const url = `${MONITORING_BASE}/projects/${projectId}/metricDescriptors?filter=metric.type%3Dstarts_with(%22generativelanguage.googleapis.com%22)`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];
  const json = await res.json() as { metricDescriptors?: { type: string }[] };
  return (json.metricDescriptors ?? []).map((d) => d.type);
}

export interface GcpUsageResult {
  inputTokens:  number;
  outputTokens: number;
  requestCount: number;
  period: { start: string; end: string };
  resolvedMetrics?: {
    input:   string | null;
    output:  string | null;
    request: string | null;
  };
}

export type GcpUsageError =
  | { type: "permission_denied"; hint: string }
  | { type: "metric_not_found"; hint: string }
  | { type: "unknown"; message: string };

export async function getGcpGeminiUsage(
  days: number
): Promise<{ ok: true; data: GcpUsageResult } | { ok: false; error: GcpUsageError }> {
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;

  const endTime   = new Date();
  const startTime = new Date(endTime.getTime() - days * 24 * 60 * 60 * 1000);
  const period    = {
    start: startTime.toISOString(),
    end:   endTime.toISOString(),
  };

  let token: string;
  try {
    token = await getAccessToken();
  } catch {
    return {
      ok: false,
      error: { type: "unknown", message: "서비스 계정 인증 실패. FIREBASE_ADMIN 환경 변수를 확인하세요." },
    };
  }

  try {
    // serviceruntime fallback: 요청 수는 항상 존재
    const srFilter = `resource.labels.service="generativelanguage.googleapis.com"`;

    const [inputResult, outputResult, requestResult] = await Promise.all([
      queryFirstAvailable(projectId, GEMINI_CANDIDATES.input,   period.start, period.end, token),
      queryFirstAvailable(projectId, GEMINI_CANDIDATES.output,  period.start, period.end, token),
      queryFirstAvailable(projectId, GEMINI_CANDIDATES.request, period.start, period.end, token)
        ?? queryTimeSeries({ projectId, metricType: METRIC_REQUEST_SERVICERUNTIME, filter: srFilter, startTime: period.start, endTime: period.end, token })
          .then((v) => v !== null ? { value: v, metricType: METRIC_REQUEST_SERVICERUNTIME } : null),
    ]);

    // 세 가지 모두 데이터 없으면 metric_not_found
    if (!inputResult && !outputResult && !requestResult) {
      // 메트릭 목록 조회해서 힌트 제공
      const available = await listGeminiMetrics();
      const hint = available.length > 0
        ? `사용 가능한 메트릭:\n${available.join("\n")}`
        : "generativelanguage.googleapis.com 메트릭이 이 프로젝트에 없습니다.\nAI Studio API 사용 이력이 있어야 메트릭이 생성됩니다.";
      return { ok: false, error: { type: "metric_not_found", hint } };
    }

    return {
      ok: true,
      data: {
        inputTokens:  inputResult?.value  ?? 0,
        outputTokens: outputResult?.value ?? 0,
        requestCount: requestResult?.value ?? 0,
        period,
        resolvedMetrics: {
          input:   inputResult?.metricType  ?? null,
          output:  outputResult?.metricType ?? null,
          request: requestResult?.metricType ?? null,
        },
      },
    };
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };

    if (e.status === 403) {
      return {
        ok: false,
        error: {
          type: "permission_denied",
          hint: `서비스 계정(${process.env.FIREBASE_ADMIN_CLIENT_EMAIL})에 roles/monitoring.viewer 권한이 필요합니다.\nGCP Console → IAM → 해당 계정에 Monitoring Viewer 추가.`,
        },
      };
    }
    return { ok: false, error: { type: "unknown", message: e.message ?? "알 수 없는 오류" } };
  }
}
