export function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="font-medium mb-2">{title}</div>
      {children}
    </div>
  );
}
