# 🐶 SNIFFY THE DOG (WebRTC 기반 AI 화상 게임)

> **SSAFY 자율 프로젝트 (2026.01 ~ 2026.02)**
> 실시간 화상 통신(WebRTC)과 AI 분석을 결합한 멀티플레이어 웹 게임 서비스입니다.

## 📌 Project Overview
- **개발 기간:** 2026.01 ~ 2026.02 (약 1개월)
- **개발 인원:** 6명
- **담당 역할:** 백엔드 (Backend)
- **주요 기능:** 실시간 화상 통신, 게임 로직 처리, 유저 전적 및 AI 행동 분석, 실시간 채팅

---

## 🛠️ Tech Stack
### Backend
- **Language:** Java 21
- **Framework:** Spring Boot 3.x
- **Database:** MySQL, Redis, MongoDB
- **Architecture:** Hexagonal Architecture

### Infrastructure & Media
- **Media Server:** LiveKit (WebRTC)
- **CI/CD:** GitLab CI, Docker, Docker Compose
- **Web Server:** Nginx

### Collaboration
- Jira, GitLab, Notion, Mattermost

---

## 🌟 My Contributions (주요 기여 및 문제 해결)

백엔드 리드로서 **시스템의 안정성, 확장성, 그리고 팀의 개발 생산성 향상**에 집중했습니다.

### 1. 헥사고날 아키텍처(Hexagonal Architecture) 도입 및 마이그레이션 비용 98% 절감
- **상황:** 프로젝트 중반, 초기 미디어 서버였던 OpenVidu의 Docker 내 포트 충돌 이슈로 서비스 불능 위기 발생.
- **해결:** 핵심 게임 도메인 로직(RoomSession 등)이 외부 모듈에 의존하지 않도록 헥사고날 아키텍처를 초기부터 설계함.
- **결과:** 일반적인 계층형(Layered) 구조였다면 약 300줄 이상의 연쇄적인 비즈니스 로직 수정이 필요했으나, 핵심 도메인 코드는 단 1줄도 수정하지 않고 `LiveKitAdapter` 구현체만 추가 및 주입하여 **리팩토링 비용을 98% 이상 절감**하고 성공적으로 서버를 교체함.

### 2. 대규모 트래픽 대비 3-Tier DB 분산 설계
- 실시간 게임 특성상 발생하는 트래픽 병목을 해소하기 위해 데이터 성격에 따른 분산 저장소 설계.
  - **MySQL:** 유저 정보 및 영구적인 메타데이터 저장
  - **Redis:** 실시간 게임 룸 세션 및 빠른 I/O가 필요한 접속 상태 관리 (인메모리)
  - **MongoDB:** 실시간 채팅 로그 및 비정형 대용량 게임 분석 데이터 저장

### 3. GitLab CI/CD 파이프라인 및 무중단 배포 환경 구축
- 팀원들이 개발에만 집중할 수 있도록 `.gitlab-ci.yml`과 `docker-compose.yml`을 활용한 배포 자동화 구축.
- Nginx를 활용한 리버스 프록시 설정으로 클라이언트 요청을 안전하게 라우팅함.

### 4. 애자일(Agile) 기반의 팀 리딩과 코드 리뷰 문화 정착
- 6인 팀의 팀장으로서 Jira 백로그를 활용한 업무 세분화 및 타임박싱(Time-boxing) 적용.
- 매일 10분 데일리 스크럼을 주도하여 개발 병목(Blocker)을 신속히 파악하고 기술 지원.
- GitLab Merge Request 시 **'최소 2인 승인 후 병합(Approve)'** 규칙을 강제하여 상호 코드 리뷰 문화를 정착시키고 코드 품질을 향상함.

---

## 📁 Repository Structure
```text
SNIFFY-THE-DOG/
├── back/                  # Spring Boot 백엔드 애플리케이션 (Hexagonal Architecture)
├── front/                 # Vue.js 프론트엔드 애플리케이션
├── nginx/                 # 웹 서버 및 리버스 프록시 설정
├── .gitlab-ci.yml         # GitLab CI/CD 파이프라인 설정
├── docker-compose.yml     # 멀티 컨테이너 실행 환경 구성
└── livekit.yaml           # LiveKit WebRTC 서버 설정
