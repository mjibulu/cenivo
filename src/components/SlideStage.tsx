import { useEffect, useRef } from "react";
import { MonitorUp } from "lucide-react";
import { SLIDES } from "../demo/cast";

/** Stage for a shared screen: the visitor's real screen, or a simulated slide deck. */
export function SlideStage({ presenter, slide, screen }: { presenter: string; slide?: number; screen?: MediaStream | null }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && screen) videoRef.current.srcObject = screen;
  }, [screen]);

  const current = SLIDES[slide ?? 0];

  return (
    <section className="share-stage" aria-label={`${presenter} is presenting`}>
      <div className="share-label">
        <MonitorUp size={15} aria-hidden="true" />
        {presenter} is presenting
      </div>
      {screen ? (
        <video ref={videoRef} className="share-video" autoPlay muted playsInline />
      ) : (
        <div className="slide" key={slide} style={{ ["--accent" as string]: current.accent }}>
          <span className="slide-kicker">{current.kicker}</span>
          <h2>{current.title}</h2>
          <p>{current.body}</p>
          <div className="slide-progress" aria-label={`Slide ${(slide ?? 0) + 1} of ${SLIDES.length}`}>
            {SLIDES.map((_, index) => (
              <i key={index} className={index === slide ? "active" : ""} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
