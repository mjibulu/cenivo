import { useState, type FormEvent } from "react";
import { ArrowLeft, Mic, MicOff, Video, VideoOff } from "lucide-react";
import { Brand } from "../components/Brand";
import { Tile, initials } from "../components/Tile";
import { CAST, HOST, MEETING_TITLE } from "../demo/cast";
import { navigate } from "../demo/router";
import { fallbackName, useSession } from "../demo/session";
import { useMicLevel } from "../demo/use-mic-level";

export function PreJoin() {
  const session = useSession();
  const { displayName, setDisplayName, stream, camOn, micOn, mediaError, cameras, microphones, cameraId, microphoneId } = session;
  const [busy, setBusy] = useState<"cam" | "mic" | null>(null);
  const level = useMicLevel(stream, micOn);

  const toggle = async (kind: "cam" | "mic") => {
    setBusy(kind);
    try {
      if (kind === "cam") await session.setCamera(!camOn);
      else await session.setMic(!micOn);
    } finally {
      setBusy(null);
    }
  };

  const join = (event: FormEvent) => {
    event.preventDefault();
    setDisplayName(displayName.trim());
    navigate("lobby");
  };

  const others = CAST.length - 1;

  return (
    <div className="page prejoin">
      <header className="page-header">
        <button type="button" className="btn btn-ghost" onClick={() => navigate("landing")}>
          <ArrowLeft size={18} aria-hidden="true" /> Back
        </button>
        <Brand onClick={() => navigate("landing")} />
        <span />
      </header>

      <main className="prejoin-body">
        <section className="preview-card" aria-label="Your preview">
          <Tile
            name={fallbackName(displayName)}
            palette={["#1d4ed8", "#0f766e"]}
            stream={stream}
            mirror
            micOn={micOn}
            level={level}
            speaking={level > 0.08}
          />
          <div className="preview-controls">
            <button
              type="button"
              className={micOn ? "round-btn" : "round-btn off"}
              onClick={() => toggle("mic")}
              disabled={busy !== null}
              aria-pressed={micOn}
              aria-label={micOn ? "Turn off microphone" : "Turn on microphone"}
            >
              {micOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <button
              type="button"
              className={camOn ? "round-btn" : "round-btn off"}
              onClick={() => toggle("cam")}
              disabled={busy !== null}
              aria-pressed={camOn}
              aria-label={camOn ? "Turn off camera" : "Turn on camera"}
            >
              {camOn ? <Video size={22} /> : <VideoOff size={22} />}
            </button>
          </div>
          <div className="mic-meter" aria-hidden={!micOn}>
            <span>{micOn ? (level > 0.08 ? "We can hear you" : "Say something to test your mic") : "Microphone off"}</span>
            <div className="meter-track">
              <i style={{ width: `${Math.round(level * 100)}%` }} />
            </div>
          </div>
          {mediaError && (
            <p className="media-error" role="alert">
              {mediaError}
            </p>
          )}
        </section>

        <form className="join-card" onSubmit={join}>
          <p className="eyebrow">Ready to join?</p>
          <h1>{MEETING_TITLE}</h1>
          <div className="attendees">
            <span className="avatar-stack" aria-hidden="true">
              {CAST.slice(0, 4).map((p) => (
                <span key={p.id} style={{ background: `linear-gradient(135deg, ${p.palette[0]}, ${p.palette[1]})` }}>
                  {initials(p.name)}
                </span>
              ))}
            </span>
            <span>
              {HOST.name.split(" ")[0]} and {others} others are in the meeting
            </span>
          </div>

          <label className="field">
            <span>Your name</span>
            <input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={40}
              autoComplete="name"
              autoFocus
            />
          </label>

          {cameras.length > 0 && (
            <label className="field">
              <span>Camera</span>
              <select value={cameraId} onChange={(e) => void session.chooseCamera(e.target.value)}>
                {cameras.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          {microphones.length > 0 && (
            <label className="field">
              <span>Microphone</span>
              <select value={microphoneId} onChange={(e) => void session.chooseMicrophone(e.target.value)}>
                {microphones.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${index + 1}`}
                  </option>
                ))}
              </select>
            </label>
          )}

          <button type="submit" className="btn btn-primary btn-lg btn-block">
            Join meeting
          </button>
          <p className="fine-print">Your camera and microphone stay on your device.</p>
        </form>
      </main>
    </div>
  );
}
