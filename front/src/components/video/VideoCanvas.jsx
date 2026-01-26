import { useRef, useEffect } from "react";

const VideoCanvas = ({ stream, isMuted = false }) => {
  // 1. useRef: HTML의 <video> 태그에 직접 접근하기 위한 '집게' 역할
  const videoRef = useRef(null);

  // 2. useEffect: 스트림 데이터가 들어오거나 바뀔 때마다 실행
  useEffect(() => {
    // videoRef가 가리키는 <video> 태그가 있고, stream 데이터가 존재할 때
    if (videoRef.current && stream) {
      // 비디오 태그의 소스로 스트림을 주입합니다.
      videoRef.current.srcObject = stream;
    }
  }, [stream]); // stream이 바뀔 때마다 이 로직을 다시 실행

  return (
    <div className="relative z-0 w-full h-full bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
      {/* 실제 비디오 태그 */}
      <video
        ref={videoRef}
        autoPlay       // 데이터가 들어오면 자동으로 재생
        playsInline    // 모바일 환경 등에서 전체화면 방지
        muted={isMuted} // 내 목소리가 나한테 들리지 않게 설정
        className="w-full h-full object-cover scale-x-[-1]" // scale-x-[-1]은 거울 모드(반전)
      />
      
      {/* 영상이 없을 때 보여줄 안내 (선택 사항) */}
      {!stream && (
        <div className="absolute inset-0 flex items-center justify-center text-white/10 text-xs">
          카메라 로딩 중...
        </div>
      )}
    </div>
  );
};

export default VideoCanvas;