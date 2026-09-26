import { useEffect, useRef, type CSSProperties } from "react";
import { Crown, Hand, MicOff, Pin } from "lucide-react";

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

export function AudioBars({ level }: { level: number }) {
  return (
    <span className="audio-bars" aria-hidden="true">
      {[0.6, 1, 0.75].map((weight, index) => (
        <i key={index} style={{ transform: `scaleY(${0.25 + Math.min(1, level * weight * 1.6) * 0.75})` }} />
      ))}
    </span>
  );
}

type TileProps = {
  /** Used for the initials */
  name: string;
  /** Shown under the tile; defaults to name */
  label?: string;
  detail?: string;
  palette: [string, string];
  stream?: MediaStream | null;
  mirror?: boolean;
  micOn: boolean;
  level: number;
  speaking: boolean;
  handRaised?: boolean;
  isHost?: boolean;
  pinned?: boolean;
  compact?: boolean;
  onPin?: () => void;
};

export function Tile({ name, label, detail, palette, stream, mirror, micOn, level, speaking, handRaised, isHost, pinned, compact, onPin }: TileProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasVideo = Boolean(stream?.getVideoTracks().some((t) => t.readyState === "live"));

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream, hasVideo]);

  const style = {
    "--c1": palette[0],
    "--c2": palette[1],
    "--level": speaking ? level : 0,
  } as CSSProperties;

  return (
    <figure className={["tile", speaking && "is-speaking", compact && "is-compact"].filter(Boolean).join(" ")} style={style}>
      {hasVideo ? (
        <video ref={videoRef} className={mirror ? "tile-video mirror" : "tile-video"} autoPlay muted playsInline />
      ) : (
        <div className="tile-avatar-stage" aria-hidden="true">
          <span className="blob blob-a" />
          <span className="blob blob-b" />
          <span className="avatar">
            <span className="avatar-ring" />
            {initials(name)}
          </span>
        </div>
      )}

      {handRaised && (
        <span className="tile-hand" title="Hand raised">
          <Hand size={16} aria-hidden="true" /> <span className="sr-only">Hand raised</span>
        </span>
      )}

      {onPin && (
        <button type="button" className={pinned ? "tile-pin active" : "tile-pin"} onClick={onPin} aria-label={pinned ? `Unpin ${name}` : `Pin ${name}`}>
          <Pin size={15} aria-hidden="true" />
        </button>
      )}

      <figcaption className="tile-name">
        {micOn ? <AudioBars level={speaking ? level : 0} /> : <MicOff size={14} className="muted-icon" aria-label="Muted" />}
        <span className="tile-name-text">{label ?? name}</span>
        {isHost && <Crown size={13} className="host-icon" aria-label="Host" />}
        {detail && !compact && <span className="tile-detail">{detail}</span>}
      </figcaption>
    </figure>
  );
}
