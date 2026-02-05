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

// 콘솔 로그 스타일 (색상으로 구분)
const logStyles = {
  send: 'background: #4CAF50; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  receive: 'background: #2196F3; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  private: 'background: #9C27B0; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  mafia: 'background: #F44336; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  system: 'background: #FF9800; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
  error: 'background: #D32F2F; color: white; padding: 2px 6px; border-radius: 3px; font-weight: bold;',
};

// 로깅 함수
const wsLog = {
  send: (destination, payload) => {
    console.log('%c⬆ SEND', logStyles.send, destination);
    console.log('  Payload:', payload);
  },
  receive: (channel, type, data) => {
    console.log(`%c⬇ ${channel}`, logStyles.receive, type);
    console.log('  Data:', data);
  },
  private: (type, data) => {
    console.log('%c⬇ PRIVATE', logStyles.private, type);
    console.log('  Data:', data);
  },
  mafia: (type, data) => {
    console.log('%c⬇ MAFIA', logStyles.mafia, type);
    console.log('  Data:', data);
  },
  system: (message, ...args) => {
    console.log('%c🔌 WS', logStyles.system, message, ...args);
  },
  error: (message, ...args) => {
    console.log('%c❌ WS ERROR', logStyles.error, message, ...args);
  },
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
  // options: { autoSync: boolean } - 연결 후 자동으로 sync 호출 여부
  connect(roomCode, onMessageReceived, options = {}) {
    this.roomCode = roomCode;
    this.messageCallbacks.public = onMessageReceived;
    this.messageCallbacks.private = onMessageReceived;

    const accessToken = useAuthStore.getState().accessToken;
    const { autoSync = false } = options;

    wsLog.system('Connecting to:', getSocketUrl());

    this.client = new Client({
      brokerURL: getSocketUrl(),
      connectHeaders: {
        Authorization: `Bearer ${accessToken}`,
      },
      reconnectDelay: 5000,
      debug: () => {
        // STOMP 프레임 디버그 비활성화 (필요시 활성화)
      },
      onConnect: () => {
        wsLog.system('Connected ✓');
        this._subscribeToRoom();
        this._sendJoinRequest();
        // 옵션에 따라 sync 자동 호출 (게임 페이지에서 사용)
        if (autoSync) {
          setTimeout(() => this.sync(), 100);
        }
      },
      onStompError: (frame) => {
        wsLog.error('Broker error:', frame.headers['message']);
        wsLog.error('Details:', frame.body);
      },
      onWebSocketClose: () => {
        wsLog.system('Connection closed');
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
      wsLog.system('Disconnected');
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
        wsLog.receive('PUBLIC', msg.type, msg.data || msg);
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
        wsLog.private(msg.type, msg.data || msg);
        if (this.messageCallbacks.private) {
          this.messageCallbacks.private(msg);
        }
      }
    );

    wsLog.system('Subscribed to room:', this.roomCode);
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
        wsLog.mafia(msg.type, msg.data || msg);
        if (this.messageCallbacks.mafia) {
          this.messageCallbacks.mafia(msg);
        }
      }
    );
    wsLog.system('Subscribed to MAFIA channel 🔪');
  }

  // 마피아 채널 구독 해제
  unsubscribeFromMafiaChannel() {
    if (this.subscriptions.mafia) {
      this.subscriptions.mafia.unsubscribe();
      delete this.subscriptions.mafia;
      this.messageCallbacks.mafia = null;
      wsLog.system('Unsubscribed from MAFIA channel');
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
      wsLog.error('Cannot publish, socket not active.');
      return;
    }

    const destination = `/app/rooms/${this.roomCode}/${type}`;
    wsLog.send(destination, payload);

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

  // 게임 종료 후 대기실로 복귀
  sendRestart() {
    this.publish('restart', {
      requestId: `restart-${Date.now()}`,
    });
  }

  // Phase End 방식 - 타이머 0초 도달 시 phase 종료 요청
  sendPhaseEnd(phase) {
    this.publish('phase/end', {
      phase,
      requestId: `phase-end-${Date.now()}`,
    });
  }

  // 타이머 스킵 — 현재 페이즈 종료 시각을 지금+3초로 갱신 (테스트용)
  sendTimerSkip(phase) {
    this.publish('timer/skip', {
      phase,
      requestId: `timer-skip-${Date.now()}`,
    });
  }
}

// 싱글톤으로 내보내기
const websocketClient = new WebSocketClient();
export default websocketClient;
