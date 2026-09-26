import { useEffect, useState } from "react";
import { ArrowRight, Captions, CircleDot, Hand, ShieldCheck, Users } from "lucide-react";
import { Brand } from "../components/Brand";
import { Tile } from "../components/Tile";
import { CAST, MEETING_TITLE } from "../demo/cast";
import { navigate } from "../demo/router";

const PREVIEW = CAST.slice(0, 6);

/** Small self-running meeting for the hero */
function MiniMeeting() {
  const [speaker, setSpeaker] = useState(0);
  const [level, setLevel] = useState(0.5);
  const [emoji, setEmoji] = useState<{ id: number; value: string } | null>(null);

  useEffect(() => {
    const rotate = setInterval(() => setSpeaker((s) => (s + 1 + Math.floor(Math.random() * 3)) % PREVIEW.length), 2600);
    let phase = 0;
    const pulse = setInterval(() => {
      phase += 0.9;
      setLevel(0.35 + Math.abs(Math.sin(phase)) * 0.5 * Math.random() + 0.15);
    }, 130);
    const react = setInterval(() => setEmoji({ id: Date.now(), value: ["👏", "👍", "🎉", "❤️"][Math.floor(Math.random() * 4)] }), 3400);
    return () => {
      clearInterval(rotate);
      clearInterval(pulse);
      clearInterval(react);
    };
  }, []);

  return (
    <div className="mini-meeting" aria-hidden="true">
      <div className="mini-topbar">
        <span className="live-dot" /> {MEETING_TITLE}
        <span className="mini-rec">
          <CircleDot size={12} /> REC
        </span>
      </div>
      <div className="mini-grid">
        {PREVIEW.map((person, index) => (
          <Tile
            key={person.id}
            name={person.name}
            palette={person.palette}
            micOn={index !== 4}
            level={level}
            speaking={index === speaker && index !== 4}
            handRaised={index === 2}
            isHost={person.isHost}
            compact
          />
        ))}
      </div>
      {emoji && (
        <span key={emoji.id} className="mini-reaction">
          {emoji.value}
        </span>
      )}
      <div className="mini-caption">
        <strong>{PREVIEW[speaker].name.split(" ")[0]}:</strong> {PREVIEW[speaker].lines[0]}
      </div>
    </div>
  );
}

const FEATURES = [
  { icon: ShieldCheck, title: "Waiting room", text: "Guests wait until the host lets them in." },
  { icon: Captions, title: "Live captions", text: "Follow every speaker, even on mute." },
  { icon: CircleDot, title: "Recording", text: "Record the meeting with one click." },
  { icon: Hand, title: "Hands and reactions", text: "Raise a hand or react without interrupting." },
];

export function Landing() {
  return (
    <div className="landing">
      <header className="landing-header">
        <Brand />
        <a className="text-link" href="https://cenivo.com" rel="noopener">
          cenivo.com
        </a>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="pill">
              Demo
            </span>
            <h1>
              Step into a live
              <br />
              <span className="gradient-text">Cenivo meeting.</span>
            </h1>
            <p>
              Join a product team mid-meeting. Turn on your camera, talk, chat, react, admit a late guest and record the
              call, right here in your browser.
            </p>
            <div className="hero-actions">
              <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate("join")}>
                Join the demo meeting <ArrowRight size={18} aria-hidden="true" />
              </button>
              <span className="hero-note">
                <Users size={15} aria-hidden="true" /> 8 people are in the room
              </span>
            </div>
          </div>
          <MiniMeeting />
        </section>

        <section className="features" aria-label="What you can try">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <article key={title} className="feature">
              <span className="feature-icon">
                <Icon size={20} aria-hidden="true" />
              </span>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </section>
      </main>

      <footer className="landing-footer">
        <p>Your camera and microphone stay on your device.</p>
        <a className="text-link" href="https://cenivo.com" rel="noopener">
          Visit cenivo.com
        </a>
      </footer>
    </div>
  );
}
