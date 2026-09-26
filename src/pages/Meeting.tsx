import { useCallback, useEffect, useRef, useState } from "react";
import {
  Captions,
  CircleDot,
  Copy,
  Hand,
  LayoutGrid,
  MessageSquare,
  Mic,
  MicOff,
  MonitorOff,
  MonitorUp,
  PhoneOff,
  Presentation,
  Signal,
  Smile,
  Users,
  Video,
  VideoOff,
  X,
} from "lucide-react";
import { Brand } from "../components/Brand";
import { ChatPanel } from "../components/ChatPanel";
import { PeoplePanel } from "../components/PeoplePanel";
import { SlideStage } from "../components/SlideStage";
import { Tile } from "../components/Tile";
import { MEETING_TITLE, REACTIONS } from "../demo/cast";
import { navigate } from "../demo/router";
import { fallbackName, useSession } from "../demo/session";
import { useMicLevel } from "../demo/use-mic-level";
import { LOCAL_ID, useMeetingSim } from "../demo/use-meeting-sim";

type Panel = "chat" | "people" | null;
type Layout = "grid" | "speaker";

const formatTime = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mm = String(m).padStart(h ? 2 : 1, "0");
  return `${h ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
};

const canShareScreen = () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getDisplayMedia);

function gridColumns(count: number) {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  if (count <= 9) return 3;
  return 4;
}

export function Meeting() {
  const session = useSession();
  const localName = fallbackName(session.displayName);
  const level = useMicLevel(session.stream, session.micOn);
  const sim = useMeetingSim({ localName, localLevel: level, localMicOn: session.micOn });

  const [panel, setPanelState] = useState<Panel>(null);
  const [layout, setLayout] = useState<Layout>("grid");
  const [pinned, setPinned] = useState<string | null>(null);
  const [handRaised, setHandRaised] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [reactionTray, setReactionTray] = useState(false);
  const [recordingSince, setRecordingSince] = useState<number | null>(null);
  const [recordedSeconds, setRecordedSeconds] = useState(0);
  const [screen, setScreen] = useState<MediaStream | null>(null);
  const screenRef = useRef<MediaStream | null>(null);

  const setPanel = useCallback(
    (next: Panel) => {
      setPanelState(next);
      sim.setChatOpen(next === "chat");
    },
    [sim.setChatOpen],
  );

  const togglePanel = (next: Exclude<Panel, null>) => setPanel(panel === next ? null : next);

  const recordingFor = recordingSince === null ? 0 : sim.elapsed - recordingSince;

  const toggleRecording = () => {
    if (recordingSince === null) {
      setRecordingSince(sim.elapsed);
      sim.pushToast("Recording started. Everyone can see the REC indicator.");
    } else {
      setRecordedSeconds((s) => s + recordingFor);
      setRecordingSince(null);
      sim.pushToast(`Recording saved (${formatTime(recordingFor)})`);
    }
  };

  const stopScreen = useCallback(() => {
    screenRef.current?.getTracks().forEach((t) => t.stop());
    screenRef.current = null;
    setScreen(null);
  }, []);

  const toggleScreen = async () => {
    if (screen) {
      stopScreen();
      return;
    }
    try {
      const media = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      media.getVideoTracks()[0].addEventListener("ended", stopScreen);
      screenRef.current = media;
      setScreen(media);
      sim.stopPresentation();
      sim.pushToast("You are presenting to everyone");
    } catch {
      // Picker was cancelled
    }
  };

  const toggleHand = () => {
    setHandRaised((raised) => {
      if (!raised) sim.pushToast("You raised your hand ✋");
      return !raised;
    });
  };

  const copyInvite = async () => {
    const link = `${window.location.origin}${window.location.pathname}#/join`;
    try {
      await navigator.clipboard.writeText(link);
      sim.pushToast("Invite link copied");
    } catch {
      sim.pushToast(link);
    }
  };

  const leave = () => {
    const recording = recordedSeconds + recordingFor;
    session.setSummary({
      durationSeconds: sim.elapsed,
      peopleCount: sim.peakPeople,
      messageCount: sim.messages.length,
      reactionCount: sim.reactionCount,
      recordingSeconds: recording,
    });
    stopScreen();
    session.stopMedia();
    navigate("summary");
  };

  // Keyboard shortcuts, ignored while typing
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.ctrlKey || event.metaKey || event.altKey || target?.closest("input, textarea, select")) return;
      const key = event.key.toLowerCase();
      if (key === "m") void session.setMic(!session.micOn);
      else if (key === "v") void session.setCamera(!session.camOn);
      else if (key === "h") toggleHand();
      else if (key === "c") togglePanel("chat");
      else if (key === "p") togglePanel("people");
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => stopScreen, [stopScreen]);

  // Tiles for everyone, local first
  const tiles = [
    {
      id: LOCAL_ID,
      name: localName,
      label: session.displayName.trim() ? `${localName} (You)` : "You",
      detail: undefined as string | undefined,
      palette: ["#1d4ed8", "#0f766e"] as [string, string],
      stream: session.stream,
      mirror: true,
      micOn: session.micOn,
      level,
      handRaised,
      isHost: false,
    },
    ...sim.remotes.map((r) => ({
      id: r.person.id,
      name: r.person.name,
      label: r.person.name,
      detail: r.person.location,
      palette: r.person.palette,
      stream: null,
      mirror: false,
      micOn: r.micOn,
      level: sim.levels[r.person.id] ?? 0,
      handRaised: r.handRaised,
      isHost: r.person.isHost,
    })),
  ];

  const renderTile = (tile: (typeof tiles)[number], compact = false) => (
    <Tile
      key={tile.id}
      name={tile.name}
      label={tile.label}
      detail={tile.detail}
      palette={tile.palette}
      stream={tile.stream}
      mirror={tile.mirror}
      micOn={tile.micOn}
      level={tile.level}
      speaking={sim.activeSpeaker === tile.id && tile.micOn}
      handRaised={tile.handRaised}
      isHost={tile.isHost}
      compact={compact}
      pinned={pinned === tile.id}
      onPin={() => {
        setPinned((current) => (current === tile.id ? null : tile.id));
        setLayout("speaker");
      }}
    />
  );

  const presenterName = screen ? "You" : sim.presentation ? sim.remotes.find((r) => r.person.id === sim.presentation?.presenterId)?.person.name : null;
  const featuredId = pinned && tiles.some((t) => t.id === pinned) ? pinned : sim.activeSpeaker;
  const featured = tiles.find((t) => t.id === featuredId) ?? tiles[0];
  const captionSpeaker = sim.caption ? sim.remotes.find((r) => r.person.id === sim.caption?.speakerId)?.person.name : null;

  return (
    <div className={panel ? "meeting with-panel" : "meeting"}>
      <header className="meeting-top">
        <Brand />
        <div className="meeting-title">
          <h1>{MEETING_TITLE}</h1>
          <span className="meeting-clock">{formatTime(sim.elapsed)}</span>
        </div>
        <div className="meeting-top-right">
          {recordingSince !== null && (
            <span className="rec-badge" role="status">
              <CircleDot size={14} aria-hidden="true" /> REC {formatTime(recordingFor)}
            </span>
          )}
          <span className="signal" title="Connection: excellent">
            <Signal size={16} aria-hidden="true" />
            <span className="sr-only">Connection: excellent</span>
          </span>
          <button type="button" className="btn btn-ghost btn-small" onClick={copyInvite}>
            <Copy size={15} aria-hidden="true" /> <span className="hide-sm">Copy invite</span>
          </button>
        </div>
      </header>

      <div className="meeting-body">
        <main className="stage-area">
          {presenterName ? (
            <div className="stage presenting">
              <SlideStage presenter={presenterName} slide={sim.presentation?.slide} screen={screen} />
              <div className="filmstrip">{tiles.map((t) => renderTile(t, true))}</div>
            </div>
          ) : layout === "speaker" ? (
            <div className="stage speaker">
              <div className="featured">{renderTile(featured)}</div>
              <div className="filmstrip">{tiles.filter((t) => t.id !== featured.id).map((t) => renderTile(t, true))}</div>
            </div>
          ) : (
            <div
              className="stage grid"
              style={{ ["--cols" as string]: gridColumns(tiles.length), ["--rows" as string]: Math.ceil(tiles.length / gridColumns(tiles.length)) }}
            >
              {tiles.map((t) => renderTile(t))}
            </div>
          )}

          {captionsOn && sim.caption && captionSpeaker && sim.activeSpeaker !== LOCAL_ID && (
            <div className="captions" aria-live="polite">
              <strong>{captionSpeaker}</strong> {sim.caption.text}
            </div>
          )}

          <div className="reaction-layer" aria-hidden="true">
            {sim.reactions.map((r) => (
              <span key={r.id} className="floating-reaction" style={{ left: `${r.left}%` }}>
                <span className="emoji">{r.emoji}</span>
                <span className="who">{r.name.split(" ")[0]}</span>
              </span>
            ))}
          </div>

          <div className="toasts" role="status" aria-live="polite">
            {sim.toasts.map((toast) => (
              <div key={toast.id} className={toast.kind === "admit" ? "toast admit" : "toast"}>
                <span>{toast.text}</span>
                {toast.kind === "admit" && sim.waiting[0] && (
                  <>
                    <button type="button" className="btn btn-small btn-primary" onClick={() => sim.admit(sim.waiting[0].id)}>
                      Admit
                    </button>
                    <button type="button" className="icon-btn" onClick={() => sim.dismissToast(toast.id)} aria-label="Dismiss">
                      <X size={16} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </main>

        {panel === "chat" && <ChatPanel messages={sim.messages} onSend={sim.sendMessage} onClose={() => setPanel(null)} />}
        {panel === "people" && (
          <PeoplePanel
            localName={localName}
            localMicOn={session.micOn}
            localHand={handRaised}
            remotes={sim.remotes}
            waiting={sim.waiting}
            onAdmit={sim.admit}
            onDeny={sim.deny}
            onMute={sim.muteRemote}
            onMuteAll={sim.muteAll}
            onLowerHand={sim.lowerHand}
            onRemove={(id) => {
              if (pinned === id) setPinned(null);
              sim.removeRemote(id);
            }}
            onClose={() => setPanel(null)}
          />
        )}
      </div>

      {session.mediaError && <p className="media-error floating">{session.mediaError}</p>}

      <footer className="control-bar">
        <div className="controls-left hide-sm">
          <span className="meeting-clock">{formatTime(sim.elapsed)}</span>
        </div>

        <div className="controls-center">
          <button type="button" className={session.micOn ? "ctrl" : "ctrl off"} onClick={() => void session.setMic(!session.micOn)} aria-pressed={session.micOn} title="Microphone (M)">
            {session.micOn ? <Mic size={20} /> : <MicOff size={20} />}
            <span className="ctrl-label">{session.micOn ? "Mute" : "Unmute"}</span>
          </button>
          <button type="button" className={session.camOn ? "ctrl" : "ctrl off"} onClick={() => void session.setCamera(!session.camOn)} aria-pressed={session.camOn} title="Camera (V)">
            {session.camOn ? <Video size={20} /> : <VideoOff size={20} />}
            <span className="ctrl-label">{session.camOn ? "Stop video" : "Start video"}</span>
          </button>
          {canShareScreen() && (
            <button type="button" className={screen ? "ctrl active" : "ctrl"} onClick={() => void toggleScreen()} aria-pressed={Boolean(screen)} title="Share screen">
              {screen ? <MonitorOff size={20} /> : <MonitorUp size={20} />}
              <span className="ctrl-label">{screen ? "Stop sharing" : "Share"}</span>
            </button>
          )}
          <button type="button" className={handRaised ? "ctrl active" : "ctrl"} onClick={toggleHand} aria-pressed={handRaised} title="Raise hand (H)">
            <Hand size={20} />
            <span className="ctrl-label">{handRaised ? "Lower" : "Raise"}</span>
          </button>
          <div className="tray-anchor">
            <button type="button" className={reactionTray ? "ctrl active" : "ctrl"} onClick={() => setReactionTray((o) => !o)} aria-expanded={reactionTray} title="Reactions">
              <Smile size={20} />
              <span className="ctrl-label">React</span>
            </button>
            {reactionTray && (
              <div className="reaction-tray" role="menu">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      sim.react(emoji);
                      setReactionTray(false);
                    }}
                    aria-label={`React with ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="button" className={captionsOn ? "ctrl active" : "ctrl"} onClick={() => setCaptionsOn((c) => !c)} aria-pressed={captionsOn} title="Captions">
            <Captions size={20} />
            <span className="ctrl-label">Captions</span>
          </button>
          <button type="button" className={recordingSince !== null ? "ctrl recording" : "ctrl"} onClick={toggleRecording} aria-pressed={recordingSince !== null} title="Record">
            <CircleDot size={20} />
            <span className="ctrl-label">{recordingSince !== null ? "Stop rec" : "Record"}</span>
          </button>
          <button
            type="button"
            className="ctrl hide-sm"
            onClick={() => {
              setLayout((l) => (l === "grid" ? "speaker" : "grid"));
              setPinned(null);
            }}
            title="Change layout"
          >
            {layout === "grid" ? <Presentation size={20} /> : <LayoutGrid size={20} />}
            <span className="ctrl-label">{layout === "grid" ? "Speaker" : "Grid"}</span>
          </button>
          <button type="button" className="ctrl leave" onClick={leave} title="Leave meeting">
            <PhoneOff size={20} />
            <span className="ctrl-label">Leave</span>
          </button>
        </div>

        <div className="controls-right">
          <button type="button" className={panel === "people" ? "ctrl active" : "ctrl"} onClick={() => togglePanel("people")} aria-pressed={panel === "people"} title="People (P)">
            <Users size={20} />
            <span className="ctrl-label">People</span>
            <span className="count">{sim.remotes.length + 1}</span>
            {sim.waiting.length > 0 && <span className="dot" aria-label={`${sim.waiting.length} waiting`} />}
          </button>
          <button type="button" className={panel === "chat" ? "ctrl active" : "ctrl"} onClick={() => togglePanel("chat")} aria-pressed={panel === "chat"} title="Chat (C)">
            <MessageSquare size={20} />
            <span className="ctrl-label">Chat</span>
            {sim.unread > 0 && <span className="badge">{sim.unread}</span>}
          </button>
        </div>
      </footer>
    </div>
  );
}
