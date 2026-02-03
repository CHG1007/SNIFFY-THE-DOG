import { useState } from "react";
import { useAudioAnalyzer } from "./audio/UseAudioAnalyzer";
import { useFaceAnalyzer } from "./face/UseFaceAnalyzer";

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { initAudio, analyzeOnce: analyzeAudio } = useAudioAnalyzer();
  const { analyzeOnce: analyzeFace, loadModels } = useFaceAnalyzer();

  // 💡 인자를 track 하나가 아니라 tracks(묶음)로 받습니다.
  const startAnalysis = async (tracks, targetId) => {
    // tracks.video가 진짜 있는지 확인합니다.
    if (isAnalyzing || !tracks || !tracks.video) return;
    setIsAnalyzing(true);

    try {
      // 1. 모델 준비 (표정 분석용)
      await loadModels();

      // 2. 💡 오디오 분석기 초기화 (묶음 속에 들어있는 오디오 트랙을 꽂아줍니다)
      await initAudio(tracks.audio);

      // 3. 메모리 상의 비디오 객체 생성
      const tempVideo = document.createElement('video');
      tempVideo.muted = true;
      tempVideo.playsInline = true;

      // 묶음에서 비디오 알맹이 추출
      const videoTrack = tracks.video;
      const mediaStreamTrack = videoTrack.mediaStreamTrack || (videoTrack.track && videoTrack.track.mediaStreamTrack);

      if (!mediaStreamTrack) {
        throw new Error("영상을 찾을 수 없습니다.");
      }

      tempVideo.srcObject = new MediaStream([mediaStreamTrack]);
      await tempVideo.play();

      // 4. 영상 신호 대기 (그림이 보일 때까지)
      await new Promise((resolve) => {
        const checkVideo = () => {
          if (tempVideo.readyState >= 2 && tempVideo.videoWidth > 0) {
            resolve();
          } else {
            requestAnimationFrame(checkVideo);
          }
        };
        checkVideo();
      });

      const buffer = [];
      let second = 0;

      // 5. 5초 데이터 수집 시작
      return await new Promise((resolve) => {
        const interval = setInterval(async () => {
          second++;
          
          const face = await analyzeFace(tempVideo);
          const audio = analyzeAudio();
          
          console.log(`[${second}초] 수집 데이터:`, { face, audio });
          buffer.push({ second, face, audio });

          if (second >= 5) {
            clearInterval(interval);
            
            // 정리 작업
            tempVideo.srcObject = null;
            tempVideo.load();
            
            const result = await sendToBackend(buffer, targetId);
            setIsAnalyzing(false);
            resolve(result);
          }
        }, 1000);
      });

    } catch (error) {
      console.error("분석 실패:", error);
      setIsAnalyzing(false);
      return { narrative: "분석 중 오류가 발생했습니다." };
    }
  };

  const sendToBackend = async (frames, targetId) => {
    try {
      const res = await fetch("/api/analysis/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: targetId, frames }),
      });
      return await res.json();
    } catch (e) {
      return { narrative: "서버 통신 실패" };
    }
  };

  return { startAnalysis, isAnalyzing };
}