import { Client } from '@stomp/stompjs';
import useAuthStore from '../stores/useAuthStore';

// HTTP URL을 WebSocket URL로 변환 (예: http:// -> ws://, https:// -> wss://)
const getSocketUrl = () => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
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

    this.client = new Client({
      brokerURL: getSocketUrl(),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`, // 헤더에 토큰 추가
      },
      reconnectDelay: 5000, // 연결 끊기면 5초 뒤 재연결 시도
      debug: (str) => {
        // 개발 모드에서만 로그 출력 (선택 사항)
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
      // 퇴장 메시지 전송 (선택 사항, 필요 시 활성화)
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