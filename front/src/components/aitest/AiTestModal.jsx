import { useRef, useState } from "react";
import { useAudioAnalyzer } from "../../analysis/audio/UseAudioAnalyzer";
import { useFaceAnalyzer } from "../../analysis/face/UseFaceAnalyzer";

export default function AiTestModal({ onClose }) {
  const overlay = {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.3)",
    zIndex: 9999,
  };

  const modal = {
    background: "white",
    padding: 16,
    width: 320,
    border: "1px solid #ccc",
  };

  /* ===== hooks ===== */
  const { initAudio, analyzeOnce: analyzeAudio, stop: stopAudio } =
    useAudioAnalyzer();
  const {
    videoRef,
    initVideo,
    loadModels,
    analyzeOnce: analyzeFace,
    stop: stopVideo,
  } = useFaceAnalyzer();

  const intervalRef = useRef(null);
  const [logs, setLogs] = useState([]);
  const [index, setIndex] = useState(0);

  /* ===== start ===== */
  const start = async () => {
    setLogs([]);
    setIndex(0);

    await initAudio();
    await initVideo();
    await loadModels();

    let count = 0;

    intervalRef.current = setInterval(async () => {
      count += 1;

      const audio = analyzeAudio();
      const face = await analyzeFace();

      setLogs((prev) => [
        ...prev,
        { second: count, audio, face },
      ]);

      if (count >= 5) {
        clearInterval(intervalRef.current);
        stopAudio();
        stopVideo();
      }
    }, 1000);
  };

  /* ===== close ===== */
  const close = () => {
    clearInterval(intervalRef.current);
    stopAudio();
    stopVideo();
    onClose();
  };

  /* ===== render ===== */
  return (
    <div style={overlay}>
      <div style={modal}>
        <h3>AI Audio + Face Test</h3>

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          width={200}
          height={150}
        />

        <pre>
          {logs[index]
            ? JSON.stringify(logs[index], null, 2)
            : "no logs"}
        </pre>

        <button onClick={() => setIndex((i) => Math.max(i - 1, 0))}>
          ←
        </button>
        <button
          onClick={() =>
            setIndex((i) => Math.min(i + 1, logs.length - 1))
          }
        >
          →
        </button>

        <div>
          <button onClick={start}>start</button>
          <button onClick={close}>close</button>
        </div>
      </div>
    </div>
  );
}