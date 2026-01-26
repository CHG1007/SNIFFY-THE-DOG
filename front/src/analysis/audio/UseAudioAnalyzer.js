import { useRef } from "react";
import { AUDIO_THRESHOLDS } from "./AudioConstants";

export function useAudioAnalyzer() {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const initAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const audioContext =
      new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    source.connect(analyser);

    analyserRef.current = analyser;
    dataArrayRef.current = new Float32Array(analyser.fftSize);
  };

  const analyzeOnce = () => {
    if (!analyserRef.current || !dataArrayRef.current) return null;

    const dataArray = dataArrayRef.current;
    analyserRef.current.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] ** 2;
    }

    const rms = Math.sqrt(sum / dataArray.length);
    const volume = Number(Math.min(rms * 5, 1).toFixed(2));
    const silence = volume < AUDIO_THRESHOLDS.SILENCE_VOLUME;

    return { volume, silence };
  };

  const stop = () => {
    audioContextRef.current?.close();
  };

  return { initAudio, analyzeOnce, stop };
}
