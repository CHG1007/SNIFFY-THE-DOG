import { useState, useEffect, useRef } from 'react';

const SPEAKING_THRESHOLD = 0.02;

// 브라우저 AudioContext 개수 제한 대응 → 단일 인스턴스 공유
let sharedContext = null;

function getAudioContext() {
  if (!sharedContext || sharedContext.state === 'closed') {
    sharedContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (sharedContext.state === 'suspended') {
    sharedContext.resume();
  }
  return sharedContext;
}

/**
 * LiveKit AudioTrack에서 실시간 오디오 레벨을 추출하는 훅
 * @param {import('livekit-client').AudioTrack | null} audioTrack
 * @returns {{ level: number, isSpeaking: boolean }}
 */
export default function useAudioLevel(audioTrack) {
  const [level, setLevel] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const rafRef = useRef(null);
  const lastUpdateRef = useRef(0);

  useEffect(() => {
    const mediaStreamTrack = audioTrack?.mediaStreamTrack;
    if (!mediaStreamTrack) {
      setLevel(0);
      setIsSpeaking(false);
      return;
    }

    let cancelled = false;
    let source = null;

    try {
      const ctx = getAudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.fftSize);

      source = ctx.createMediaStreamSource(new MediaStream([mediaStreamTrack]));
      source.connect(analyser);

      const tick = () => {
        if (cancelled) return;
        analyser.getByteTimeDomainData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const v = (dataArray[i] - 128) / 128;
          sum += v * v;
        }
        const rms = Math.sqrt(sum / dataArray.length);

        const now = performance.now();
        if (now - lastUpdateRef.current > 50) {
          lastUpdateRef.current = now;
          setLevel(rms);
          setIsSpeaking(rms > SPEAKING_THRESHOLD);
        }

        rafRef.current = requestAnimationFrame(tick);
      };

      tick();
    } catch (err) {
      console.warn('[useAudioLevel] 오디오 분석기 초기화 실패:', err);
    }

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (source) source.disconnect();
    };
  }, [audioTrack]);

  return { level, isSpeaking };
}
