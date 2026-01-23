import { useRef, useState } from "react";
import { AUDIO_THRESHOLDS } from "../../analysis/audio/AudioConstants";

export default function AiTestModal({ onClose }) {
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);

  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const [logs, setLogs] = useState([]);
  const [index, setIndex] = useState(0);

  // 오디오 초기화
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

  // 측정
  const analyzeOnce = () => {
    if (!analyserRef.current || !dataArrayRef.current) return null;

    const analyser = analyserRef.current;
    const dataArray = dataArrayRef.current;

    analyser.getFloatTimeDomainData(dataArray);

    let sumSquares = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sumSquares += dataArray[i] ** 2;
    }

    const rms = Math.sqrt(sumSquares / dataArray.length);
    const volume = Number(Math.min(rms * 5, 1).toFixed(2));
    const silence = volume < AUDIO_THRESHOLDS.SILENCE_VOLUME;

    return { volume, silence };
  };

  // 시작 버튼
  const start = async () => {
  setLogs([]);
  setIndex(0);

  await initAudio();

  let count = 0;

  intervalRef.current = setInterval(() => {
    const result = analyzeOnce();
    if (!result) return;

    const second = count + 1;

    setLogs((prev) => [
      ...prev,
      { second, ...result },
    ]);

    count += 1;

    // 5회 측정
    if (count >= 5) {
      clearInterval(intervalRef.current);
      audioContextRef.current?.close();
    }
    }, 1000);
  };


  // 닫기 버튼
  const close = () => {
    clearInterval(intervalRef.current);
    clearTimeout(timeoutRef.current);
    audioContextRef.current?.close();
    onClose();
  };

  // 로그 기록 
  const prevLog = () => setIndex((i) => Math.max(i - 1, 0));
  const nextLog = () =>
    setIndex((i) => Math.min(i + 1, logs.length - 1));

  const currentLog = logs[index];

  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>AI Audio Test</h3>

        <p>
          Log {logs.length === 0 ? 0 : index + 1} / {logs.length}
        </p>

        <pre>
          {currentLog
            ? JSON.stringify(currentLog, null, 2)
            : "no logs"}
        </pre>

        <div>
          <button onClick={prevLog} disabled={index === 0}>
            ←
          </button>
          <button
            onClick={nextLog}
            disabled={index >= logs.length - 1}
          >
            →
          </button>
        </div>

        <div>
          <button onClick={start}>❤️스따뚜</button>
          <button onClick={close}>❌ 닫기</button>
        </div>
      </div>
    </div>
  );
}


// 팝업 스타일
const overlay = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const modal = {
  background: "white",
  padding: 16,
  width: 300,
  border: "1px solid #ccc",
};
