import { Crown, Hand, Mic, MicOff, UserX, X } from "lucide-react";
import type { Person } from "../demo/cast";
import type { RemoteState } from "../demo/use-meeting-sim";
import { initials } from "./Tile";

type Props = {
  localName: string;
  localMicOn: boolean;
  localHand: boolean;
  remotes: RemoteState[];
  waiting: Person[];
  onAdmit: (id: string) => void;
  onDeny: (id: string) => void;
  onMute: (id: string) => void;
  onMuteAll: () => void;
  onLowerHand: (id: string) => void;
  onRemove: (id: string) => void;
  onClose: () => void;
};

function Avatar({ name, palette }: { name: string; palette: [string, string] }) {
  return (
    <span className="person-avatar" style={{ background: `linear-gradient(135deg, ${palette[0]}, ${palette[1]})` }} aria-hidden="true">
      {initials(name)}
    </span>
  );
}

export function PeoplePanel({ localName, localMicOn, localHand, remotes, waiting, onAdmit, onDeny, onMute, onMuteAll, onLowerHand, onRemove, onClose }: Props) {
  // Raised hands first, in the order people usually expect
  const sorted = [...remotes].sort((a, b) => Number(b.handRaised) - Number(a.handRaised));

  return (
    <aside className="side-panel" aria-label="People">
      <header className="side-header">
        <h2>People</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close people">
          <X size={18} />
        </button>
      </header>

      <div className="people-scroll">
        {waiting.length > 0 && (
          <section className="people-section">
            <h3>Waiting to join · {waiting.length}</h3>
            {waiting.map((person) => (
              <div key={person.id} className="person-row waiting">
                <Avatar name={person.name} palette={person.palette} />
                <div className="person-text">
                  <strong>{person.name}</strong>
                  <span>{person.role}</span>
                </div>
                <div className="person-actions">
                  <button type="button" className="btn btn-small btn-ghost" onClick={() => onDeny(person.id)}>
                    Deny
                  </button>
                  <button type="button" className="btn btn-small btn-primary" onClick={() => onAdmit(person.id)}>
                    Admit
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        <section className="people-section">
          <div className="people-section-head">
            <h3>In the meeting · {remotes.length + 1}</h3>
            <button type="button" className="btn btn-small btn-ghost" onClick={onMuteAll}>
              Mute all
            </button>
          </div>

          <div className="person-row">
            <Avatar name={localName} palette={["#1d4ed8", "#0f766e"]} />
            <div className="person-text">
              <strong>{localName} (You)</strong>
              <span>Co-host</span>
            </div>
            <div className="person-status">
              {localHand && <Hand size={16} className="hand-icon" aria-label="Hand raised" />}
              {localMicOn ? <Mic size={16} aria-label="Microphone on" /> : <MicOff size={16} className="muted-icon" aria-label="Muted" />}
            </div>
          </div>

          {sorted.map(({ person, micOn, handRaised }) => (
            <div key={person.id} className="person-row">
              <Avatar name={person.name} palette={person.palette} />
              <div className="person-text">
                <strong>
                  {person.name} {person.isHost && <Crown size={13} className="host-icon" aria-label="Host" />}
                </strong>
                <span>
                  {person.isHost ? "Host" : person.role} · {person.location}
                </span>
              </div>
              <div className="person-status">
                {handRaised && <Hand size={16} className="hand-icon" aria-label="Hand raised" />}
                {micOn ? <Mic size={16} aria-label="Microphone on" /> : <MicOff size={16} className="muted-icon" aria-label="Muted" />}
              </div>
              {!person.isHost && (
                <div className="person-actions hover-actions">
                  {handRaised && (
                    <button type="button" className="icon-btn" onClick={() => onLowerHand(person.id)} aria-label={`Lower ${person.name}'s hand`} title="Lower hand">
                      <Hand size={16} />
                    </button>
                  )}
                  {micOn && (
                    <button type="button" className="icon-btn" onClick={() => onMute(person.id)} aria-label={`Mute ${person.name}`} title="Mute">
                      <MicOff size={16} />
                    </button>
                  )}
                  <button type="button" className="icon-btn danger" onClick={() => onRemove(person.id)} aria-label={`Remove ${person.name}`} title="Remove from meeting">
                    <UserX size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </section>
      </div>
    </aside>
  );
}
