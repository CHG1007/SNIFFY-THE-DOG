import React, { useEffect, useState, useRef } from 'react'; // useRef 추가
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Settings, Mic, MicOff, Video, VideoOff, LogOut } from 'lucide-react';

// API & Utils
import websocketClient from '../api/websocketClient';
import { updateRoomInfo } from '../api/roomApi';

// Components
import LoadingPage from './LoadingPage';
import WaitingGrid from '../components/waiting/WaitingGrid';
import GameStartCountdown from '../components/waiting/GameStartCountdown';

// Modals
import CreateGameModal from '../components/modals/CreateGameModal';
import LastBeggingModal from '../components/modals/LastBeggingModal';
import GameAlertModal from '../components/modals/GameAlertModal';

const WaitingRoomPage = () => {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- 상태 관리 ---
  const [players, setPlayers] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [myInfo, setMyInfo] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // --- 로컬 UI 상태 ---
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetKickPlayer, setTargetKickPlayer] = useState(null);
  const [isMicOn, setIsMicOn] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

  // ✅ [추가] 최신 상태를 참조하기 위한 Ref
  // 소켓 핸들러가 만들어질 당시의 옛날 state가 아니라, 현재의 state를 읽기 위함
  const myInfoRef = useRef(myInfo);
  const locationRef = useRef(location);

  // state가 변할 때마다 ref도 업데이트
  useEffect(() => {
    myInfoRef.current = myInfo;
    locationRef.current = location;
  }, [myInfo, location]);

  // --- 소켓 메시지 핸들러 ---
  // useCallback을 제거하거나 의존성을 비워도 되지만, 내부에서 Ref를 쓰면 안전합니다.
  const handleSocketMessage = (msg) => {
    const { type, data } = msg;

    if (import.meta.env.DEV) console.log("[WS Recv]", type, data);

    switch (type) {
      case 'JOIN_ACK':
        { setPlayers(data.roomState.players);

        // Ref 사용
        const createdData = locationRef.current.state?.createdData;
        const initialCapacity = createdData?.capacity || data.roomState.capacity || 8;
        const initialTitle = createdData?.title || data.roomState.title || "즐거운 마피아 게임";
        const initialPrivate = createdData?.isPrivate || (data.roomState.status === 'PRIVATE') || false;

        let rawCode = data.roomState.roomCode || roomId;
        if (rawCode.includes('RoomId[value=')) {
          rawCode = rawCode.replace('RoomId[value=', '').replace(']', '');
        }

        setRoomInfo({
          title: initialTitle,
          capacity: initialCapacity,
          hostUserId: data.roomState.hostUserId,
          status: initialPrivate ? 'PRIVATE' : 'WAITING',
          inviteCode: rawCode,
          isPrivate: initialPrivate
        });
        setMyInfo(data.my);

        // [WS 가이드 반영] 입장이 성공(ACK)하면 동기화(sync)를 시도하여 최종 상태 확정
        websocketClient.sync();
        break; }

      case 'ROOM_SNAPSHOT':
        // 1. 방 정보 및 플레이어 정보 동기화
        { setPlayers(data.roomState.players);
        setMyInfo(data.my);

        let ssCode = data.roomState.roomCode || roomId;
        if (ssCode.includes('RoomId[value=')) {
          ssCode = ssCode.replace('RoomId[value=', '').replace(']', '');
        }

        setRoomInfo({
          title: data.roomState.title,
          capacity: data.roomState.capacity,
          hostUserId: data.roomState.hostUserId,
          status: data.roomState.status,
          inviteCode: ssCode,
          isPrivate: data.roomState.status === 'PRIVATE' || data.roomState.isPrivate // 서버 필드가 무엇인지에 따라 유동적
        });

        // 2. [WS 가이드 반영] 현재 phase가 WAITING인지 PLAYING인지 확정하여 처리
        if (data.roomState.status === 'PLAYING') {
          navigate(`/game/${roomId}`, {
            state: { myInfo: data.my, players: data.roomState.players }
          });
        }
        break; }

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
        // Ref 사용: 현재 내 아이디와 비교
        if (myInfoRef.current && data.userId === myInfoRef.current.userId) {
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
        // 이동 시에는 현재 상태(players)를 가져가야 하므로 setPlayers의 최신값 활용 필요
        // 하지만 navigate는 비동기가 아니므로 여기서 바로 players를 쓰면 옛날 값일 수 있음.
        // 여기서는 간단히 처리하고, GamePage에서 다시 fetching하는 게 안전함.
        navigate(`/game/${roomId}`, {
          state: { myInfo: myInfoRef.current, players } // players는 클로저 영향 받을 수 있음 주의
        });
        break;

      case 'KICKED':
        alert(data.reason || "방장에 의해 강퇴되었습니다.");
        websocketClient.disconnect();
        navigate('/rooms');
        break;

      case 'JOIN_REJECTED':
      case 'ERROR':
        setErrorMsg(data.message || "오류가 발생했습니다.");
        if (type === 'JOIN_REJECTED' && !data.retryable) {
          navigate('/rooms');
        }
        break;

      default:
        break;
    }
  };

  // ✅ [핵심 수정] 라이프사이클: 방 번호(roomId)가 바뀔 때만 연결!
  // handleSocketMessage가 바뀌어도 재연결하지 않음.
  useEffect(() => {
    // 소켓 클라이언트 내부에서 콜백을 호출할 때
    // 항상 최신 handleSocketMessage 로직이 실행되도록 래핑
    const onMessage = (msg) => handleSocketMessage(msg);

    websocketClient.connect(roomId, onMessage);

    return () => {
      websocketClient.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roomId]);


  // --- 핸들러 ---
  const handleToggleReady = () => {
    if (!myInfo) return;
    websocketClient.publish('ready', { ready: !myInfo.ready });
  };

  const handleKickConfirm = () => {
    if (!targetKickPlayer) return;
    websocketClient.publish('kick', { targetUserId: targetKickPlayer.userId });
    setTargetKickPlayer(null);
  };

  const handleUpdateRoom = async (newData) => {
    try {
      if (updateRoomInfo) {
        await updateRoomInfo(roomId, newData);
      }
      setRoomInfo(prev => ({ ...prev, ...newData }));
      setIsSettingsOpen(false);
    } catch (err) {
      console.error("방 정보 수정 실패:", err);
      setErrorMsg("방 정보 수정에 실패했습니다.");
    }
  };

  const handleToggleMic = () => setIsMicOn(!isMicOn);
  const handleToggleVideo = () => setIsVideoOn(!isVideoOn);

  const handleExit = () => {
    if (window.confirm("정말 방을 나가시겠습니까?")) {
      try {
        websocketClient.publish('leave', {});
      } catch (e) {
        console.warn(e);
      }
      websocketClient.disconnect();
      navigate('/rooms');
    }
  };

  const handleCountdownComplete = () => {
    console.log("Countdown finished!");
  };

  // --- 렌더링 ---
  if (!roomInfo || !myInfo) {
    return <LoadingPage message="대기방에 입장 중입니다..." />;
  }

  const amIHost = myInfo.userId === roomInfo.hostUserId;
  const amIReady = myInfo.ready;
  const formattedPlayers = players.map(p => ({
    userId: p.userId,
    name: p.nickname || p.displayName,
    isHost: p.userId === roomInfo.hostUserId,
    isReady: p.ready,
    isMicOn: p.userId === myInfo.userId ? isMicOn : false,
    isVideoOn: p.userId === myInfo.userId ? isVideoOn : true,
    photo: p.profileImage,
  }));

  if (countdown !== null) {
    return <GameStartCountdown count={countdown} onComplete={handleCountdownComplete} />;
  }
  return (
    <div className="fixed inset-0 z-[100] w-full h-screen overflow-hidden bg-black text-white selection:bg-orange-500/30">

      {/* 배경 */}
      <div className="absolute inset-0 z-0 bg-[#0a0a0f]">
        <img
          src="/assets/images/waitingroom/bg_main.png"
          alt="Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
      </div>

      {/* 헤더 */}
      <header className="relative z-10 w-full flex items-center justify-center pt-4 pb-1 px-12">
        <h1 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600 drop-shadow-[0_0_10px_rgba(255,100,0,0.5)] tracking-tighter truncate max-w-2xl min-w-[200px] text-center pr-4">
          {roomInfo.title}
        </h1>

        {amIHost && (
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="absolute right-8 top-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/70 hover:text-white transition-all border border-white/5 hover:border-orange-500/50"
          >
            <Settings size={20} />
          </button>
        )}
      </header>

      {/* 메인 */}
      <main className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-0">
        <WaitingGrid
          players={formattedPlayers}
          myId={myInfo.userId}
          isHost={amIHost}
          onKick={setTargetKickPlayer}
          capacity={roomInfo.capacity}
        />
      </main>

      {/* 컨트롤 바 */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#0a0a0f]/95 backdrop-blur-md px-6 py-2.5 rounded-full border border-white/10 shadow-2xl">
        <button onClick={handleToggleMic} className={`p-2.5 rounded-full transition-all border ${isMicOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isMicOn ? <Mic size={20} /> : <MicOff size={20} />}
        </button>
        <button onClick={handleToggleVideo} className={`p-2.5 rounded-full transition-all border ${isVideoOn ? 'bg-white/10 border-white/20 text-white' : 'bg-red-500/10 border-red-500/50 text-red-500'}`}>
          {isVideoOn ? <Video size={20} /> : <VideoOff size={20} />}
        </button>
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        <button
          onClick={handleToggleReady}
          className={`group relative px-8 py-2.5 rounded-full font-black text-lg italic tracking-wider transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(0,0,0,0.5)] min-w-[140px] flex items-center justify-center ${amIReady ? 'bg-transparent text-gray-400 border border-white/10 hover:bg-white/5' : 'bg-white text-black hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]'}`}
        >
          <span className="relative z-10">{amIReady ? "CANCEL" : "READY"}</span>
          {!amIReady && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />}
        </button>
        <div className="w-[1px] h-8 bg-white/10 mx-1" />
        <button onClick={handleExit} className="p-2.5 rounded-full bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-500 transition-all text-white/70">
          <LogOut size={20} />
        </button>
      </div>

      {/* 모달 */}
      {isSettingsOpen && (
        <CreateGameModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          initialData={{
            title: roomInfo.title,
            capacity: roomInfo.capacity,
            isPrivate: roomInfo.isPrivate
          }}
          isEdit={true}
          isHost={amIHost}
          inviteCode={roomInfo.inviteCode}
          onSave={handleUpdateRoom}
        />
      )}
      {targetKickPlayer && (
        <LastBeggingModal
          isOpen={!!targetKickPlayer}
          onClose={() => setTargetKickPlayer(null)}
          onConfirm={handleKickConfirm}
          message={`${targetKickPlayer.name}님을\n강제 퇴장하시겠습니까?`}
        />
      )}
      {errorMsg && (
        <GameAlertModal
          isOpen={!!errorMsg}
          onClose={() => setErrorMsg(null)}
          message={errorMsg}
        />
      )}
    </div>
  );
};

export default WaitingRoomPage;