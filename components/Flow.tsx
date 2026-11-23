/** A project's signal flow: stages joined by gold traces with a pulse running through. */
export default function Flow({ steps }: { steps: string[] }) {
  return (
    <ol className="flow" aria-label="How it works">
      {steps.map((s, i) => (
        <li key={s} className="flow__node" style={{ ["--i" as string]: i }}>
          <span className="flow__pad" aria-hidden />
          <span className="flow__label">{s}</span>
        </li>
      ))}
    </ol>
  );
}
