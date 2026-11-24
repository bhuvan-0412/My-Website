"use client";

import { useEffect, useRef } from "react";

/** A 9:16 frame. Plays a local clip while in view when one is supplied, otherwise shows a title card. */
export default function ReelFrame({
  title,
  note,
  url,
  video,
  badge = "/60",
}: {
  title: string;
  note: string;
  url: string;
  video?: string;
  badge?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.5 }
    );
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <a className="reel" href={url} target="_blank" rel="noreferrer">
      <div className="reel__screen">
        {video ? (
          <video ref={ref} src={video} muted loop playsInline preload="metadata" />
        ) : (
          <div className="reel__card" aria-hidden>
            <span className="reel__day">{title}</span>
            <span className="reel__of">{badge}</span>
          </div>
        )}
        <span className="reel__play" aria-hidden>
          <svg viewBox="0 0 24 24" width="22" height="22">
            <path d="M8 5.5v13l10.5-6.5z" fill="currentColor" />
          </svg>
        </span>
      </div>
      <p className="reel__title">{title}</p>
      <p className="reel__note">{note}</p>
    </a>
  );
}
