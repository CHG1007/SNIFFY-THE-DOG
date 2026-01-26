import React, { useRef, useState } from "react";
import { useAudioAnalyzer } from "../../analysis/audio/UseAudioAnalyzer";
import { useFaceAnalyzer } from "../../analysis/face/UseFaceAnalyzer";

export default function AiTestModal({ onClose }) {
  /* ===== hooks ===== */
  const { initAudio, analyzeOnce: analyzeAudio, stop: stopAudio } = useAudioAnalyzer();
  const { videoRef, initVideo, loadModels, analyzeOnce: analyzeFace, stop: stopVideo } = useFaceAnalyzer();

  /* ===== state ===== */
  const [resultText, setResultText] = useState(""); // AI 분석 결과 저장
  const [isProcessing, setIsProcessing] = useState(false); // 분석 중 상태

  /* ===== refs ===== */
  const intervalRef = useRef(null);
  const bufferRef = useRef([]);

  /* ===== start ===== */
  const start = async () => {
    setResultText("");
    bufferRef.current = [];
    setIsProcessing(true);

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

        setResultText("AI 분석 중...");
        await sendToBackend(bufferRef.current);
        setIsProcessing(false);
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
    try {
      const res = await fetch("/api/analysis/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });

      if (res.ok) {
        const data = await res.json();
        // 백엔드에서 보낸 narrative 값을 화면에 세팅
        setResultText(data.narrative); 
      } else {
        setResultText("분석 실패 (서버 오류)");
      }
    } catch (e) {
      console.error("SEND FAILED", e);
      setResultText("전송 실패 (네트워크 오류)");
    }
  };

  /* ===== styles (기존 스타일 유지 + 결과창 추가) ===== */
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

  const resultBox = {
    marginTop: 12,
    padding: 10,
    background: "#f9f9f9",
    border: "1px dashed #bbb",
    fontSize: "13px",
    color: "#333",
    wordBreak: "break-all"
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
          style={{ background: "black" }}
        />

        {/* 분석 결과가 표시되는 박스 */}
        <div style={resultBox}>
          <strong>AI 분석 결과:</strong><br/>
          {resultText || "데이터를 5초간 수집해주세요."}
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={start} disabled={isProcessing}>
            {isProcessing ? "분석중..." : "start"}
          </button>
          <button onClick={close} style={{ marginLeft: 8 }}>
            close
          </button>
        </div>
      </div>
    </div>
  );
}