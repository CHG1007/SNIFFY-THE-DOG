import { useRef } from "react";
import { AUDIO_THRESHOLDS } from "./AudioConstants";

export function useAudioAnalyzer() {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const initAudio = async (externalTrack) => {
    try {
      // 1. 기존에 켜져 있던 오디오 컨텍스트가 있다면 끄고 새로 시작합니다.
      if (audioContextRef.current) {
        await audioContextRef.current.close();
      }

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyserRef.current = analyser;
      dataArrayRef.current = new Float32Array(analyser.fftSize);

      // 2. 전달받은 트랙에서 진짜 미디어 알맹이(Track)를 꺼냅니다.
      const mediaStreamTrack = externalTrack?.mediaStreamTrack || 
                               (externalTrack?.track && externalTrack.track.mediaStreamTrack);

      let source;

      if (mediaStreamTrack) {
        // 선택한 상대방의 목소리 줄기를 분석기에 연결
        const stream = new MediaStream([mediaStreamTrack]);
        source = audioContext.createMediaStreamSource(stream);
        console.log("✅ [Audio] 선택한 대상의 오디오 연결 성공");
      } else {
        // 선택한 트랙이 없으면 내 마이크라도 연결 (예외 처리)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        source = audioContext.createMediaStreamSource(stream);
        console.log("⚠️ [Audio] 대상 트랙이 없어 내 마이크를 연결했습니다.");
      }

      // 3. 💡 핵심: 소리 줄기(source)를 분석기(analyser)에 최종 연결합니다.
      source.connect(analyser);

    } catch (error) {
      console.error("❌ [Audio] 오디오 분석기 초기화 실패:", error);
    }
  };

  const analyzeOnce = () => {
    // 분석기가 준비되지 않았으면 기본값 반환
    if (!analyserRef.current || !dataArrayRef.current) {
      return { volume: 0, silence: true };
    }

    const dataArray = dataArrayRef.current;
    analyserRef.current.getFloatTimeDomainData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] ** 2;
    }

    const rms = Math.sqrt(sum / dataArray.length);
    // 볼륨 값을 0~1 사이로 예쁘게 가공
    const volume = Number(Math.min(rms * 5, 1).toFixed(2));
    const silence = volume < (AUDIO_THRESHOLDS?.SILENCE_VOLUME || 0.01);

    return { volume, silence };
  };

  const stop = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  return { initAudio, analyzeOnce, stop };
}
