import { Client } from '@stomp/stompjs';
import useAuthStore from '../stores/useAuthStore';

// WebSocket URL 자동 감지 함수
const getSocketUrl = () => {
  let baseUrl = import.meta.env.VITE_API_BASE_URL;
  if (!baseUrl) {
    baseUrl = window.location.origin;
  }
  return baseUrl.replace(/^http/, 'ws') + '/ws';
};

class WebSocketClient {
  constructor() {
    this.client = null;
    this.roomCode = null;
    this.subscriptions = {};
    this.messageCallbacks = {
      public: null,
      private: null,
      mafia: null,
    };
  }

  // 소켓 연결
  connect(roomCode, onMessageReceived) {
    this.roomCode = roomCode;
    this.messageCallbacks.public = onMessageReceived;
    this.messageCallbacks.private = onMessageReceived;

    const accessToken = useAuthStore.getState().accessToken;

    console.log(`[WS] Connecting to: ${getSocketUrl()}`);

    this.client = new Client({
      brokerURL: getSocketUrl(),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      debug: (str) => {
        if (import.meta.env.DEV) console.log('[WS Debug]', str);
      },
      onConnect: () => {
        console.log('[WS] Connected');
        this._subscribeToRoom();
        this._sendJoinRequest();
      },
      onStompError: (frame) => {
        console.error('[WS] Broker error:', frame.headers['message']);
        console.error('[WS] Details:', frame.body);
      },
      onWebSocketClose: () => {
        console.log('[WS] Connection closed');
      },
    });

    this.client.activate();
  }

  // 연결 종료
  disconnect() {
    if (this.client && this.client.active) {
      // 모든 구독 해제
      Object.values(this.subscriptions).forEach((sub) => {
        if (sub) sub.unsubscribe();
      });
      this.subscriptions = {};
      this.client.deactivate();
      console.log('[WS] Disconnected');
    }
  }

  // [내부용] 기본 구독 설정 (공용 + 개인)
  _subscribeToRoom() {
    if (!this.client || !this.roomCode) return;

    // 1. 공용 구독 (방 전체 이벤트)
    this.subscriptions.public = this.client.subscribe(
      `/topic/rooms/${this.roomCode}`,
      (message) => {
        const msg = JSON.parse(message.body);
        if (import.meta.env.DEV) console.log('[WS] Public:', msg.type, msg);
        if (this.messageCallbacks.public) {
          this.messageCallbacks.public(msg);
        }
      }
    );

    // 2. 개인 구독 (나에게만 오는 이벤트)
    this.subscriptions.private = this.client.subscribe(
      `/user/queue/rooms/${this.roomCode}`,
      (message) => {
        const msg = JSON.parse(message.body);
        if (import.meta.env.DEV) console.log('[WS] Private:', msg.type, msg);
        if (this.messageCallbacks.private) {
          this.messageCallbacks.private(msg);
        }
      }
    );
  }

  // 마피아 채널 구독 (역할 배정 후 마피아인 경우에만 호출)
  subscribeToMafiaChannel(onMafiaMessage) {
    if (!this.client || !this.roomCode) return;
    if (this.subscriptions.mafia) return; // 이미 구독 중

    this.messageCallbacks.mafia = onMafiaMessage;
    this.subscriptions.mafia = this.client.subscribe(
      `/topic/rooms/${this.roomCode}/mafia`,
      (message) => {
        const msg = JSON.parse(message.body);
        if (import.meta.env.DEV) console.log('[WS] Mafia:', msg.type, msg);
        if (this.messageCallbacks.mafia) {
          this.messageCallbacks.mafia(msg);
        }
      }
    );
    console.log('[WS] Subscribed to mafia channel');
  }

  // 마피아 채널 구독 해제
  unsubscribeFromMafiaChannel() {
    if (this.subscriptions.mafia) {
      this.subscriptions.mafia.unsubscribe();
      delete this.subscriptions.mafia;
      this.messageCallbacks.mafia = null;
      console.log('[WS] Unsubscribed from mafia channel');
    }
  }

  // [내부용] 입장 메시지 자동 전송
  _sendJoinRequest() {
    const user = useAuthStore.getState().user;
    const nickname = user?.nickname || 'Guest';

    this.publish('join', {
      nickname: nickname,
      clientType: 'WEB',
      requestId: `join-${Date.now()}`,
    });
  }

  // 동기화 요청
  sync(lastKnownVersion = 0) {
    this.publish('sync', {
      lastKnownVersion,
      requestId: `sync-${Date.now()}`,
    });
  }

  // 메시지 전송 (범용)
  publish(type, payload = {}) {
    if (!this.client || !this.client.active) {
      console.warn('[WS] Cannot publish, socket not active.');
      return;
    }

    const destination = `/app/rooms/${this.roomCode}/${type}`;
    if (import.meta.env.DEV) console.log('[WS] Publish:', destination, payload);

    this.client.publish({
      destination,
      body: JSON.stringify(payload),
    });
  }

  // === 게임 관련 메시지 전송 헬퍼 ===

  // 준비 상태 변경
  sendReady(ready) {
    this.publish('ready', {
      ready,
      requestId: `ready-${Date.now()}`,
    });
  }

  // 1차 투표 (용의자 지목)
  sendVote1(targetUserId) {
    this.publish('vote1/cast', {
      targetUserId,
      requestId: `vote1-${Date.now()}`,
    });
  }

  // 2차 투표 (찬반)
  sendVote2(agree) {
    this.publish('vote2/cast', {
      agree,
      requestId: `vote2-${Date.now()}`,
    });
  }

  // 마피아 타겟 제안
  sendMafiaPropose(targetUserId) {
    this.publish('night/mafia/propose', {
      targetUserId,
      requestId: `mafia-propose-${Date.now()}`,
    });
  }

  // 마피아 타겟 확정
  sendMafiaConfirm(targetUserId) {
    this.publish('night/mafia/confirm', {
      targetUserId,
      requestId: `mafia-confirm-${Date.now()}`,
    });
  }

  // 의사 보호 대상 선택
  sendDoctorSelect(targetUserId) {
    this.publish('night/doctor/select', {
      targetUserId,
      requestId: `doctor-${Date.now()}`,
    });
  }

  // 경찰 수사 대상 선택
  sendPoliceSelect(targetUserId) {
    this.publish('night/police/select', {
      targetUserId,
      requestId: `police-${Date.now()}`,
    });
  }

  // AI 찬스 요청 (시민만)
  sendAiChanceRequest(targetUserId) {
    this.publish('ai-chance/request', {
      targetUserId,
      requestId: `ai-chance-${Date.now()}`,
    });
  }

  // 강제 퇴장 (호스트만)
  sendKick(targetUserId) {
    this.publish('kick', {
      targetUserId,
      requestId: `kick-${Date.now()}`,
    });
  }

  // 퇴장
  sendLeave() {
    this.publish('leave', {
      requestId: `leave-${Date.now()}`,
    });
  }
}

// 싱글톤으로 내보내기
const websocketClient = new WebSocketClient();
export default websocketClient;
