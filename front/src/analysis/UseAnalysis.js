import { useState } from "react";
import { useAudioAnalyzer } from "./audio/UseAudioAnalyzer";
import { useFaceAnalyzer } from "./face/UseFaceAnalyzer";
import useAuthStore from "../stores/useAuthStore";

export function useAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { initAudio, analyzeOnce: analyzeAudio } = useAudioAnalyzer();
  const { analyzeOnce: analyzeFace, loadModels } = useFaceAnalyzer();
  const { user } = useAuthStore();

  /**
   * startAnalysis
   * @param {Object} tracks - { video: Track, audio: Track, roomId: string, round: number }
   * @param {string} targetId - 분석 대상의 identity (예: '1001')
   */
  const startAnalysis = async (tracks, targetId) => {
    // 1. 방어 로직
    if (isAnalyzing || !tracks || !tracks.video) return null;
    
    setIsAnalyzing(true);
    const { roomId, round } = tracks;

    // 임시 비디오 엘리먼트 생성
    const tempVideo = document.createElement('video');
    tempVideo.muted = true;
    tempVideo.playsInline = true;

    try {
      // 2. 준비 단계 (모델 로드 및 오디오 초기화)
      await loadModels();
      await initAudio(tracks.audio);

      // 3. 비디오 트랙 연결
      const videoTrack = tracks.video;
      const mediaStreamTrack = videoTrack.mediaStreamTrack || (videoTrack.track && videoTrack.track.mediaStreamTrack);

      if (!mediaStreamTrack) {
        throw new Error("영상을 찾을 수 없습니다.");
      }

      tempVideo.srcObject = new MediaStream([mediaStreamTrack]);
      await tempVideo.play();

      // 4. 영상 신호 대기 (화면이 준비될 때까지)
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

      // 5. 💡 [수정] 5초 데이터 수집 (setInterval 대신 for 루프 사용으로 흐름 제어)
      for (let i = 1; i <= 5; i++) {
        // 1초 대기
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const face = await analyzeFace(tempVideo);
        const audio = analyzeAudio();

        buffer.push({ second: i, face, audio });
      }

      // 6. 정리 작업
      tempVideo.srcObject = null;
      tempVideo.pause();

      // 7. 💡 [수정] 백엔드 전송 및 결과 반환
      // sendToBackend가 비동기이므로 반드시 await를 붙여 결과를 받습니다.
      const result = await sendToBackend(buffer, targetId, roomId, round);
      
      return result; // GamePage의 const result = await startAnalysis(...) 로 전달됨

    } catch (error) {
      console.error("분석 실패:", error);
      return { narrative: "분석 중 오류가 발생했습니다.", isMafia: false };
    } finally {
      // 에러가 나든 성공하든 분석 상태는 해제
      setIsAnalyzing(false);
    }
  };

  /**
   * sendToBackend
   */
  const sendToBackend = async (frames, targetId, roomId, round) => {
    const finalTargetId = (targetId === "Me") ? user?.userId : targetId;

    try {
      const res = await fetch("/api/analysis/frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: roomId,
          actorUserId: user?.userId,
          targetUserId: finalTargetId,
          round: round || 1,
          frames
        }),
      });

      if (!res.ok) throw new Error("서버 응답 에러");

      const data = await res.json();
      console.log("백엔드 응답 데이터:", data);
      
      // 백엔드 응답이 Wrapper(예: { data: { ... } })에 싸여 있는지 확인 필요
      // 보통 res.json() 결과가 { narrative: "..." } 형태라면 그대로 return
      return data.data || data; 
    } catch (e) {
      console.error("백엔드 전송 에러:", e);
      return { narrative: "서버 통신 실패", isMafia: false };
    }
  };

  return { startAnalysis, isAnalyzing };
}