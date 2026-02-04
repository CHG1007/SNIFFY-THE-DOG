import { useRef, useEffect } from "react";

/**
 * @param {{ track?: import('livekit-client').VideoTrack, stream?: MediaStream, isMuted?: boolean, isLocal?: boolean }} props
 *   track   - LiveKit VideoTrack (우선 사용)
 *   stream  - 기본 MediaStream (하위 호환)
 *   isMuted - 오디오 음소화
 *   isLocal - true이면 영상 좌우 반전 (본인 카메라)
 */
const VideoCanvas = ({ track, stream, isMuted = false, isLocal = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    if (track) {
      // LiveKit Track: attach / detach 패턴
      track.attach(el);
      return () => { track.detach(el); };
    } else if (stream) {
      // 기본 MediaStream 폴백
      el.srcObject = stream;
      return () => { el.srcObject = null; };
    }
  }, [track, stream]);

  const hasMedia = !!(track || stream);

  return (
    <div className="relative z-0 w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''} ${!hasMedia ? 'hidden' : 'block'}`}
      />

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
