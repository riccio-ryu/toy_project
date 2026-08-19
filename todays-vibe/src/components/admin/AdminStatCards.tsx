interface StatCard {
  label: string;
  value: string | number;
}

interface Props {
  cards: StatCard[];
}

export default function AdminStatCards({ cards }: Props) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {cards.map((s) => (
        <div key={s.label} className="rounded-xl bg-white/5 border border-white/10 px-5 py-4">
          <p className="text-white/40 text-xs mb-1">{s.label}</p>
          <p className="text-white text-2xl font-bold">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
