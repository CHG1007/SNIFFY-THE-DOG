import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import websocketClient from '../api/websocketClient';

import CreatorWaitingPage from './CreatorWaitingPage';
import UserWaitingPage from './UserWaitingPage';
import LoadingPage from './LoadingPage';
import GameStartCountdown from '../components/waiting/GameStartCountdown';
import GameAlertModal from '../components/modals/GameAlertModal';

const WaitingRoomPage = () => {
  const { roomId } = useParams(); // roomId = roomCode
  const navigate = useNavigate();

  // --- 상태 관리 ---
  const [players, setPlayers] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [myInfo, setMyInfo] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- 소켓 메시지 핸들러 ---
  const handleSocketMessage = useCallback((msg) => {
    const { type, data } = msg;

    if (import.meta.env.DEV) console.log("[WS Recv]", type, data);

    switch (type) {
      case 'JOIN_ACK':
        setPlayers(data.roomState.players);
        setRoomInfo({
          title: "즐거운 마피아 게임", // 백엔드에 필드 추가되면 data.roomState.title로 변경
          capacity: 8,
          hostUserId: data.roomState.hostUserId,
          status: data.roomState.status,
          inviteCode: data.roomState.roomCode || roomId 
        });
        setMyInfo(data.my);
        break;

      case 'ROOM_PLAYER_JOINED':
        setPlayers((prev) => {
          if (prev.find(p => p.userId === data.player.userId)) return prev;
          return [...prev, data.player];
        });
        if (data.roomState) {
          setRoomInfo(prev => ({ ...prev, hostUserId: data.roomState.hostUserId }));
        }
        break;

      case 'ROOM_PLAYER_LEFT':
        setPlayers((prev) => prev.filter(p => p.userId !== data.userId));
        if (data.roomState) {
          setRoomInfo(prev => ({ ...prev, hostUserId: data.roomState.hostUserId }));
        }
        break;

      case 'PLAYER_STATUS_CHANGED':
      case 'ROOM_READY_UPDATED':
        setPlayers((prev) => prev.map(p => 
          p.userId === data.userId ? { ...p, ready: data.ready } : p
        ));
        if (myInfo && data.userId === myInfo.userId) {
          setMyInfo(prev => ({ ...prev, ready: data.ready }));
        }
        break;

      case 'GAME_COUNTDOWN':
        setCountdown(data.seconds);
        break;

      case 'GAME_COUNTDOWN_CANCELLED':
        setCountdown(null);
        break;

      case 'PHASE_CHANGED':
        if (data.phase === 'DAY') {
          navigate(`/game/${roomId}`, { 
            state: { myInfo, players } 
          });
        }
        break;

      case 'KICKED':
        alert("방장에 의해 강퇴되었습니다.");
        navigate('/');
        break;
      
      case 'JOIN_REJECTED':
      case 'ERROR':
        setErrorMsg(data.message || "오류가 발생했습니다.");
        if (type === 'JOIN_REJECTED' && !data.retryable) {
          navigate('/');
        }
        break;

      default:
        break;
    }
  }, [navigate, roomId, myInfo]);

  // --- 라이프사이클 ---
  useEffect(() => {
    websocketClient.connect(roomId, handleSocketMessage);
    return () => websocketClient.disconnect();
  }, [roomId, handleSocketMessage]);

  // --- 사용자 액션 ---
  const handleToggleReady = () => {
    if (!myInfo) return;
    websocketClient.publish('ready', { ready: !myInfo.ready });
  };

  const handleGameStartRequest = () => {
    websocketClient.publish('start'); 
  };

  const handleKickUser = (targetUserId) => {
    const targetId = typeof targetUserId === 'object' ? targetUserId.userId : targetUserId;
    websocketClient.publish('kick', { targetUserId: targetId });
  };

  const updateRoomData = (newData) => {
    console.log("Update room info:", newData);
  };

  // --- 렌더링 ---
  if (!roomInfo || !myInfo) {
    return <LoadingPage message="Connecting to Server..." />;
  }

  const formattedRoomData = {
    roomId: roomId,
    title: roomInfo.title,
    hostUserId: roomInfo.hostUserId,
    capacity: roomInfo.capacity,
    inviteCode: roomInfo.inviteCode,
    players: players.map(p => ({
        userId: p.userId,
        displayName: p.nickname,
        ready: p.ready,
        isHost: p.userId === roomInfo.hostUserId,
        photo: p.profileImage || "https://via.placeholder.com/150",
    }))
  };

  const amIHost = myInfo.userId === roomInfo.hostUserId;

  return (
    <>
      {amIHost ? (
        <CreatorWaitingPage 
            roomData={formattedRoomData} 
            updateRoomData={updateRoomData} 
            onGameStart={handleGameStartRequest}
            onKick={handleKickUser}
            myId={myInfo.userId} // ✅ 내 ID 전달 (중요)
        />
      ) : (
        <UserWaitingPage 
            roomData={formattedRoomData} 
            onReady={handleToggleReady} // ✅ 이름 변경 (onGameStart -> onReady)
            myId={myInfo.userId} // ✅ 내 ID 전달 (중요)
        />
      )}

      {countdown !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
           <GameStartCountdown count={countdown} />
        </div>
      )}

      {errorMsg && (
        <GameAlertModal 
          isOpen={!!errorMsg} 
          onClose={() => setErrorMsg(null)} 
          message={errorMsg} 
        />
      )}
    </>
  );
};

export default WaitingRoomPage;