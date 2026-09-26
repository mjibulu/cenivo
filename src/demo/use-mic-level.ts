import { useEffect, useState } from "react";

/** Live input level (0 to 1) of the stream's microphone; 0 when muted or absent. */
export function useMicLevel(stream: MediaStream | null, enabled: boolean): number {
  const [level, setLevel] = useState(0);

  useEffect(() => {
    const track = stream?.getAudioTracks()[0];
    if (!stream || !track || !enabled) {
      setLevel(0);
      return;
    }

    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const context = new AudioCtx();
    const source = context.createMediaStreamSource(new MediaStream([track]));
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);
    const samples = new Uint8Array(analyser.fftSize);

    let frame = 0;
    let last = 0;
    let smoothed = 0;
    const tick = (time: number) => {
      analyser.getByteTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) {
        const centered = (sample - 128) / 128;
        sum += centered * centered;
      }
      const rms = Math.sqrt(sum / samples.length);
      smoothed = smoothed * 0.7 + Math.min(1, rms * 4) * 0.3;
      if (time - last > 66) {
        last = time;
        setLevel(smoothed < 0.02 ? 0 : smoothed);
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      source.disconnect();
      void context.close();
    };
  }, [stream, enabled]);

  return level;
}
