import { useRef, useEffect } from "react";

const VideoCanvas = ({ stream, isMuted = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative z-0 w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isMuted}
        className={`w-full h-full object-cover scale-x-[-1] ${!stream ? 'hidden' : 'block'}`} 
      />
      
      {/* Loading / Placeholder State (No Image, Dark Background) */}
      {!stream && (
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
