import { Client } from '@stomp/stompjs';
import useAuthStore from '../stores/useAuthStore';

// ✅ [핵심 수정] WebSocket URL 자동 감지 함수
const getSocketUrl = () => {
  // 1. 환경 변수가 설정되어 있다면 그것을 우선 사용
  let baseUrl = import.meta.env.VITE_API_BASE_URL;

  // 2. 환경 변수가 없다면(배포 환경 등), 현재 브라우저의 주소(Origin)를 사용
  //    (예: https://my-game.com 에서 접속 시 -> https://my-game.com 사용)
  if (!baseUrl) {
    baseUrl = window.location.origin;
  }

  // 3. 프로토콜 변환: http -> ws, https -> wss
  //    (뒤에 /ws 엔드포인트 붙임)
  return baseUrl.replace(/^http/, 'ws') + '/ws';
};

class WebSocketClient {
  constructor() {
    this.client = null;
    this.roomCode = null;
  }

  // 소켓 연결
  connect(roomCode, onMessageReceived) {
    this.roomCode = roomCode;
    const accessToken = useAuthStore.getState().accessToken; // 스토어에서 토큰 가져오기

    console.log(`🔌 Connecting to WebSocket: ${getSocketUrl()}`);

    this.client = new Client({
      brokerURL: getSocketUrl(), // ✅ 수정된 함수 사용
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`, // 헤더에 토큰 추가
      },
      reconnectDelay: 5000, // 연결 끊기면 5초 뒤 재연결 시도
      debug: (str) => {
        // 개발 모드에서만 로그 출력
        if (import.meta.env.DEV) console.log('[WS Debug]', str);
      },
      onConnect: () => {
        console.log('✅ WebSocket Connected');
        this._subscribeToRoom(onMessageReceived);
        this._sendJoinRequest();
      },
      onStompError: (frame) => {
        console.error('❌ Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      },
      onWebSocketClose: () => {
        console.log('Pf WebSocket connection closed');
      },
    });

    this.client.activate();
  }

  // 연결 종료
  disconnect() {
    if (this.client && this.client.active) {
      // 퇴장 메시지 전송 (필요 시 주석 해제)
      // this.publish('leave', {}); 
      this.client.deactivate();
      console.log('qw WebSocket Disconnected');
    }
  }

  // [내부용] 구독 설정
  _subscribeToRoom(callback) {
    if (!this.client || !this.roomCode) return;

    // 1. 공용 구독 (방 전체 이벤트)
    this.client.subscribe(`/topic/rooms/${this.roomCode}`, (message) => {
      callback(JSON.parse(message.body));
    });

    // 2. 개인 구독 (나에게만 오는 이벤트: 에러, 내 정보 등)
    this.client.subscribe(`/user/queue/rooms/${this.roomCode}`, (message) => {
      callback(JSON.parse(message.body));
    });
  }

  // [내부용] 입장 메시지 자동 전송
  _sendJoinRequest() {
    // 닉네임은 토큰에서 백엔드가 추출하거나, 필요하면 여기서 보냄
    const nickname = useAuthStore.getState().user?.nickname || 'Guest'; 
    
    this.publish('join', {
      nickname: nickname,
      clientType: 'WEB',
      requestId: `req-${Date.now()}`
    });
  }

  // 메시지 전송 (Publish) - 외부에서 사용
  // type 예시: 'join', 'ready', 'start', 'kick', 'leave'
  publish(type, payload = {}) {
    if (!this.client || !this.client.active) {
      console.warn('⚠️ Cannot publish, socket not active.');
      return;
    }

    this.client.publish({
      destination: `/app/rooms/${this.roomCode}/${type}`,
      body: JSON.stringify(payload),
    });
  }
}

// 싱글톤으로 내보내기 (어디서든 같은 인스턴스 사용)
const websocketClient = new WebSocketClient();
export default websocketClient;