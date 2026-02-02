import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, RoomEvent, VideoPresets, Track } from 'livekit-client';
import apiClient from '../api/apiClient';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || 'wss://localhost:7880';

const VideoTestPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('대기 중');
  const [roomId, setRoomId] = useState(() => 'test-room-' + Date.now());
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);
  const [participants, setParticipants] = useState([]);

  const roomRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideosRef = useRef({});

  // 미디어 토큰 요청
  const getMediaToken = async (roomId) => {
    const response = await apiClient.get('/api/v1/media/token', {
      params: { roomId }
    });
    return response.data.data;
  };

  // 로컬 비디오 미리보기
  const startLocalPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      if (localVideoRef.current) {
        // div에 video 요소를 동적으로 생성해서 추가
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.autoplay = true;
        videoElement.playsInline = true;
        videoElement.muted = true;
        videoElement.className = 'w-full h-full object-cover scale-x-[-1]';
        localVideoRef.current.innerHTML = '';
        localVideoRef.current.appendChild(videoElement);
      }
      setStatus('카메라 준비 완료');
      return stream;
    } catch (err) {
      setError('카메라/마이크 접근 실패: ' + err.message);
      throw err;
    }
  };

  // LiveKit 연결
  const connectToLiveKit = async () => {
    setStatus('토큰 요청 중...');
    setError(null);

    try {
      // 1. 백엔드에서 토큰 가져오기
      const { sessionId, token } = await getMediaToken(roomId);
      setStatus(`토큰 획득 완료 (Room: ${sessionId})`);

      // 2. LiveKit Room 생성
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: VideoPresets.h720.resolution,
        },
      });
      roomRef.current = room;

      // 3. 이벤트 리스너 설정
      room.on(RoomEvent.Connected, () => {
        setStatus('LiveKit 연결 성공!');
        setIsConnected(true);
      });

      room.on(RoomEvent.Disconnected, () => {
        setStatus('연결 해제됨');
        setIsConnected(false);
      });

      room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log('참가자 연결:', participant.identity);
        setParticipants(prev => [...prev, participant.identity]);
      });

      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log('참가자 퇴장:', participant.identity);
        setParticipants(prev => prev.filter(p => p !== participant.identity));
      });

      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log('트랙 구독:', track.kind, participant.identity);
        if (track.kind === 'video') {
          const element = track.attach();
          element.className = 'w-full h-full object-cover';
          const container = document.getElementById(`video-${participant.identity}`);
          if (container) {
            container.innerHTML = '';
            container.appendChild(element);
          }
        }
      });

      room.on(RoomEvent.LocalTrackPublished, (publication) => {
        console.log('로컬 트랙 발행:', publication.source);
        // 카메라 트랙이 발행되면 로컬 비디오에 표시
        if (publication.source === Track.Source.Camera && publication.track && localVideoRef.current) {
          const element = publication.track.attach();
          localVideoRef.current.innerHTML = '';
          localVideoRef.current.appendChild(element);
          element.className = 'w-full h-full object-cover scale-x-[-1]';
        }
      });

      // 4. 연결
      setStatus('LiveKit 서버 연결 중...');
      await room.connect(LIVEKIT_URL, token);

      // 5. 카메라/마이크 발행
      setStatus('카메라/마이크 발행 중...');
      console.log('enableCameraAndMicrophone 호출 전');
      await room.localParticipant.enableCameraAndMicrophone();
      console.log('enableCameraAndMicrophone 완료');

      // 로컬 비디오 표시
      console.log('localParticipant:', room.localParticipant);
      console.log('videoTrackPublications:', room.localParticipant.videoTrackPublications);

      const videoPublication = room.localParticipant.getTrackPublication(Track.Source.Camera);
      console.log('videoPublication:', videoPublication);
      console.log('localVideoRef.current:', localVideoRef.current);

      if (videoPublication?.track && localVideoRef.current) {
        console.log('로컬 비디오 attach 시도');
        const element = videoPublication.track.attach();
        localVideoRef.current.innerHTML = '';
        localVideoRef.current.appendChild(element);
        element.className = 'w-full h-full object-cover scale-x-[-1]';
        console.log('로컬 비디오 attach 완료');
      } else {
        console.log('videoPublication 또는 localVideoRef 없음');
      }

      setStatus('연결 완료! 화상 테스트 준비됨');

    } catch (err) {
      console.error('연결 오류:', err);
      setError(err.response?.data?.error?.message || err.message);
      setStatus('연결 실패');
    }
  };

  // 연결 해제
  const disconnect = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.innerHTML = '';
    }
    setIsConnected(false);
    setParticipants([]);
    setStatus('연결 해제됨');
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (roomRef.current) {
        roomRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">화상 연결 테스트</h1>
        <button
          onClick={() => navigate('/rooms')}
          className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
        >
          로비로 돌아가기
        </button>
      </div>

      {/* 상태 표시 */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="font-medium">상태: {status}</span>
        </div>
        {error && (
          <div className="text-red-400 text-sm mt-2">오류: {error}</div>
        )}
      </div>

      {/* 설정 */}
      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <label className="block text-sm mb-2">Room ID</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          disabled={isConnected}
          className="w-full px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-50"
          placeholder="테스트 룸 ID 입력"
        />
        <div className="text-xs text-white/50 mt-2">
          LiveKit URL: {LIVEKIT_URL}
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={startLocalPreview}
          disabled={isConnected}
          className="px-6 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-all"
        >
          카메라 미리보기
        </button>
        <button
          onClick={connectToLiveKit}
          disabled={isConnected}
          className="px-6 py-3 bg-[#ff8a00] rounded-lg font-medium hover:bg-[#ffaa44] disabled:opacity-50 transition-all"
        >
          LiveKit 연결
        </button>
        <button
          onClick={disconnect}
          disabled={!isConnected}
          className="px-6 py-3 bg-red-600 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-all"
        >
          연결 해제
        </button>
      </div>

      {/* 비디오 영역 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 로컬 비디오 */}
        <div className="aspect-video bg-black/50 rounded-lg overflow-hidden relative">
          <div ref={localVideoRef} className="w-full h-full"></div>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs">
            나 (로컬)
          </div>
        </div>

        {/* 리모트 참가자들 */}
        {participants.map((identity) => (
          <div key={identity} className="aspect-video bg-black/50 rounded-lg overflow-hidden relative">
            <div id={`video-${identity}`} className="w-full h-full flex items-center justify-center text-white/50">
              연결 중...
            </div>
            <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs">
              {identity}
            </div>
          </div>
        ))}
      </div>

      {/* 디버그 정보 */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg">
        <h3 className="font-medium mb-2">디버그 정보</h3>
        <div className="text-sm text-white/70 space-y-1">
          <div>연결 상태: {isConnected ? '연결됨' : '미연결'}</div>
          <div>참가자 수: {participants.length}</div>
          <div>Room ID: {roomId}</div>
        </div>
      </div>
    </div>
  );
};

export default VideoTestPage;
