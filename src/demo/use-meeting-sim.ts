import { useCallback, useEffect, useRef, useState } from "react";
import { CAST, LATE_JOINER, REACTIONS, REPLIES, SCRIPTED_CHAT, SLIDES, TIMELINE, type Person } from "./cast";

export const LOCAL_ID = "local";

export type RemoteState = {
  person: Person;
  micOn: boolean;
  handRaised: boolean;
};

export type ChatMessage = { id: number; from: string; name: string; text: string; time: string; mine?: boolean };
export type FloatingReaction = { id: number; emoji: string; name: string; left: number };
export type Toast = { id: number; text: string; kind?: "admit" | "info" };
export type Presentation = { presenterId: string; slide: number } | null;

const clock = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const pick = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];

type Options = { localName: string; localLevel: number; localMicOn: boolean };

export function useMeetingSim({ localName, localLevel, localMicOn }: Options) {
  const [elapsed, setElapsed] = useState(0);
  const [remotes, setRemotes] = useState<RemoteState[]>(() =>
    CAST.map((person, index) => ({ person, micOn: index % 4 !== 3, handRaised: false })),
  );
  const [waiting, setWaiting] = useState<Person[]>([]);
  const [activeSpeaker, setActiveSpeaker] = useState<string>(CAST[0].id);
  const [levels, setLevels] = useState<Record<string, number>>({});
  const [caption, setCaption] = useState<{ speakerId: string; text: string } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unread, setUnread] = useState(0);
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [reactionCount, setReactionCount] = useState(0);
  const [presentation, setPresentation] = useState<Presentation>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [peakPeople, setPeakPeople] = useState(CAST.length + 1);

  const idRef = useRef(1);
  const nextId = () => idRef.current++;
  const lineIndex = useRef<Record<string, number>>({});
  const remotesRef = useRef(remotes);
  remotesRef.current = remotes;
  const speakerRef = useRef(activeSpeaker);
  speakerRef.current = activeSpeaker;
  const presentationRef = useRef(presentation);
  presentationRef.current = presentation;
  const localSpeakingUntil = useRef(0);
  const repliesSent = useRef(0);
  const chatOpenRef = useRef(false);

  const pushToast = useCallback((text: string, kind: Toast["kind"] = "info") => {
    const id = nextId();
    setToasts((all) => [...all.slice(-3), { id, text, kind }]);
    if (kind !== "admit") setTimeout(() => setToasts((all) => all.filter((t) => t.id !== id)), 4500);
  }, []);

  const dismissToast = useCallback((id: number) => setToasts((all) => all.filter((t) => t.id !== id)), []);

  const addMessage = useCallback((from: string, name: string, text: string, mine = false) => {
    setMessages((all) => [...all, { id: nextId(), from, name, text, time: clock(), mine }]);
    if (!mine && !chatOpenRef.current) setUnread((n) => n + 1);
  }, []);

  const floatReaction = useCallback((emoji: string, name: string) => {
    const id = nextId();
    setReactions((all) => [...all, { id, emoji, name, left: 8 + Math.random() * 30 }]);
    setReactionCount((n) => n + 1);
    setTimeout(() => setReactions((all) => all.filter((r) => r.id !== id)), 3600);
  }, []);

  const nextLine = useCallback((person: Person) => {
    const index = lineIndex.current[person.id] ?? 0;
    lineIndex.current[person.id] = index + 1;
    return person.lines[index % person.lines.length];
  }, []);

  const personById = (id: string) => remotesRef.current.find((r) => r.person.id === id)?.person;

  // Meeting clock and scripted events
  useEffect(() => {
    const timer = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    for (const item of SCRIPTED_CHAT) {
      if (item.at === elapsed) {
        const person = personById(item.from);
        if (person) addMessage(person.id, person.name, item.text);
      }
    }
    if (elapsed === TIMELINE.handRaise) {
      setRemotes((all) => all.map((r) => (r.person.id === "aisha" ? { ...r, handRaised: true } : r)));
      pushToast("Aisha Khan raised a hand ✋");
    }
    if (elapsed === TIMELINE.handLower) {
      setRemotes((all) => all.map((r) => (r.person.id === "aisha" ? { ...r, handRaised: false } : r)));
    }
    if (elapsed === TIMELINE.lateJoiner) {
      setWaiting([LATE_JOINER]);
      pushToast(`${LATE_JOINER.name} is waiting to join`, "admit");
    }
    if (elapsed === TIMELINE.presentationStart && remotesRef.current.some((r) => r.person.id === "sofia")) {
      setPresentation({ presenterId: "sofia", slide: 0 });
      setActiveSpeaker("sofia");
      pushToast("Sofia Lindqvist started presenting");
    }
    if (presentationRef.current && elapsed > TIMELINE.presentationStart && (elapsed - TIMELINE.presentationStart) % 12 === 0) {
      setPresentation((p) => (p && p.slide < SLIDES.length - 1 ? { ...p, slide: p.slide + 1 } : p));
    }
    if (elapsed === TIMELINE.presentationEnd) setPresentation(null);
    // Ambient reactions and chat once the script has played
    if (elapsed > 20 && elapsed % 17 === 0) {
      const r = pick(remotesRef.current);
      floatReaction(pick(REACTIONS), r.person.name);
    }
  }, [elapsed, addMessage, floatReaction, pushToast]);

  // Speaker rotation and captions
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const rotate = () => {
      if (Date.now() < localSpeakingUntil.current) {
        timer = setTimeout(rotate, 800);
        return;
      }
      const talkers = remotesRef.current.filter((r) => r.micOn);
      const presenter = presentationRef.current?.presenterId;
      let next: Person | undefined;
      if (presenter && Math.random() < 0.65) next = personById(presenter);
      if (!next && talkers.length) {
        const others = talkers.filter((r) => r.person.id !== speakerRef.current);
        next = pick(others.length ? others : talkers).person;
      }
      if (next) {
        setActiveSpeaker(next.id);
        setCaption({ speakerId: next.id, text: nextLine(next) });
      }
      timer = setTimeout(rotate, 3800 + Math.random() * 3200);
    };
    const first = personById(speakerRef.current);
    if (first) setCaption({ speakerId: first.id, text: nextLine(first) });
    timer = setTimeout(rotate, 3500);
    return () => clearTimeout(timer);
  }, [nextLine]);

  // The visitor takes the floor when they actually speak
  useEffect(() => {
    if (localMicOn && localLevel > 0.12) {
      localSpeakingUntil.current = Date.now() + 1500;
      if (speakerRef.current !== LOCAL_ID) {
        setActiveSpeaker(LOCAL_ID);
        setCaption(null);
      }
    }
  }, [localLevel, localMicOn]);

  // Audio levels for the active remote speaker
  useEffect(() => {
    let phase = 0;
    const timer = setInterval(() => {
      phase += 0.9;
      const speaker = speakerRef.current;
      const speaking = remotesRef.current.find((r) => r.person.id === speaker && r.micOn);
      const value = speaking ? Math.max(0.12, 0.45 + 0.35 * Math.sin(phase) * Math.random() + Math.random() * 0.2) : 0;
      setLevels(speaking ? { [speaker]: Math.min(1, value) } : {});
    }, 120);
    return () => clearInterval(timer);
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      addMessage(LOCAL_ID, localName, text, true);
      if (repliesSent.current < REPLIES.length) {
        const reply = REPLIES[repliesSent.current++];
        const person = personById(reply.from);
        if (person) setTimeout(() => addMessage(person.id, person.name, reply.text(localName)), 1800 + Math.random() * 1500);
      }
    },
    [addMessage, localName],
  );

  const react = useCallback((emoji: string) => floatReaction(emoji, localName), [floatReaction, localName]);

  const admit = useCallback(
    (id: string) => {
      const person = waiting.find((p) => p.id === id);
      if (!person) return;
      setWaiting((all) => all.filter((p) => p.id !== id));
      setRemotes((all) => [...all, { person, micOn: true, handRaised: false }]);
      setPeakPeople((n) => n + 1);
      setToasts((all) => all.filter((t) => t.kind !== "admit"));
      pushToast(`${person.name} joined`);
      setTimeout(() => {
        setActiveSpeaker(person.id);
        setCaption({ speakerId: person.id, text: nextLine(person) });
      }, 1200);
    },
    [waiting, pushToast, nextLine],
  );

  const deny = useCallback((id: string) => {
    setWaiting((all) => all.filter((p) => p.id !== id));
    setToasts((all) => all.filter((t) => t.kind !== "admit"));
  }, []);

  const muteRemote = useCallback(
    (id: string) => {
      setRemotes((all) => all.map((r) => (r.person.id === id ? { ...r, micOn: false } : r)));
      if (speakerRef.current === id) setCaption(null);
      const person = personById(id);
      if (person) pushToast(`You muted ${person.name}`);
    },
    [pushToast],
  );

  const muteAll = useCallback(() => {
    setRemotes((all) => all.map((r) => (r.person.isHost ? r : { ...r, micOn: false })));
    pushToast("Everyone except the host is muted");
  }, [pushToast]);

  const lowerHand = useCallback((id: string) => {
    setRemotes((all) => all.map((r) => (r.person.id === id ? { ...r, handRaised: false } : r)));
  }, []);

  const removeRemote = useCallback(
    (id: string) => {
      const person = personById(id);
      setRemotes((all) => all.filter((r) => r.person.id !== id));
      if (presentationRef.current?.presenterId === id) setPresentation(null);
      if (person) pushToast(`${person.name} was removed from the meeting`);
    },
    [pushToast],
  );

  const setChatOpen = useCallback((open: boolean) => {
    chatOpenRef.current = open;
    if (open) setUnread(0);
  }, []);

  return {
    elapsed,
    remotes,
    waiting,
    activeSpeaker,
    levels,
    caption,
    messages,
    unread,
    reactions,
    reactionCount,
    presentation,
    stopPresentation: () => setPresentation(null),
    toasts,
    peakPeople,
    pushToast,
    dismissToast,
    sendMessage,
    react,
    admit,
    deny,
    muteRemote,
    muteAll,
    lowerHand,
    removeRemote,
    setChatOpen,
  };
}

export type MeetingSim = ReturnType<typeof useMeetingSim>;
