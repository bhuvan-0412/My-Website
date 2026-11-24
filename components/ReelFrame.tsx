"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

/** 4264 → "4.3K" */
const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}K` : String(n));

/** Instagram reel id from a reel URL, e.g. ".../reel/DcASSYVMnSe/" → "DcASSYVMnSe". */
const reelId = (url: string) => url.match(/\/reel\/([^/?#]+)/)?.[1];

/**
 * A 9:16 reel card. Clicking it plays the reel right here, in Instagram's own player,
 * inside a lightbox (with a link out to Instagram). A local clip, if supplied, plays on the card.
 */
export default function ReelFrame({
  title,
  note,
  url,
  video,
  badge = "/60",
  likes,
  views,
}: {
  title: string;
  note: string;
  url: string;
  video?: string;
  badge?: string;
  likes?: number;
  views?: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [open, setOpen] = useState(false);
  const id = reelId(url);

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

  // While the player is open: no page scroll, Esc closes it.
  useEffect(() => {
    if (!open) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", key);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <>
      <a
        className="reel"
        href={url}
        target="_blank"
        rel="noreferrer"
        data-cursor="Play"
        onClick={(e) => {
          if (!id || e.metaKey || e.ctrlKey) return;
          e.preventDefault();
          setOpen(true);
        }}
      >
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
          {views || likes ? (
            <span className="reel__likes" aria-label={`${views ?? 0} views, ${likes ?? 0} likes`}>
              {views ? (
                <>
                  <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden>
                    <path d="M7 4.5v15l13-7.5z" fill="currentColor" />
                  </svg>
                  {compact(views)}
                </>
              ) : null}
              {likes ? (
                <>
                  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden>
                    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.7 1.2 4.3 2.6.6-1.4 2.2-2.6 4.3-2.6 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill="currentColor" />
                  </svg>
                  {likes}
                </>
              ) : null}
            </span>
          ) : null}
        </div>
        <p className="reel__title">{title}</p>
        <p className="reel__note">{note}</p>
      </a>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && id && (
              <motion.div
                className="player"
                role="dialog"
                aria-modal="true"
                aria-label={`${title} reel`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                onClick={() => setOpen(false)}
              >
                <motion.div
                  className="player__frame"
                  initial={{ y: 60, scale: 0.92, rotate: -2 }}
                  animate={{ y: 0, scale: 1, rotate: 0 }}
                  exit={{ y: 40, scale: 0.95, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 24 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <iframe
                    src={`https://www.instagram.com/reel/${id}/embed/`}
                    title={`${title}: ${note}`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </motion.div>
                <div className="player__bar" onClick={(e) => e.stopPropagation()}>
                  <a className="pill pill--ghost-light" href={url} target="_blank" rel="noreferrer">
                    Open on Instagram
                  </a>
                  <button type="button" className="pill pill--tangerine" onClick={() => setOpen(false)}>
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
