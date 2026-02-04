import { useState, useRef, useEffect } from 'react';
import { Room, RoomEvent, VideoPresets, Track, createLocalTracks } from 'livekit-client';
import apiClient from '../api/apiClient';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL ||
  (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.hostname +
  (window.location.port ? ':' + window.location.port : '') +
  '/livekit';

/**
 * LiveKit 자동 연결 훅
 * roomId가 주어지면 마운트 시 즉시 토큰 요청 → 연결 → 로컬 트랙 발행
 *
 * @param {string} roomId - 게임 방 코드 (토큰 요청 및 LiveKit Room ID로 사용)
 * @returns {{ tracks: Record<string, import('livekit-client').VideoTrack>, localTrack: import('livekit-client').VideoTrack | null, roomRef: React.MutableRefObject }}
 *   tracks  - 원격 참가자 identity -> VideoTrack 맵
 *   localTrack - 본인의 로컬 VideoTrack
 *   roomRef - LiveKit Room 인스턴스 (AI 분석 등에서 오디오 트랙 접근 시 사용 가능)
 */
export default function useLiveKit(roomId) {
  const [tracks, setTracks] = useState({}); // { [identity: string]: VideoTrack }
  const [localTrack, setLocalTrack] = useState(null);
  const roomRef = useRef(null);
  const localTracksRef = useRef([]); // 클린업용 참조

  useEffect(() => {
    if (!roomId) return;

    let cancelled = false;

    const connect = async () => {
      try {
        // 1. 로컬 미디어 트랙 생성 (카메라 권한 거부 시 영상 없이 연결 진행)
        let createdTracks = [];
        try {
          createdTracks = await createLocalTracks({
            audio: true,
            video: { resolution: VideoPresets.h720.resolution },
          });
          if (cancelled) { createdTracks.forEach(t => t.stop()); return; }

          localTracksRef.current = createdTracks;
          const videoTrack = createdTracks.find(t => t.kind === Track.Kind.Video);
          if (videoTrack) setLocalTrack(videoTrack);
        } catch (mediaErr) {
          console.warn('[LiveKit] 미디어 권한 실패, 영상 없이 연결 시도:', mediaErr.message);
        }

        // 2. 토큰 요청
        const res = await apiClient.get('/api/v1/media/token', { params: { roomId } });
        const { token } = res.data.data;
        if (cancelled) { createdTracks.forEach(t => t.stop()); return; }

        if (import.meta.env.DEV) {
          console.log('[LiveKit] 토큰 획득 완료, 연결 시도 중... URL:', LIVEKIT_URL);
        }

        // 3. Room 생성 및 이벤트 등록
        const room = new Room({ adaptiveStream: true, dynacast: true });
        roomRef.current = room;

        room.on(RoomEvent.Connected, () => {
          if (import.meta.env.DEV) console.log('[LiveKit] 연결 성공');
          // 기존 원격 참가자의 트랙 처리
          room.remoteParticipants.forEach(p => {
            p.videoTrackPublications.forEach(pub => {
              if (pub.track) {
                setTracks(prev => ({ ...prev, [p.identity]: pub.track }));
              }
            });
          });
        });

        room.on(RoomEvent.Disconnected, () => {
          if (import.meta.env.DEV) console.log('[LiveKit] 연결 해제');
          setTracks({});
        });

        room.on(RoomEvent.ParticipantDisconnected, (p) => {
          if (import.meta.env.DEV) console.log('[LiveKit] 참가자 퇴장:', p.identity);
          setTracks(prev => {
            const next = { ...prev };
            delete next[p.identity];
            return next;
          });
        });

        room.on(RoomEvent.TrackSubscribed, (track, _pub, p) => {
          if (track.kind === Track.Kind.Video) {
            if (import.meta.env.DEV) console.log('[LiveKit] 원격 비디오 구독:', p.identity);
            setTracks(prev => ({ ...prev, [p.identity]: track }));
          }
        });

        room.on(RoomEvent.TrackUnsubscribed, (track, _pub, p) => {
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
        if (cancelled) { room.disconnect(); return; }

        // 5. 로컬 트랙 발행
        if (createdTracks.length > 0) {
          await Promise.all(createdTracks.map(t => room.localParticipant.publishTrack(t)));
          if (import.meta.env.DEV) {
            console.log('[LiveKit] 로컬 트랙 발행 완료. 본인 identity:', room.localParticipant.identity);
          }
        }
      } catch (err) {
        console.error('[LiveKit] 연결 실패:', err);
      }
    };

    connect();

    // 클린업: 컴포넌트 unmount 시 연결 종료 및 트랙 정지
    return () => {
      cancelled = true;
      if (roomRef.current) {
        roomRef.current.disconnect();
        roomRef.current = null;
      }
      localTracksRef.current.forEach(t => t.stop());
      localTracksRef.current = [];
      setLocalTrack(null);
      setTracks({});
    };
  }, [roomId]);

  return { tracks, localTrack, roomRef };
}
