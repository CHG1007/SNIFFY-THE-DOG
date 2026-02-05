import { useRef, useEffect } from 'react';
import { Room, RoomEvent, VideoPresets, Track, createLocalTracks } from 'livekit-client';
import apiClient from '../api/apiClient';
import useLiveKitStore from '../stores/useLiveKitStore';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL ||
  (window.location.protocol === 'https:' ? 'wss://' : 'ws://') +
  window.location.hostname +
  (window.location.port ? ':' + window.location.port : '') +
  '/livekit';

/**
 * LiveKit 자동 연결 훅 (전역 스토어 사용)
 * roomId가 주어지면 마운트 시 즉시 토큰 요청 → 연결 → 로컬 트랙 발행
 * roomId가 동일하면 기존 연결을 유지함
 */
export default function useLiveKit(roomId) {
  const {
    room, setRoom,
    tracks, setTracks, updateTrack, removeTrack,
    localTrack, setLocalTrack,
    localTracks, setLocalTracks,
    roomId: storedRoomId, setRoomId,
    mutedParticipants, setMutedState,
  } = useLiveKitStore();

  const connectingRef = useRef(false);
  const audioElementsRef = useRef({}); // { [identity: string]: HTMLAudioElement }

  useEffect(() => {
    if (!roomId) return;

    // 이미 다른 방에 연결되어 있으면 리셋 (새 방 연결용)
    if (storedRoomId && storedRoomId !== roomId) {
      if (room) room.disconnect();
      localTracks.forEach(t => t.stop());
      setTracks({});
      setLocalTrack(null);
      setLocalTracks([]);
      setRoom(null);
      // 기존 오디오 엘리먼트 정리
      Object.keys(audioElementsRef.current).forEach(id => {
        audioElementsRef.current[id].remove();
      });
      audioElementsRef.current = {};
    }

    // 이미 이 방에 연결되어 있으면 아무것도 하지 않음
    if (room && storedRoomId === roomId) {
      return;
    }

    if (connectingRef.current) return;
    connectingRef.current = true;

    let cancelled = false;

    const connect = async () => {
      try {
        // 1. 로컬 미디어 트랙 생성
        let createdTracks = [];
        try {
          createdTracks = await createLocalTracks({
            audio: true,
            video: { resolution: VideoPresets.h720.resolution },
          });
          if (cancelled) { createdTracks.forEach(t => t.stop()); return; }

          setLocalTracks(createdTracks);
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
        const newRoom = new Room({ adaptiveStream: true, dynacast: true });

        newRoom.on(RoomEvent.Connected, () => {
          if (import.meta.env.DEV) console.log('[LiveKit] 연결 성공');
          newRoom.remoteParticipants.forEach(p => {
            p.videoTrackPublications.forEach(pub => {
              if (pub.track) updateTrack(p.identity, pub.track);
              if (pub.isMuted) setMutedState(p.identity, 'video', true);
            });
            p.audioTrackPublications.forEach(pub => {
              if (pub.track) {
                const audioEl = document.createElement('audio');
                audioEl.autoplay = true;
                pub.track.attach(audioEl);
                document.body.appendChild(audioEl);
                audioElementsRef.current[p.identity] = audioEl;
              }
              if (pub.isMuted) setMutedState(p.identity, 'audio', true);
            });
          });
        });

        newRoom.on(RoomEvent.Disconnected, () => {
          if (import.meta.env.DEV) console.log('[LiveKit] 연결 해제');
          setTracks({});
          Object.keys(audioElementsRef.current).forEach(id => {
            audioElementsRef.current[id].remove();
          });
          audioElementsRef.current = {};
        });

        newRoom.on(RoomEvent.ParticipantDisconnected, (p) => {
          if (import.meta.env.DEV) console.log('[LiveKit] 참가자 퇴장:', p.identity);
          removeTrack(p.identity);
          const audioEl = audioElementsRef.current[p.identity];
          if (audioEl) {
            audioEl.remove();
            delete audioElementsRef.current[p.identity];
          }
        });

        newRoom.on(RoomEvent.TrackSubscribed, (track, pub, p) => {
          if (track.kind === Track.Kind.Video) {
            if (import.meta.env.DEV) console.log('[LiveKit] 원격 비디오 구독:', p.identity);
            updateTrack(p.identity, track);
            if (pub.isMuted) setMutedState(p.identity, 'video', true);
          } else if (track.kind === Track.Kind.Audio) {
            if (import.meta.env.DEV) console.log('[LiveKit] 원격 오디오 구독:', p.identity);
            const audioEl = document.createElement('audio');
            audioEl.autoplay = true;
            track.attach(audioEl);
            document.body.appendChild(audioEl);
            audioElementsRef.current[p.identity] = audioEl;
            if (pub.isMuted) setMutedState(p.identity, 'audio', true);
          }
        });

        newRoom.on(RoomEvent.TrackUnsubscribed, (track, _pub, p) => {
          if (track.kind === Track.Kind.Video) {
            removeTrack(p.identity);
          } else if (track.kind === Track.Kind.Audio) {
            const audioEl = audioElementsRef.current[p.identity];
            if (audioEl) {
              track.detach(audioEl);
              audioEl.remove();
              delete audioElementsRef.current[p.identity];
            }
          }
        });

        newRoom.on(RoomEvent.TrackMuted, (pub, p) => {
          if (pub.kind === Track.Kind.Audio) {
            setMutedState(p.identity, 'audio', true);
          } else if (pub.kind === Track.Kind.Video) {
            setMutedState(p.identity, 'video', true);
          }
        });

        newRoom.on(RoomEvent.TrackUnmuted, (pub, p) => {
          if (pub.kind === Track.Kind.Audio) {
            setMutedState(p.identity, 'audio', false);
          } else if (pub.kind === Track.Kind.Video) {
            setMutedState(p.identity, 'video', false);
          }
        });

        // 4. 서버 연결
        await newRoom.connect(LIVEKIT_URL, token);
        if (cancelled) { newRoom.disconnect(); return; }

        // 5. 로컬 트랙 발행
        if (createdTracks.length > 0) {
          await Promise.all(createdTracks.map(t => newRoom.localParticipant.publishTrack(t)));
          if (cancelled) { newRoom.disconnect(); return; }
          if (import.meta.env.DEV) {
            console.log('[LiveKit] 로컬 트랙 발행 완료. 본인 identity:', newRoom.localParticipant.identity);
          }
        }

        // 6. 모든 await 완료 후 스토어 업데이트
        // setRoom/setRoomId는 effect 의존 배열에 포함되어 있으므로,
        // async 중간에 호출하면 effect cleanup이 실행되어 cancelled가 true로 되어 연결이 중단됨.
        // 따라서 모든 비동기 작업이 끝난 후에만 호출한다.
        setRoom(newRoom);
        setRoomId(roomId);
      } catch (err) {
        console.error('[LiveKit] 연결 실패:', err);
      } finally {
        connectingRef.current = false;
      }
    };

    connect();

    // 더 이상 hook 수준에서 disconnect를 자동으로 호출하지 않음.
    // 사용자가 방을 완전히 나갈 때 (Lobby 등으로 갈 때) 별도의 reset을 호출해야 함.
    return () => {
      cancelled = true;
    };
  }, [roomId, room, storedRoomId]);

  const toggleMic = async () => {
    if (room?.localParticipant) {
      const isEnabled = room.localParticipant.isMicrophoneEnabled;
      await room.localParticipant.setMicrophoneEnabled(!isEnabled);
    }
  };

  const toggleVideo = async () => {
    if (room?.localParticipant) {
      const isEnabled = room.localParticipant.isCameraEnabled;
      await room.localParticipant.setCameraEnabled(!isEnabled);
    }
  };

  return { tracks, localTrack, room, toggleMic, toggleVideo, mutedParticipants };
}

