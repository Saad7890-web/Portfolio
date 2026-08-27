export function Band({
  label,
  id,
  children,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} aria-label={label} className="border-hairline shell border-t py-14">
      <h2 className="text-faint mb-6 text-[0.72rem] tracking-[0.18em] uppercase">{label}</h2>
      {children}
    </section>
  );
}
