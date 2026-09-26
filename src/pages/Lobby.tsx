import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Brand } from "../components/Brand";
import { initials } from "../components/Tile";
import { HOST, MEETING_TITLE } from "../demo/cast";
import { navigate } from "../demo/router";
import { fallbackName, useSession } from "../demo/session";

const ADMIT_AFTER_MS = 3500;

export function Lobby() {
  const { displayName } = useSession();
  const [admitted, setAdmitted] = useState(false);

  useEffect(() => {
    const admit = setTimeout(() => setAdmitted(true), ADMIT_AFTER_MS);
    const go = setTimeout(() => navigate("meeting"), ADMIT_AFTER_MS + 1100);
    return () => {
      clearTimeout(admit);
      clearTimeout(go);
    };
  }, []);

  return (
    <div className="page lobby">
      <header className="page-header">
        <span />
        <Brand />
        <span />
      </header>
      <main className="lobby-card" aria-live="polite">
        <div className={admitted ? "lobby-orb admitted" : "lobby-orb"} aria-hidden="true">
          <span>{initials(fallbackName(displayName))}</span>
        </div>
        {admitted ? (
          <>
            <h1>You're in</h1>
            <p>{HOST.name} let you in. Joining now…</p>
          </>
        ) : (
          <>
            <p className="eyebrow">
              <ShieldCheck size={15} aria-hidden="true" /> Waiting room
            </p>
            <h1>Waiting for the host</h1>
            <p>
              {HOST.name} will let you into <strong>{MEETING_TITLE}</strong> shortly.
            </p>
          </>
        )}
        <button type="button" className="btn btn-ghost" onClick={() => navigate("join")}>
          Leave waiting room
        </button>
      </main>
    </div>
  );
}
