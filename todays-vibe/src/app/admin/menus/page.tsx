"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import fortunesData from "@/data/fortunes.json";
import type { MenuItem, AccessLevel, Category, UsageLimits } from "@/types/menu";
import {
  getMenus,
  saveMenu,
  deleteMenusByIds,
  patchMenusByIds,
  getExtraCategories,
  saveCategory,
  deleteCategoryById,
  batchUpdateOrders,
  getQuickMenu,
  saveQuickMenu,
  getHeroCardSettings,
  saveHeroCardSettings,
  type HeroCardSettings,
} from "./actions";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCESS_LABEL: Record<AccessLevel, string> = {
  public: "비회원",
  member: "회원",
  premium: "프리미엄",
  admin: "관리자",
};

const ACCESS_COLOR: Record<AccessLevel, string> = {
  public: "text-white/40 bg-white/5",
  member: "text-blue-300 bg-blue-900/30",
  premium: "text-amber-300 bg-amber-900/40",
  admin: "text-red-300 bg-red-900/40",
};

const DIFF_LABEL: Record<string, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
  expert: "전문가",
};


type SortKey =
  | "nameKo"
  | "category"
  | "ready"
  | "isAI"
  | "accessLevel"
  | "difficulty";

interface ColDef {
  key: string;
  label: string;
  sortKey?: SortKey;
  defaultVisible: boolean;
}

const COL_DEFS: ColDef[] = [
  { key: "icon",        label: "아이콘",   defaultVisible: true },
  { key: "nameKo",      label: "이름/설명", sortKey: "nameKo",      defaultVisible: true },
  { key: "category",    label: "카테고리", sortKey: "category",    defaultVisible: true },
  { key: "ready",       label: "노출",     sortKey: "ready",       defaultVisible: true },
  { key: "isAI",        label: "AI",       sortKey: "isAI",        defaultVisible: true },
  { key: "accessLevel", label: "회원등급", sortKey: "accessLevel", defaultVisible: true },
  { key: "difficulty",  label: "난이도",   sortKey: "difficulty",  defaultVisible: false },
  { key: "tags",        label: "태그",                             defaultVisible: false },
  { key: "path",        label: "경로",                             defaultVisible: false },
];

// ─── Category modal ───────────────────────────────────────────────────────────

function CategoryModal({
  categories,
  baseIds,
  onAdd,
  onEdit,
  onDelete,
  onClose,
}: {
  categories: Category[];
  baseIds: Set<string>;
  onAdd: (cat: Category) => void;
  onEdit: (cat: Category) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}) {
  // 추가 폼
  const [newIcon, setNewIcon] = useState("🌟");
  const [newName, setNewName] = useState("");
  const [newId, setNewId]     = useState("");

  // 인라인 편집
  const [editingId, setEditingId]   = useState<string | null>(null);
  const [editIcon, setEditIcon]     = useState("");
  const [editName, setEditName]     = useState("");

  const sortedCats = [...categories].sort((a, b) => a.order - b.order);
  const canAdd = newId.trim() && newName.trim() && !categories.some((c) => c.id === newId.trim());

  function handleAdd() {
    if (!canAdd) return;
    onAdd({ id: newId.trim(), name: newName.trim(), icon: newIcon, order: categories.length });
    setNewIcon("🌟"); setNewName(""); setNewId("");
  }

  function startEdit(cat: Category) {
    setEditingId(cat.id);
    setEditIcon(cat.icon);
    setEditName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  function handleEdit(cat: Category) {
    if (!editName.trim()) return;
    onEdit({ ...cat, icon: editIcon, name: editName });
    setEditingId(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-white font-semibold">카테고리 관리</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        {/* List */}
        <div className="px-6 py-4 space-y-2 overflow-y-auto flex-1">
          {sortedCats.map((cat, idx) => (
            <div key={cat.id} className="rounded-lg bg-white/5 border border-white/5 overflow-hidden">
              {editingId === cat.id ? (
                /* 편집 모드 */
                <div className="flex items-center gap-2 px-3 py-2.5">
                  <input
                    value={editIcon}
                    onChange={(e) => setEditIcon(e.target.value)}
                    className="w-10 px-1 py-1 rounded bg-gray-800 border border-white/10 text-white text-center text-lg focus:outline-none focus:border-purple-500"
                  />
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-2 py-1 rounded bg-gray-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500"
                  />
                  <button
                    onClick={() => handleEdit(cat)}
                    disabled={!editName.trim()}
                    className="text-xs text-purple-300 border border-purple-800/60 rounded px-2 py-1 hover:bg-purple-900/30 disabled:opacity-40 transition-colors"
                  >
                    저장
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-xs text-white/40 border border-white/10 rounded px-2 py-1 hover:bg-white/5 transition-colors"
                  >
                    취소
                  </button>
                </div>
              ) : (
                /* 일반 모드 */
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <span className="text-xl w-7 text-center">{cat.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{cat.name}</p>
                    <p className="text-white/30 text-xs font-mono">{cat.id}</p>
                  </div>
                  {baseIds.has(cat.id) && (
                    <span className="text-white/20 text-[10px] px-1.5 py-0.5 rounded border border-white/10">기본</span>
                  )}
                  <button
                    onClick={() => startEdit(cat)}
                    className="text-xs text-white/50 border border-white/10 rounded px-2 py-0.5 hover:bg-white/5 transition-colors"
                  >
                    수정
                  </button>
                  {!baseIds.has(cat.id) && (
                    <button
                      onClick={() => onDelete(cat.id)}
                      className="text-xs text-red-400/60 hover:text-red-400 border border-red-900/40 hover:border-red-700/60 rounded px-2 py-0.5 transition-colors"
                    >
                      삭제
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add form */}
        <div className="px-6 pb-6 pt-4 border-t border-white/10 shrink-0 space-y-3">
          <p className="text-white/40 text-xs">카테고리 추가</p>
          <div className="flex gap-2">
            <input
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-12 px-1 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-center text-xl focus:outline-none focus:border-purple-500"
            />
            <input
              value={newId}
              onChange={(e) => setNewId(e.target.value.replace(/[^a-z0-9-]/g, ""))}
              placeholder="ID (영문)"
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500"
            />
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="이름"
              className="flex-1 px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!canAdd}
            className="w-full py-2 rounded-lg text-sm bg-purple-600 text-white font-semibold hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_LIMITS: UsageLimits = { public: -1, member: -1, premium: -1, admin: -1 };
const PRESET_LIMITS = [-1, 0, 1, 2, 3, 5, 10, 20, 30];

// ─── Shared styles ────────────────────────────────────────────────────────────

const CLS_INPUT =
  "w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm placeholder-white/20 focus:outline-none focus:border-purple-500 transition-colors";
const CLS_SELECT =
  "w-full px-3 py-2 rounded-lg bg-gray-800 border border-white/10 text-white text-sm focus:outline-none focus:border-purple-500 transition-colors";

// ─── UI atoms ─────────────────────────────────────────────────────────────────

function LimitSelect({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const isCustom = !PRESET_LIMITS.includes(value);
  return (
    <div className="flex items-center gap-1.5">
      <select
        value={isCustom ? "custom" : String(value)}
        onChange={(e) => { if (e.target.value !== "custom") onChange(Number(e.target.value)); }}
        disabled={disabled}
        className="px-2 py-1.5 rounded-lg bg-gray-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500 disabled:opacity-40 transition-colors"
      >
        <option value="-1" className="bg-gray-800">제한없음 (∞)</option>
        <option value="0" className="bg-gray-800">사용불가</option>
        <option value="1" className="bg-gray-800">1회</option>
        <option value="2" className="bg-gray-800">2회</option>
        <option value="3" className="bg-gray-800">3회</option>
        <option value="5" className="bg-gray-800">5회</option>
        <option value="10" className="bg-gray-800">10회</option>
        <option value="20" className="bg-gray-800">20회</option>
        <option value="30" className="bg-gray-800">30회</option>
        {isCustom && <option value={String(value)} className="bg-gray-800">{value}회</option>}
        <option value="custom" className="bg-gray-800">직접입력...</option>
      </select>
      {isCustom && (
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-16 px-2 py-1.5 rounded-lg bg-gray-800 border border-white/10 text-white text-xs focus:outline-none focus:border-purple-500"
        />
      )}
    </div>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="text-white/40 text-xs mb-1.5">{label}</p>
      {children}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <div
        className={`relative w-9 h-5 rounded-full transition-colors ${
          checked ? "bg-purple-600" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
      <span className="text-white/60 text-sm select-none">{label}</span>
    </div>
  );
}

// ─── Fortune modal (add & edit) ───────────────────────────────────────────────

function FortuneModal({
  initial,
  maxOrder,
  categories,
  onSave,
  onClose,
}: {
  initial: MenuItem | null;
  maxOrder: number;
  categories: Category[];
  onSave: (item: MenuItem) => void;
  onClose: () => void;
}) {
  const isNew = !initial;
  const [form, setForm] = useState<MenuItem>(
    initial
      ? { usageLimits: DEFAULT_LIMITS, ...initial }
      : {
          id: "",
          icon: "✨",
          nameKo: "",
          description: "",
          category: categories[0]?.id ?? "",
          path: "/",
          difficulty: "easy",
          isAI: false,
          ready: false,
          accessLevel: "public",
          tags: [],
          color: "from-purple-500 to-pink-500",
          order: maxOrder + 1,
          usageLimits: DEFAULT_LIMITS,
        }
  );
  const [tagInput, setTagInput] = useState(form.tags.join(", "));

  function set<K extends keyof MenuItem>(k: K, v: MenuItem[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const canSave = form.nameKo.trim() && (!isNew || form.id.trim());

  function handleSave() {
    if (!canSave) return;
    onSave({
      ...form,
      tags: tagInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <h3 className="text-white font-semibold">
            {isNew ? "메뉴 추가" : `편집 — ${form.nameKo}`}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-4 overflow-y-auto flex-1">
          {isNew ? (
            <Field label="ID (영문, 하이픈 허용)">
              <input
                value={form.id}
                onChange={(e) => set("id", e.target.value.replace(/[^a-z0-9-]/g, ""))}
                placeholder="예: my-fortune"
                className={CLS_INPUT}
              />
            </Field>
          ) : (
            <p className="text-white/20 text-xs font-mono">id: {form.id}</p>
          )}

          <div className="flex gap-3">
            <Field label="아이콘" className="w-20 shrink-0">
              <input
                value={form.icon}
                onChange={(e) => set("icon", e.target.value)}
                className={CLS_INPUT + " text-center text-xl"}
              />
            </Field>
            <Field label="이름" className="flex-1">
              <input
                value={form.nameKo}
                onChange={(e) => set("nameKo", e.target.value)}
                placeholder="메뉴 이름"
                className={CLS_INPUT}
              />
            </Field>
          </div>

          <Field label="설명">
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              rows={2}
              className={CLS_INPUT + " resize-none"}
            />
          </Field>

          <Field label="경로">
            <input
              value={form.path}
              onChange={(e) => set("path", e.target.value)}
              placeholder="/my-path"
              className={CLS_INPUT}
            />
          </Field>

          <div className="flex gap-3">
            <Field label="카테고리" className="flex-1">
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className={CLS_SELECT}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gray-800">{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="난이도" className="flex-1">
              <select
                value={form.difficulty}
                onChange={(e) => set("difficulty", e.target.value)}
                className={CLS_SELECT}
              >
                {Object.entries(DIFF_LABEL).map(([v, label]) => (
                  <option key={v} value={v} className="bg-gray-800">{label}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="회원등급">
            <select
              value={form.accessLevel}
              onChange={(e) => set("accessLevel", e.target.value as AccessLevel)}
              className={CLS_SELECT}
            >
              <option value="public"  className="bg-gray-800">비회원 (누구나)</option>
              <option value="member"  className="bg-gray-800">회원 (로그인 필요)</option>
              <option value="premium" className="bg-gray-800">프리미엄</option>
              <option value="admin"   className="bg-gray-800">관리자 전용</option>
            </select>
          </Field>

          <div className="flex gap-6 pt-1">
            <Toggle label="노출" checked={form.ready} onChange={(v) => set("ready", v)} />
            <Toggle label="AI 기능" checked={form.isAI} onChange={(v) => set("isAI", v)} />
          </div>

          <Field label="태그 (쉼표 구분)">
            <input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="인기, AI, 프리미엄"
              className={CLS_INPUT}
            />
          </Field>

          {/* 횟수 제한 */}
          <div>
            <p className="text-white/40 text-xs mb-2">
              횟수 제한
              <span className="ml-1.5 text-white/20">(하루 기준, 자정 초기화)</span>
            </p>
            <div className="rounded-lg border border-white/10 overflow-hidden divide-y divide-white/5">
              {(["public", "member", "premium", "admin"] as const).map((role) => {
                const limits = form.usageLimits ?? DEFAULT_LIMITS;
                const val = limits[role] ?? -1;
                const isAdmin = role === "admin";
                return (
                  <div key={role} className="flex items-center gap-3 px-3 py-2 bg-white/3">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full w-14 text-center shrink-0 ${ACCESS_COLOR[role]}`}>
                      {ACCESS_LABEL[role]}
                    </span>
                    {isAdmin ? (
                      <span className="text-white/30 text-xs">제한없음 (항상)</span>
                    ) : (
                      <>
                        <LimitSelect
                          value={val}
                          onChange={(v) =>
                            set("usageLimits", { ...limits, [role]: v })
                          }
                        />
                        <span className="text-white/20 text-xs">
                          {val === -1 ? "∞ 무제한" : val === 0 ? "🚫 차단" : `하루 ${val}회`}
                        </span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-4 border-t border-white/10 flex gap-2 justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={!canSave}
            className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white font-semibold hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {isNew ? "추가" : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Column options modal ─────────────────────────────────────────────────────

function ColModal({
  visibleCols,
  onToggle,
  onClose,
}: {
  visibleCols: Set<string>;
  onToggle: (key: string) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 border border-white/10 rounded-2xl p-6 w-72 shadow-2xl">
        <h3 className="text-white font-semibold mb-4">컬럼 표시 설정</h3>
        <div className="space-y-3">
          {COL_DEFS.map((col) => (
            <label key={col.key} className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={visibleCols.has(col.key)}
                onChange={() => onToggle(col.key)}
                className="accent-purple-500 w-4 h-4"
              />
              <span className="text-white/70 text-sm flex-1">{col.label}</span>
              {col.sortKey && <span className="text-white/25 text-[10px]">정렬↕</span>}
            </label>
          ))}
        </div>
        <button
          onClick={onClose}
          className="mt-5 w-full py-2 rounded-lg bg-purple-600 text-white text-sm font-semibold hover:bg-purple-500 transition-colors"
        >
          확인
        </button>
      </div>
    </div>
  );
}

// ─── Quick Menu modal ─────────────────────────────────────────────────────────

const QUICK_MAX = 6;

function QuickMenuModal({
  menus,
  initialIds,
  onSave,
  onClose,
}: {
  menus: MenuItem[];
  initialIds: string[];
  onSave: (ids: string[]) => void;
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialIds);

  const readyMenus = menus.filter((m) => m.ready);
  const selectedMenus = selectedIds
    .map((id) => readyMenus.find((m) => m.id === id))
    .filter(Boolean) as MenuItem[];
  const unselected = readyMenus.filter((m) => !selectedIds.includes(m.id));

  function add(id: string) {
    if (selectedIds.length >= QUICK_MAX) return;
    setSelectedIds((prev) => [...prev, id]);
  }

  function remove(id: string) {
    setSelectedIds((prev) => prev.filter((i) => i !== id));
  }

  function move(idx: number, dir: -1 | 1) {
    const next = [...selectedIds];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    setSelectedIds(next);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-white font-semibold">⚡ Quick Menu 설정</h3>
            <p className="text-white/40 text-xs mt-0.5">
              홈 상단에 노출할 메뉴를 선택하고 순서를 정하세요 (최대 {QUICK_MAX}개)
            </p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl leading-none">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* 선택된 메뉴 */}
          <div>
            <p className="text-white/40 text-xs mb-2">
              선택된 메뉴{" "}
              <span className="text-purple-400 font-medium">{selectedIds.length}</span>
              <span className="text-white/20">/{QUICK_MAX}</span>
            </p>
            {selectedMenus.length === 0 ? (
              <div className="text-white/20 text-sm text-center py-5 border border-dashed border-white/10 rounded-xl">
                아래에서 메뉴를 추가하세요
              </div>
            ) : (
              <div className="space-y-1.5">
                {selectedMenus.map((m, idx) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-purple-900/20 border border-purple-700/30"
                  >
                    <span className="text-xl w-7 text-center">{m.icon}</span>
                    <span className="flex-1 text-white text-sm font-medium">{m.nameKo}</span>
                    <div className="flex items-center gap-0.5">
                      <button
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0}
                        className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/70 hover:bg-white/5 disabled:opacity-20 text-xs transition-colors"
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => move(idx, 1)}
                        disabled={idx === selectedMenus.length - 1}
                        className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-white/70 hover:bg-white/5 disabled:opacity-20 text-xs transition-colors"
                      >
                        ▼
                      </button>
                      <button
                        onClick={() => remove(m.id)}
                        className="w-7 h-7 flex items-center justify-center rounded text-red-400/50 hover:text-red-400 hover:bg-red-900/20 text-sm transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 추가 가능한 메뉴 */}
          {unselected.length > 0 && (
            <div>
              <p className="text-white/40 text-xs mb-2">추가 가능한 메뉴</p>
              <div className="space-y-1">
                {unselected.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => add(m.id)}
                    disabled={selectedIds.length >= QUICK_MAX}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/15 transition-all text-left disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-xl w-7 text-center">{m.icon}</span>
                    <span className="flex-1 text-white/70 text-sm">{m.nameKo}</span>
                    <span className="text-purple-400/60 text-xs">+ 추가</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSave(selectedIds)}
            className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Hero Card settings modal ─────────────────────────────────────────────────

function HeroCardModal({
  initial,
  onSave,
  onClose,
}: {
  initial: HeroCardSettings;
  onSave: (settings: HeroCardSettings) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<HeroCardSettings>(initial);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-white font-semibold">✨ 오늘의 운세 Hero 설정</h3>
            <p className="text-white/40 text-xs mt-0.5">홈 상단 운세 카드의 안내 문구를 수정합니다</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* State: not logged in */}
          <div>
            <p className="text-white/40 text-xs mb-1.5">
              미로그인 상태 안내 문구
              <span className="ml-1.5 text-white/20">(블러 처리된 점수 아래 표시)</span>
            </p>
            <textarea
              value={form.notLoggedInText}
              onChange={(e) => setForm((f) => ({ ...f, notLoggedInText: e.target.value }))}
              rows={2}
              className={CLS_INPUT + " resize-none"}
              placeholder="로그인하면 오늘의 운세 점수를 확인할 수 있어요"
            />
          </div>

          {/* State: no birth info */}
          <div>
            <p className="text-white/40 text-xs mb-1.5">
              생년월일 미등록 안내 문구
              <span className="ml-1.5 text-white/20">(운세 아래 표시)</span>
            </p>
            <textarea
              value={form.noBirthInfoText}
              onChange={(e) => setForm((f) => ({ ...f, noBirthInfoText: e.target.value }))}
              rows={2}
              className={CLS_INPUT + " resize-none"}
              placeholder="생년월일을 저장하면 AI가 맞춤 운세를 드려요"
            />
          </div>

          {/* State examples */}
          <div className="rounded-xl border border-white/8 bg-white/3 px-4 py-3 space-y-1.5">
            <p className="text-white/30 text-[10px] font-semibold uppercase tracking-wider mb-2">상태별 동작</p>
            <p className="text-white/50 text-xs">• <span className="text-white/30">미로그인</span> → 블러 처리 + 로그인 유도</p>
            <p className="text-white/50 text-xs">• <span className="text-white/30">생년월일 없음</span> → 개인화 점수(UID 기반) + 생년월일 등록 유도</p>
            <p className="text-white/50 text-xs">• <span className="text-white/30">생년월일 있음</span> → AI 맞춤 점수 (하루 1회 갱신, 캐시됨)</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 pt-2 flex gap-2 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm text-white/60 border border-white/10 hover:bg-white/5 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => onSave(form)}
            className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white font-semibold hover:bg-purple-500 transition-colors"
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Reorder modal ────────────────────────────────────────────────────────────

const CAT_TAB = "__categories__";

function ReorderModal({
  initMenus,
  initCategories,
  onSave,
  onClose,
}: {
  initMenus: MenuItem[];
  initCategories: Category[];
  onSave: (menus: MenuItem[], categories: Category[]) => void;
  onClose: () => void;
}) {
  // 배열 위치 = 순서 (order 필드가 아닌 인덱스로 관리)
  const [draftCats, setDraftCats] = useState<Category[]>(
    [...initCategories].sort((a, b) => a.order - b.order)
  );
  const [draftMenus, setDraftMenus] = useState<MenuItem[]>(
    [...initMenus].sort((a, b) => a.order - b.order)
  );
  const [tab, setTab] = useState(CAT_TAB);
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const isCatTab = tab === CAT_TAB;
  const list: (Category | MenuItem)[] = isCatTab
    ? draftCats
    : draftMenus.filter((m) => m.category === tab);

  // 배열에서 from → to로 이동 (splice 방식)
  function moveItem(from: number, to: number) {
    if (from === to) return;
    if (isCatTab) {
      const next = [...draftCats];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      setDraftCats(next);
    } else {
      const filtered = draftMenus.filter((m) => m.category === tab);
      const next = [...filtered];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      setDraftMenus((prev) => {
        let fi = 0;
        return prev.map((m) => (m.category !== tab ? m : next[fi++]));
      });
    }
  }

  // 드래그 앤 드롭 핸들러
  function handleDragStart(e: React.DragEvent<HTMLDivElement>, idx: number) {
    e.dataTransfer.effectAllowed = "move";
    setDragIdx(idx);
  }
  function handleDragOver(e: React.DragEvent<HTMLDivElement>, idx: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (idx !== dragOverIdx) setDragOverIdx(idx);
  }
  function handleDrop(e: React.DragEvent<HTMLDivElement>, idx: number) {
    e.preventDefault();
    if (dragIdx !== null && dragIdx !== idx) moveItem(dragIdx, idx);
    setDragIdx(null);
    setDragOverIdx(null);
  }
  function handleDragEnd() {
    setDragIdx(null);
    setDragOverIdx(null);
  }

  // 변경 여부: 인덱스 위치 기반으로 비교
  const origCatIds = [...initCategories].sort((a, b) => a.order - b.order).map((c) => c.id);
  const catChanged = origCatIds.some((id, i) => id !== draftCats[i]?.id);

  const catIdsWithMenus = [...new Set(initMenus.map((m) => m.category))];
  const menuChanged = catIdsWithMenus.some((cat) => {
    const orig = initMenus.filter((m) => m.category === cat).sort((a, b) => a.order - b.order).map((m) => m.id);
    const draft = draftMenus.filter((m) => m.category === cat).map((m) => m.id);
    return orig.some((id, i) => id !== draft[i]);
  });
  // 변경된 카테고리 탭에 점 표시용
  const changedMenuCats = new Set(
    catIdsWithMenus.filter((cat) => {
      const orig = initMenus.filter((m) => m.category === cat).sort((a, b) => a.order - b.order).map((m) => m.id);
      const draft = draftMenus.filter((m) => m.category === cat).map((m) => m.id);
      return orig.some((id, i) => id !== draft[i]);
    })
  );

  const hasChanges = catChanged || menuChanged;

  function handleSave() {
    // 카테고리: 위치 = 순서 (0, 1, 2...)
    const newCats = draftCats.map((c, i) => ({ ...c, order: i }));

    // 메뉴: 카테고리별 원본 order 풀을 위치에 재배정
    const newMenus = [...draftMenus];
    for (const cat of catIdsWithMenus) {
      const origOrders = initMenus
        .filter((m) => m.category === cat)
        .map((m) => m.order)
        .sort((a, b) => a - b);
      const catItems = newMenus.filter((m) => m.category === cat);
      catItems.forEach((item, pos) => {
        const gi = newMenus.findIndex((m) => m.id === item.id);
        newMenus[gi] = { ...newMenus[gi], order: origOrders[pos] };
      });
    }

    onSave(newMenus, newCats);
  }

  const tabs = [
    { id: CAT_TAB, label: "카테고리 순서", icon: "📁" },
    ...draftCats.map((c) => ({ id: c.id, label: c.name, icon: c.icon })),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-white/10 flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-white font-semibold">순서 변경</h3>
            <p className="text-white/30 text-xs mt-0.5">드래그하거나 ▲▼로 순서 조정 후 저장하세요.</p>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white text-xl">✕</button>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1 px-4 pt-3 pb-2 overflow-x-auto shrink-0 border-b border-white/5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`shrink-0 relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                tab === t.id
                  ? "bg-purple-600/80 text-white"
                  : "text-white/40 hover:text-white/70 hover:bg-white/5"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
              {/* 변경된 탭 표시 */}
              {((t.id === CAT_TAB && catChanged) || (t.id !== CAT_TAB && changedMenuCats.has(t.id))) && (
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
          {list.length === 0 && (
            <p className="text-white/20 text-sm text-center py-8">이 카테고리에 메뉴가 없습니다.</p>
          )}
          {list.map((item, idx) => {
            const isDragging = dragIdx === idx;
            const isOver = dragOverIdx === idx && dragIdx !== null && dragIdx !== idx;
            const icon = isCatTab ? (item as Category).icon : (item as MenuItem).icon;
            const label = isCatTab ? (item as Category).name : (item as MenuItem).nameKo;
            const sub = isCatTab ? (item as Category).id : (item as MenuItem).description;

            return (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragEnd={handleDragEnd}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all duration-100 select-none ${
                  isDragging
                    ? "opacity-30 bg-white/5 border-white/5 cursor-grabbing"
                    : isOver
                    ? "bg-purple-900/30 border-purple-500/50 shadow-[0_0_0_1px_rgba(168,85,247,0.3)]"
                    : "bg-white/5 border-white/5 hover:bg-white/8 hover:border-white/10 cursor-grab"
                }`}
              >
                {/* 순서 번호 */}
                <span className="text-white/20 text-xs w-5 text-right shrink-0 font-mono">{idx + 1}</span>
                {/* 드래그 핸들 */}
                <span className="text-white/15 text-sm shrink-0 tracking-[-3px]">⠿⠿</span>
                <span className="text-xl shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium leading-tight">{label}</p>
                  <p className="text-white/30 text-xs truncate mt-0.5">{sub}</p>
                </div>
                {/* 화살표 버튼 */}
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button
                    onClick={() => moveItem(idx, idx - 1)}
                    disabled={idx === 0}
                    className="w-6 h-5 flex items-center justify-center rounded text-white/25 hover:text-white hover:bg-white/10 disabled:opacity-0 disabled:cursor-default transition-colors text-xs cursor-pointer"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveItem(idx, idx + 1)}
                    disabled={idx === list.length - 1}
                    className="w-6 h-5 flex items-center justify-center rounded text-white/25 hover:text-white hover:bg-white/10 disabled:opacity-0 disabled:cursor-default transition-colors text-xs cursor-pointer"
                  >
                    ▼
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between shrink-0">
          <span className="text-white/25 text-xs">
            {hasChanges ? "변경 사항이 있습니다." : "변경 없음"}
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="px-4 py-2 rounded-lg text-sm bg-purple-600 text-white font-semibold hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              순서 저장
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminMenusPage() {
  const [rows, setRows] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [visibleCols, setVisibleCols] = useState<Set<string>>(
    new Set(COL_DEFS.filter((c) => c.defaultVisible).map((c) => c.key))
  );
  const [editRow, setEditRow] = useState<MenuItem | "new" | null>(null);
  const [showColModal, setShowColModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [showQuickMenuModal, setShowQuickMenuModal] = useState(false);
  const [quickMenuIds, setQuickMenuIds] = useState<string[]>([]);
  const [showHeroCardModal, setShowHeroCardModal] = useState(false);
  const [heroCardSettings, setHeroCardSettings] = useState<HeroCardSettings>({
    notLoggedInText: "로그인하면 오늘의 운세 점수를 확인할 수 있어요",
    noBirthInfoText: "생년월일을 저장하면 AI가 맞춤 운세를 드려요",
  });
  const [bulkCategory, setBulkCategory] = useState("");

  // 카테고리: JSON 기본값 + Firestore 추가분 병합
  const baseCategories: Category[] = fortunesData.categories.map((c, i) => ({
    id: c.id, name: c.name, icon: c.icon, order: i,
  }));
  const baseIds = new Set(baseCategories.map((c) => c.id));
  const [categories, setCategories] = useState<Category[]>(baseCategories);

  // 초기 데이터 로드
  useEffect(() => {
    Promise.allSettled([
      getMenus(),
      getExtraCategories(),
      getQuickMenu(),
      getHeroCardSettings(),
    ]).then(([menusResult, extraResult, quickResult, heroResult]) => {
      if (menusResult.status === "fulfilled") {
        setRows(menusResult.value);
      } else {
        setError("메뉴를 불러오지 못했습니다.");
      }
      if (quickResult.status === "fulfilled") setQuickMenuIds(quickResult.value);
      if (heroResult.status === "fulfilled") setHeroCardSettings(heroResult.value);
      if (extraResult.status === "fulfilled" && extraResult.value.length > 0) {
        setCategories((prev) => {
          const firestoreMap = new Map(extraResult.value.map((c) => [c.id, c]));
          const merged = prev.map((c) => firestoreMap.has(c.id) ? firestoreMap.get(c.id)! : c);
          const newOnes = extraResult.value.filter((c) => !prev.some((p) => p.id === c.id));
          return [...merged, ...newOnes];
        });
      }
    }).finally(() => setLoading(false));
  }, []);

  // 정렬
  const sorted = useMemo(() => {
    if (!sortKey) return [...rows].sort((a, b) => a.order - b.order);
    const key = sortKey;
    return [...rows].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      const cmp =
        typeof av === "boolean"
          ? av === bv ? 0 : av ? -1 : 1
          : String(av).localeCompare(String(bv), "ko");
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
    }
  }

  function toggleAll() {
    setSelected(selected.size === rows.length ? new Set() : new Set(rows.map((r) => r.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  }

  // 로컬 상태 즉시 업데이트 + Firestore 동기화
  function patch(ids: Set<string> | null, data: Partial<MenuItem>) {
    setRows((prev) =>
      prev.map((r) => (!ids || ids.has(r.id) ? { ...r, ...data } : r))
    );
    startTransition(async () => {
      try {
        await patchMenusByIds(ids ? [...ids] : null, data);
      } catch {
        setError("저장에 실패했습니다. 페이지를 새로고침해 주세요.");
      }
    });
  }

  function handleDelete() {
    if (!selected.size || !confirm(`${selected.size}개를 삭제하시겠습니까?`)) return;
    const ids = [...selected];
    setRows((prev) => prev.filter((r) => !ids.includes(r.id)));
    setSelected(new Set());
    startTransition(async () => {
      try {
        await deleteMenusByIds(ids);
      } catch {
        setError("삭제에 실패했습니다. 페이지를 새로고침해 주세요.");
      }
    });
  }

  function handleBulkCategory() {
    if (!bulkCategory || !selected.size) return;
    patch(selected, { category: bulkCategory });
    setBulkCategory("");
  }

  function toggleCol(key: string) {
    setVisibleCols((prev) => {
      const s = new Set(prev);
      s.has(key) ? s.delete(key) : s.add(key);
      return s;
    });
  }

  function handleSave(item: MenuItem) {
    if (editRow === "new") {
      setRows((prev) => [...prev, item]);
    } else {
      setRows((prev) => prev.map((r) => (r.id === item.id ? item : r)));
    }
    setEditRow(null);
    startTransition(async () => {
      try {
        await saveMenu(item);
      } catch {
        setError("저장에 실패했습니다. 페이지를 새로고침해 주세요.");
      }
    });
  }

  function handleAddCategory(cat: Category) {
    setCategories((prev) => [...prev, cat]);
    startTransition(async () => {
      try {
        await saveCategory(cat);
      } catch {
        setError("카테고리 저장에 실패했습니다.");
      }
    });
  }

  function handleEditCategory(cat: Category) {
    setCategories((prev) => prev.map((c) => (c.id === cat.id ? cat : c)));
    startTransition(async () => {
      try {
        await saveCategory(cat);
      } catch {
        setError("카테고리 수정에 실패했습니다.");
      }
    });
  }

  function handleSaveReorder(newMenus: MenuItem[], newCats: Category[]) {
    // ReorderModal이 이미 order 값을 계산해서 넘겨줌 → 변경된 것만 필터
    const changedMenus = newMenus
      .filter((nm) => rows.find((r) => r.id === nm.id)?.order !== nm.order)
      .map((nm) => ({ id: nm.id, order: nm.order }));
    const changedCats = newCats
      .filter((nc) => categories.find((c) => c.id === nc.id)?.order !== nc.order)
      .map((nc) => ({ id: nc.id, order: nc.order }));

    setRows(newMenus);
    setCategories(newCats.sort((a, b) => a.order - b.order));
    setShowReorderModal(false);

    startTransition(async () => {
      try {
        await batchUpdateOrders(changedMenus, changedCats);
      } catch {
        setError("순서 저장에 실패했습니다. 페이지를 새로고침해 주세요.");
      }
    });
  }

  function handleDeleteCategory(id: string) {
    setCategories((prev) => prev.filter((c) => c.id !== id));
    startTransition(async () => {
      try {
        await deleteCategoryById(id);
      } catch {
        setError("카테고리 삭제에 실패했습니다.");
      }
    });
  }


  const categoryNameMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const hasSelection = selected.size > 0;
  const shownCols = COL_DEFS.filter((c) => visibleCols.has(c.key));
  const maxOrder = rows.reduce((m, r) => Math.max(m, r.order), 0);

  // ── 로딩 / 에러 ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="p-8 flex items-center gap-3 text-white/40">
        <span className="animate-spin">⏳</span> 메뉴를 불러오는 중...
      </div>
    );
  }

  // ── 렌더 ───────────────────────────────────────────────────────────────────

  return (
    <div className="p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">메뉴 관리</h2>
          <p className="text-white/40 text-sm mt-1">
            운세 메뉴의 노출 여부, 순서, 옵션을 관리합니다.
          </p>
        </div>
        {isPending && (
          <span className="text-xs text-white/30 animate-pulse mt-1">저장 중...</span>
        )}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/30 border border-red-700/50 text-red-300 text-sm flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-200">✕</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
        <button
          onClick={() => patch(null, { ready: true })}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/20 transition-colors"
        >
          👁 전체 노출
        </button>
        <button
          onClick={() => patch(null, { ready: false })}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
        >
          🚫 전체 미노출
        </button>

        <div className="w-px h-5 bg-white/10 mx-0.5" />

        <button
          onClick={() => setEditRow("new")}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-purple-300 border border-purple-800/60 hover:bg-purple-900/20 transition-colors"
        >
          ＋ 메뉴 추가
        </button>

        <button
          onClick={() => setShowQuickMenuModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-yellow-300 border border-yellow-800/60 hover:bg-yellow-900/20 transition-colors"
        >
          ⚡ Quick Menu
          {quickMenuIds.length > 0 && (
            <span className="bg-yellow-700/50 text-yellow-200 rounded-full px-1.5 text-[10px]">
              {quickMenuIds.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setShowHeroCardModal(true)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs text-purple-300 border border-purple-800/60 hover:bg-purple-900/20 transition-colors"
        >
          ✨ Hero 설정
        </button>

        {hasSelection && (
          <>
            <div className="w-px h-5 bg-white/10 mx-0.5" />
            <span className="text-white/30 text-xs">{selected.size}개 선택</span>

            <button
              onClick={() => patch(selected, { ready: true })}
              className="px-2.5 py-1.5 rounded-lg text-xs text-emerald-300/70 border border-white/10 hover:bg-white/5 transition-colors"
            >
              선택 노출
            </button>
            <button
              onClick={() => patch(selected, { ready: false })}
              className="px-2.5 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
            >
              선택 미노출
            </button>
            <button
              onClick={() => patch(selected, { ready: false })}
              className="px-2.5 py-1.5 rounded-lg text-xs text-white/50 border border-white/10 hover:bg-white/5 transition-colors"
            >
              선택 준비중
            </button>

            <div className="flex items-center gap-1">
              <select
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                className="px-2 py-1.5 rounded-lg text-xs bg-gray-800 border border-white/10 text-white/50 focus:outline-none focus:border-purple-500"
              >
                <option value="" className="bg-gray-800">카테고리 변환</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-gray-800">{c.name}</option>
                ))}
              </select>
              {bulkCategory && (
                <button
                  onClick={handleBulkCategory}
                  className="px-2 py-1.5 rounded-lg text-xs text-blue-300 border border-blue-800/50 hover:bg-blue-900/20 transition-colors"
                >
                  적용
                </button>
              )}
            </div>

            <button
              onClick={handleDelete}
              className="px-2.5 py-1.5 rounded-lg text-xs text-red-400 border border-red-900/50 hover:bg-red-900/20 transition-colors"
            >
              선택 삭제
            </button>
          </>
        )}

        <div className="flex-1" />

        <button
          onClick={() => setShowReorderModal(true)}
          className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors"
        >
          ↕ 순서 변경
        </button>
        <button
          onClick={() => setShowCategoryModal(true)}
          className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors"
        >
          📁 카테고리
        </button>
        <button
          onClick={() => setShowColModal(true)}
          className="px-2.5 py-1.5 rounded-lg text-xs text-white/40 border border-white/10 hover:bg-white/5 transition-colors"
        >
          ⚙ 옵션
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={selected.size === rows.length && rows.length > 0}
                    onChange={toggleAll}
                    className="accent-purple-500"
                  />
                </th>
                {shownCols.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortKey && handleSort(col.sortKey)}
                    className={`text-left px-4 py-3 text-white/40 font-medium whitespace-nowrap ${
                      col.sortKey ? "cursor-pointer hover:text-white/70 select-none" : ""
                    }`}
                  >
                    {col.label}
                    {col.sortKey && (
                      <span className="ml-1 text-xs">
                        {sortKey === col.sortKey
                          ? sortDir === "asc"
                            ? <span className="text-purple-400">▲</span>
                            : <span className="text-purple-400">▼</span>
                          : <span className="text-white/15">⇅</span>}
                      </span>
                    )}
                  </th>
                ))}
                <th className="text-left px-4 py-3 text-white/40 font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((row) => (
                <tr
                  key={row.id}
                  className={`hover:bg-white/5 transition-colors ${
                    selected.has(row.id) ? "bg-purple-900/10" : ""
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleOne(row.id)}
                      className="accent-purple-500"
                    />
                  </td>
                  {visibleCols.has("icon") && (
                    <td className="px-4 py-3 text-xl">{row.icon}</td>
                  )}
                  {visibleCols.has("nameKo") && (
                    <td className="px-4 py-3 min-w-[180px]">
                      <p className="text-white font-medium">{row.nameKo}</p>
                      <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{row.description}</p>
                    </td>
                  )}
                  {visibleCols.has("category") && (
                    <td className="px-4 py-3 text-white/50 text-xs whitespace-nowrap">
                      {categoryNameMap[row.category] ?? row.category}
                    </td>
                  )}
                  {visibleCols.has("ready") && (
                    <td className="px-4 py-3">
                      {row.ready ? (
                        <span className="text-[10px] text-emerald-300 bg-emerald-900/50 px-1.5 py-0.5 rounded-full">노출</span>
                      ) : (
                        <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded-full">준비중</span>
                      )}
                    </td>
                  )}
                  {visibleCols.has("isAI") && (
                    <td className="px-4 py-3">
                      {row.isAI ? (
                        <span className="text-[10px] text-purple-300 bg-purple-900/50 px-1.5 py-0.5 rounded-full">AI</span>
                      ) : (
                        <span className="text-white/20 text-xs">—</span>
                      )}
                    </td>
                  )}
                  {visibleCols.has("accessLevel") && (
                    <td className="px-4 py-3">
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${ACCESS_COLOR[row.accessLevel]}`}>
                        {ACCESS_LABEL[row.accessLevel]}
                      </span>
                    </td>
                  )}
                  {visibleCols.has("difficulty") && (
                    <td className="px-4 py-3 text-white/40 text-xs">
                      {DIFF_LABEL[row.difficulty] ?? row.difficulty}
                    </td>
                  )}
                  {visibleCols.has("tags") && (
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {row.tags.map((t) => (
                          <span key={t} className="text-[10px] text-white/40 bg-white/5 px-1.5 py-0.5 rounded-full">{t}</span>
                        ))}
                      </div>
                    </td>
                  )}
                  {visibleCols.has("path") && (
                    <td className="px-4 py-3 text-white/30 font-mono text-xs">{row.path}</td>
                  )}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditRow(row)}
                      className="text-xs text-white/60 border border-white/15 rounded px-2 py-1 hover:bg-white/10 hover:text-white transition-colors"
                    >
                      편집
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-white/20 text-xs mt-3">
        총 {rows.length}개 · {rows.filter((r) => r.ready).length}개 노출 중
      </p>

      {/* Modals */}
      {showColModal && (
        <ColModal
          visibleCols={visibleCols}
          onToggle={toggleCol}
          onClose={() => setShowColModal(false)}
        />
      )}
      {showReorderModal && (
        <ReorderModal
          initMenus={rows}
          initCategories={categories}
          onSave={handleSaveReorder}
          onClose={() => setShowReorderModal(false)}
        />
      )}
      {showCategoryModal && (
        <CategoryModal
          categories={categories}
          baseIds={baseIds}
          onAdd={handleAddCategory}
          onEdit={handleEditCategory}
          onDelete={handleDeleteCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}
      {showQuickMenuModal && (
        <QuickMenuModal
          menus={rows}
          initialIds={quickMenuIds}
          onSave={(ids) => {
            setQuickMenuIds(ids);
            setShowQuickMenuModal(false);
            startTransition(async () => {
              try {
                await saveQuickMenu(ids);
              } catch {
                setError("Quick Menu 저장에 실패했습니다.");
              }
            });
          }}
          onClose={() => setShowQuickMenuModal(false)}
        />
      )}
      {editRow !== null && (
        <FortuneModal
          initial={editRow === "new" ? null : editRow}
          maxOrder={maxOrder}
          categories={categories}
          onSave={handleSave}
          onClose={() => setEditRow(null)}
        />
      )}
      {showHeroCardModal && (
        <HeroCardModal
          initial={heroCardSettings}
          onSave={(settings) => {
            setHeroCardSettings(settings);
            setShowHeroCardModal(false);
            startTransition(async () => {
              try {
                await saveHeroCardSettings(settings);
              } catch {
                setError("Hero 설정 저장에 실패했습니다.");
              }
            });
          }}
          onClose={() => setShowHeroCardModal(false)}
        />
      )}
    </div>
  );
}
