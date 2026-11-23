import { journey } from "@/data/site";
import { Stagger } from "./Motion";

/** The content-creation journey as a connected row of steps. */
export default function Journey() {
  return (
    <Stagger className="journey" gap={0.1}>
      {journey.map((j, i) => (
        <div key={j.title} className="journey__step">
          <span className="journey__dot" aria-hidden>
            {i + 1}
          </span>
          <h3 className="display">{j.title}</h3>
          <p>{j.text}</p>
        </div>
      ))}
    </Stagger>
  );
}
