import { useRef } from "react";
import { useAudioAnalyzer } from "../../analysis/audio/UseAudioAnalyzer";
import { useFaceAnalyzer } from "../../analysis/face/UseFaceAnalyzer";

export default function AiTestModal({ onClose }) {
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

  /* ===== refs ===== */
  const intervalRef = useRef(null);
  const bufferRef = useRef([]);

  /* ===== start ===== */
  const start = async () => {
    bufferRef.current = [];

    await initAudio();
    await initVideo();
    await loadModels();

    let second = 0;

    intervalRef.current = setInterval(async () => {
      second++;

      const audio = analyzeAudio();
      const face = await analyzeFace();

      bufferRef.current.push({ second, audio, face });

      if (second >= 5) {
        clearInterval(intervalRef.current);
        stopAudio();
        stopVideo();

        console.log("Start Log : ", bufferRef.current);
        await sendToBackend(bufferRef.current);
        console.log("Final Log : ", bufferRef.current);
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

  /* ===== backend send ===== */
  const sendToBackend = async (frames) => {
    const payload = {
      sessionId: "room-1",
      targetUserId: "user-3",
      windowSeconds: 5,
      frames,
      clientTimestamp: Date.now(),
    };

    try {
      const res = await fetch("/api/analysis/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log("SEND RESULT:", res.status);
    } catch (e) {
      console.error("SEND FAILED", e);
    }
  };

  /* ===== styles ===== */
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

        <div style={{ marginTop: 12 }}>
          <button onClick={start}>start</button>
          <button onClick={close} style={{ marginLeft: 8 }}>
            close
          </button>
        </div>
      </div>
    </div>
  );
}
