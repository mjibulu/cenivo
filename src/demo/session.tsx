import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

export type MeetingSummary = {
  durationSeconds: number;
  peopleCount: number;
  messageCount: number;
  reactionCount: number;
  recordingSeconds: number;
};

type Session = {
  displayName: string;
  setDisplayName: (name: string) => void;
  /** Local camera and microphone. Never leaves the browser. */
  stream: MediaStream | null;
  camOn: boolean;
  micOn: boolean;
  mediaError: string | null;
  cameras: MediaDeviceInfo[];
  microphones: MediaDeviceInfo[];
  cameraId: string;
  microphoneId: string;
  setCamera: (on: boolean) => Promise<void>;
  setMic: (on: boolean) => Promise<void>;
  chooseCamera: (deviceId: string) => Promise<void>;
  chooseMicrophone: (deviceId: string) => Promise<void>;
  stopMedia: () => void;
  summary: MeetingSummary | null;
  setSummary: (summary: MeetingSummary | null) => void;
};

const SessionContext = createContext<Session | null>(null);

const canUseMedia = () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);

function describeMediaError(error: unknown, kind: "camera" | "microphone"): string {
  const name = error instanceof DOMException ? error.name : "";
  if (name === "NotAllowedError" || name === "SecurityError") {
    return `Your ${kind} is blocked. Allow access from the icon in the address bar, or join without it.`;
  }
  if (name === "NotFoundError" || name === "OverconstrainedError") return `No ${kind} was found.`;
  if (name === "NotReadableError") return `Your ${kind} is in use by another app.`;
  return `Your ${kind} could not be started.`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [displayName, setDisplayNameState] = useState(() => {
    try {
      return localStorage.getItem("cenivo-demo-name") ?? "";
    } catch {
      return "";
    }
  });
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [camOn, setCamOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [cameras, setCameras] = useState<MediaDeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [cameraId, setCameraId] = useState("");
  const [microphoneId, setMicrophoneId] = useState("");
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const setDisplayName = useCallback((name: string) => {
    setDisplayNameState(name);
    try {
      localStorage.setItem("cenivo-demo-name", name);
    } catch {
      // Name is only remembered when storage is available
    }
  }, []);

  const publish = useCallback((tracks: MediaStreamTrack[]) => {
    const next = tracks.length ? new MediaStream(tracks) : null;
    streamRef.current = next;
    setStream(next);
  }, []);

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    const devices = await navigator.mediaDevices.enumerateDevices();
    setCameras(devices.filter((d) => d.kind === "videoinput" && d.deviceId));
    setMicrophones(devices.filter((d) => d.kind === "audioinput" && d.deviceId));
  }, []);

  const currentTracks = (kind: "audio" | "video") =>
    streamRef.current ? (kind === "audio" ? streamRef.current.getAudioTracks() : streamRef.current.getVideoTracks()) : [];

  const startCamera = useCallback(
    async (deviceId?: string) => {
      const media = await navigator.mediaDevices.getUserMedia({
        video: deviceId ? { deviceId: { exact: deviceId } } : { width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      currentTracks("video").forEach((t) => t.stop());
      const [track] = media.getVideoTracks();
      setCameraId(track.getSettings().deviceId ?? deviceId ?? "");
      publish([...currentTracks("audio"), track]);
      void refreshDevices();
    },
    [publish, refreshDevices],
  );

  const startMicrophone = useCallback(
    async (deviceId?: string) => {
      const media = await navigator.mediaDevices.getUserMedia({
        audio: deviceId ? { deviceId: { exact: deviceId }, echoCancellation: true } : { echoCancellation: true, noiseSuppression: true },
      });
      currentTracks("audio").forEach((t) => t.stop());
      const [track] = media.getAudioTracks();
      setMicrophoneId(track.getSettings().deviceId ?? deviceId ?? "");
      publish([...currentTracks("video"), track]);
      void refreshDevices();
    },
    [publish, refreshDevices],
  );

  const setCamera = useCallback(
    async (on: boolean) => {
      if (!on) {
        // Stop the track so the camera light turns off
        currentTracks("video").forEach((t) => t.stop());
        publish(currentTracks("audio"));
        setCamOn(false);
        return;
      }
      if (!canUseMedia()) {
        setMediaError("This browser cannot use a camera here.");
        return;
      }
      try {
        await startCamera(cameraId || undefined);
        setCamOn(true);
        setMediaError(null);
      } catch (error) {
        setCamOn(false);
        setMediaError(describeMediaError(error, "camera"));
      }
    },
    [cameraId, publish, startCamera],
  );

  const setMic = useCallback(
    async (on: boolean) => {
      const tracks = currentTracks("audio");
      if (!on) {
        tracks.forEach((t) => (t.enabled = false));
        setMicOn(false);
        return;
      }
      if (tracks.length) {
        tracks.forEach((t) => (t.enabled = true));
        setMicOn(true);
        return;
      }
      if (!canUseMedia()) {
        setMediaError("This browser cannot use a microphone here.");
        return;
      }
      try {
        await startMicrophone(microphoneId || undefined);
        setMicOn(true);
        setMediaError(null);
      } catch (error) {
        setMicOn(false);
        setMediaError(describeMediaError(error, "microphone"));
      }
    },
    [microphoneId, startMicrophone],
  );

  const chooseCamera = useCallback(
    async (deviceId: string) => {
      setCameraId(deviceId);
      if (camOn) await startCamera(deviceId).catch((error) => setMediaError(describeMediaError(error, "camera")));
    },
    [camOn, startCamera],
  );

  const chooseMicrophone = useCallback(
    async (deviceId: string) => {
      setMicrophoneId(deviceId);
      if (currentTracks("audio").length) {
        await startMicrophone(deviceId).catch((error) => setMediaError(describeMediaError(error, "microphone")));
        currentTracks("audio").forEach((t) => (t.enabled = micOn));
      }
    },
    [micOn, startMicrophone],
  );

  const stopMedia = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    publish([]);
    setCamOn(false);
    setMicOn(false);
  }, [publish]);

  useEffect(() => () => streamRef.current?.getTracks().forEach((t) => t.stop()), []);

  const value = useMemo<Session>(
    () => ({
      displayName,
      setDisplayName,
      stream,
      camOn,
      micOn,
      mediaError,
      cameras,
      microphones,
      cameraId,
      microphoneId,
      setCamera,
      setMic,
      chooseCamera,
      chooseMicrophone,
      stopMedia,
      summary,
      setSummary,
    }),
    [displayName, setDisplayName, stream, camOn, micOn, mediaError, cameras, microphones, cameraId, microphoneId, setCamera, setMic, chooseCamera, chooseMicrophone, stopMedia, summary],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): Session {
  const session = useContext(SessionContext);
  if (!session) throw new Error("useSession must be used inside SessionProvider");
  return session;
}

/** Name shown for the visitor when they skipped the pre-join screen. */
export const fallbackName = (name: string) => name.trim() || "You";
