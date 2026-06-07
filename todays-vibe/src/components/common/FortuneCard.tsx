type Props = {
  title: string;
  children?: React.ReactNode;
  empty?: boolean;
};

export default function FortuneCard({ title, children, empty }: Props) {
  return (
    <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
      <p className="text-white/40 text-xs mb-3">{title}</p>
      {empty ? (
        <div className="text-center py-6">
          <p className="text-white/30 text-sm">아직 운세가 준비되지 않았어요</p>
          <p className="text-white/20 text-xs mt-1">배치 생성 후 확인해주세요</p>
        </div>
      ) : (
        children
      )}
    </div>
  );
}
