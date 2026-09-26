import { CircleDot, Clock, MessageSquare, RotateCcw, Smile, Users } from "lucide-react";
import { Brand } from "../components/Brand";
import { MEETING_TITLE } from "../demo/cast";
import { navigate } from "../demo/router";
import { useSession } from "../demo/session";

const minutesAndSeconds = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m ? `${m} min ${s} s` : `${s} s`;
};

export function Summary() {
  const { summary } = useSession();

  const stats = summary
    ? [
        { icon: Clock, label: "Time in meeting", value: minutesAndSeconds(summary.durationSeconds) },
        { icon: Users, label: "People", value: String(summary.peopleCount) },
        { icon: MessageSquare, label: "Chat messages", value: String(summary.messageCount) },
        { icon: Smile, label: "Reactions", value: String(summary.reactionCount) },
        { icon: CircleDot, label: "Recorded", value: summary.recordingSeconds ? minutesAndSeconds(summary.recordingSeconds) : "Not recorded" },
      ]
    : [];

  return (
    <div className="page summary">
      <header className="page-header">
        <span />
        <Brand onClick={() => navigate("landing")} />
        <span />
      </header>
      <main className="summary-card">
        <p className="eyebrow">Meeting ended</p>
        <h1>You left {MEETING_TITLE}</h1>
        {stats.length > 0 && (
          <dl className="summary-stats">
            {stats.map(({ icon: Icon, label, value }) => (
              <div key={label} className="summary-stat">
                <Icon size={18} aria-hidden="true" />
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="summary-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={() => navigate("join")}>
            <RotateCcw size={18} aria-hidden="true" /> Rejoin
          </button>
          <a className="btn btn-ghost btn-lg" href="https://cenivo.com" rel="noopener">
            Visit cenivo.com
          </a>
        </div>
      </main>
    </div>
  );
}
