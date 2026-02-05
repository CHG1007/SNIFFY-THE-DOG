import { useRef, useEffect } from "react";

/**
 * @param {{ 
 *   track?: import('livekit-client').VideoTrack, 
 *   audioTrack?: import('livekit-client').AudioTrack,
 *   stream?: MediaStream, 
 *   isMuted?: boolean, 
 *   isLocal?: boolean 
 * }} props
 *   track   - LiveKit VideoTrack (우선 사용)
 *   audioTrack - LiveKit AudioTrack
 *   stream  - 기본 MediaStream (하위 호환)
 *   isMuted - 오디오 음소화 (로컬은 피드백 방지를 위해 항상 muted)
 *   isLocal - true이면 영상 좌우 반전 (본인 카메라)
 */
const VideoCanvas = ({ track, audioTrack, stream, isMuted = false, isLocal = false }) => {
  const videoRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (track) {
      // LiveKit Video Track
      track.attach(el);
      return () => { track.detach(el); };
    } else if (stream) {
      // 기본 MediaStream 폴백
      el.srcObject = stream;
      return () => { el.srcObject = null; };
    }
  }, [track, stream]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el || isLocal) return; // 로컬 오디오는 직접 듣지 않음 (피드백 방지)

    if (audioTrack) {
      audioTrack.attach(el);
      return () => { audioTrack.detach(el); };
    }
  }, [audioTrack, isLocal]);

  const hasMedia = !!(track || stream);

  return (
    <div className="relative z-0 w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={true} // 비디오 엘리먼트는 항상 음소거 (오디오는 별도 엘리먼트로)
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''} ${!hasMedia ? 'hidden' : 'block'}`}
      />

      {/* 오디오 재생을 위한 숨겨진 엘리먼트 (로컬 제외) */}
      {!isLocal && (
        <audio ref={audioRef} autoPlay muted={isMuted} />
      )}

      {!hasMedia && (
        <div className="absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center">
          <div className="text-white/20 text-xs font-medium tracking-wider">
            카메라 로딩 중...
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCanvas;
