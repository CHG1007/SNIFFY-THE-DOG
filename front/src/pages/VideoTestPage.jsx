import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, RoomEvent, VideoPresets, Track, createLocalTracks } from 'livekit-client';
import apiClient from '../api/apiClient';

// 동적 URL 설정: 환경 변수가 없으면 현재 호스트의 /livekit/ 경로(Nginx Proxy)를 사용
const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL ||
  (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.hostname +
  (window.location.port ? ':' + window.location.port : '') +
  '/livekit';

// 비디오 렌더링을 위한 별도 컴포넌트
const VideoComponent = ({ track, participantIdentity, local = false }) => {
  const videoRef = useRef(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (track && videoElement) {
      track.attach(videoElement);
      return () => {
        track.detach(videoElement);
      };
    }
  }, [track]);

  return (
    <div className="aspect-video bg-black/50 rounded-lg overflow-hidden relative border border-white/10">
      <video
        ref={videoRef}
        className={`w-full h-full object-cover ${local ? 'scale-x-[-1]' : ''}`}
      />
      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 rounded text-xs select-none pointer-events-none text-white">
        {local ? '나 (Preview)' : participantIdentity}
      </div>
    </div>
  );
};

const VideoTestPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState('대기 중');
  const [roomId, setRoomId] = useState('test-room-' + Date.now().toString().slice(-4));
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState(null);

  const [participants, setParticipants] = useState([]);
  const [tracks, setTracks] = useState({});
  const [localTrack, setLocalTrack] = useState(null); // 로컬 비디오 트랙 (Preview용)
  const [localTracks, setLocalTracks] = useState([]); // 로컬 트랙 전체 (Video+Audio)

  const roomRef = useRef(null);

  // 미디어 토큰 요청
  const getMediaToken = async (roomId) => {
    const response = await apiClient.get('/api/v1/media/token', {
      params: { roomId }
    });
    return response.data.data;
  };

  // 1. 로컬 비디오 미리보기 (연결 전 실행 가능)
  const startLocalPreview = async () => {
    try {
      setStatus('카메라/마이크 권한 요청 중...');
      const tracks = await createLocalTracks({
        audio: true,
        video: { resolution: VideoPresets.h720.resolution }
      });

      const videoTrack = tracks.find(t => t.kind === Track.Kind.Video);
      if (videoTrack) {
        setLocalTrack(videoTrack);
      }
      setLocalTracks(tracks);
      setStatus('카메라 준비 완료 (연결 대기)');
    } catch (err) {
      setError('카메라 접근 실패: ' + err.message);
      console.error(err);
    }
  };

  const cleanUpTracks = () => {
    localTracks.forEach(track => {
      track.stop();
    });
    setLocalTracks([]);
    setLocalTrack(null);
  };

  // 2. LiveKit 연결
  const connectToLiveKit = async () => {
    if (!localTrack) {
      // 미리보기가 안 되어 있으면 먼저 실행
      await startLocalPreview();
    }

    setStatus('토큰 요청 중...');
    setError(null);

    try {
      // 1. 토큰 가져오기
      const { sessionId, token } = await getMediaToken(roomId);
      setStatus(`토큰 획득 (Room: ${sessionId}). 연결 시도 중...`);
      console.log(`Connecting to LiveKit URL: ${LIVEKIT_URL}`);

      // 2. Room 생성
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
      });
      roomRef.current = room;

      // 3. 이벤트 핸들러
      room.on(RoomEvent.Connected, () => {
        setStatus('LiveKit 서버 연결 성공!');
        setIsConnected(true);

        // 기존 참가자 처리
        const existingParticipants = Array.from(room.remoteParticipants.values());
        setParticipants(existingParticipants.map(p => p.identity));
        existingParticipants.forEach(p => {
          p.videoTrackPublications.forEach(pub => {
            if (pub.track) {
              setTracks(prev => ({ ...prev, [p.identity]: pub.track }));
            }
          });
        });
      });

      room.on(RoomEvent.Disconnected, () => {
        setStatus('연결 해제됨');
        setIsConnected(false);
        setParticipants([]);
        setTracks({});
      });

      room.on(RoomEvent.ParticipantConnected, (p) => {
        setParticipants(prev => [...prev, p.identity]);
      });
      room.on(RoomEvent.ParticipantDisconnected, (p) => {
        setParticipants(prev => prev.filter(id => id !== p.identity));
        setTracks(prev => {
          const next = { ...prev };
          delete next[p.identity];
          return next;
        });
      });
      room.on(RoomEvent.TrackSubscribed, (track, pub, p) => {
        if (track.kind === Track.Kind.Video) {
          setTracks(prev => ({ ...prev, [p.identity]: track }));
        }
      });
      room.on(RoomEvent.TrackUnsubscribed, (track, pub, p) => {
        if (track.kind === Track.Kind.Video) {
          setTracks(prev => {
            const next = { ...prev };
            delete next[p.identity];
            return next;
          });
        }
      });

      // 4. 서버 연결
      await room.connect(LIVEKIT_URL, token);

      // 5. 로컬 트랙 발행 (이미 생성된 트랙 사용)
      if (localTracks.length > 0) {
        setStatus('미디어 스트림 전송 중...');
        // 생성해둔 트랙들을 룸에 발행
        await Promise.all(localTracks.map(track => room.localParticipant.publishTrack(track)));
      } else {
        // 만약 트랙이 없다면 새로 생성해서 발행 (예외 케이스)
        await room.localParticipant.enableCameraAndMicrophone();
      }

      setStatus('연결 완료! 테스트 진행 중');

    } catch (err) {
      console.error('Connection Failed:', err);
      // PC Connection 에러 등의 상세 정보를 표시
      setError(err.message || '연결 실패');
      setStatus('연결 실패');
    }
  };

  const disconnect = () => {
    if (roomRef.current) {
      roomRef.current.disconnect();
      roomRef.current = null;
    }
    // 연결 끊어도 미리보기는 유지할지 여부 결정. 여기서는 끔.
    cleanUpTracks();

    setIsConnected(false);
    setParticipants([]);
    setTracks({});
    setStatus('연결 해제됨');
  };

  useEffect(() => {
    return () => {
      if (roomRef.current) roomRef.current.disconnect();
      cleanUpTracks();
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#121212] text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">화상 연결 테스트</h1>
        <button onClick={() => navigate('/rooms')} className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20">
          로비로 돌아가기
        </button>
      </div>

      <div className="mb-6 p-4 bg-white/5 rounded-lg space-y-2">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
          <span className="font-medium">상태: {status}</span>
        </div>
        <div className="text-xs text-white/50">Target URL: {LIVEKIT_URL}</div>
        {error && <div className="text-red-400 text-sm font-bold bg-red-950/30 p-2 rounded">오류: {error}</div>}
      </div>

      <div className="mb-6 p-4 bg-white/5 rounded-lg">
        <label className="block text-sm mb-2">Room ID</label>
        <input
          type="text"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          disabled={isConnected}
          className="w-full px-4 py-2 bg-white/10 rounded-lg text-white disabled:opacity-50"
          placeholder="테스트 룸 ID"
        />
      </div>

      <div className="flex gap-4 mb-8">
        <button
          onClick={startLocalPreview}
          disabled={!!localTrack || isConnected} // 이미 미리보기 중이거나 연결되면 비활성
          className="px-6 py-3 bg-blue-600 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          1. 카메라 미리보기
        </button>
        <button
          onClick={connectToLiveKit}
          disabled={isConnected}
          className="px-6 py-3 bg-[#ff8a00] rounded-lg font-medium hover:bg-[#ffaa44] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          2. LiveKit 연결
        </button>
        <button
          onClick={disconnect}
          disabled={!isConnected && !localTrack}
          className="px-6 py-3 bg-red-600 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          종료 / 연결 해제
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 로컬 비디오 (미리보기 or 송출화면) */}
        <div className="aspect-video bg-black/50 rounded-lg overflow-hidden relative border border-white/10 flex items-center justify-center">
          {localTrack ? (
            <VideoComponent track={localTrack} participantIdentity="Me" local={true} />
          ) : (
            <div className="text-white/30 text-sm">카메라 버튼을 눌러주세요</div>
          )}
        </div>

        {/* 리모트 비디오 */}
        {participants.map((identity) => (
          <VideoComponent
            key={identity}
            track={tracks[identity]}
            participantIdentity={identity}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-white/5 rounded-lg text-xs text-white/50">
        <div>Debug Info:</div>
        <div>Has Local Track: {localTrack ? 'Yes' : 'No'}</div>
        <div>Participants: {participants.length}</div>
        <div>Remote Tracks: {Object.keys(tracks).length}</div>
      </div>
    </div>
  );
};

export default VideoTestPage;
