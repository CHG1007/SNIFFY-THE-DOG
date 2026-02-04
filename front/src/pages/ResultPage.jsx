import React, { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import LastBeggingModal from '../components/modals/LastBeggingModal';
import FutureReportModal from "../components/modals/FutureReportModal";
import useGameStore from "../stores/useGameStore"
import ComplaintModal from "../components/modals/ComplaintModal";

const reportData = {
  MAFIA: {
    win: { jobTitle: "전설의 고독한 미식가", stats: [], message: "밤의 미식회가 승리로 끝났습니다. 이제 당신은 누구의 눈치도 보지 않고 최고급 만찬을 즐길 수 있습니다." },
    lose: { jobTitle: "은퇴한 뒷골목 대장", stats: [], message: "계획은 완벽했으나 운이 없었군요. 이제 뒷골목을 떠나 조용히 요양하며 지난날을 회상할 시간입니다." }
  },
  POLICE: {
    win: { jobTitle: "전설의 수사반장", stats: [], message: "모든 범죄를 소탕했습니다! 당신은 이제 정의의 상징으로 역사에 기록될 것이며, 평생 연금을 받으며 평화로운 노후를 보낼 것입니다." },
    lose: { jobTitle: "좌천된 파출소 순경", stats: [], message: "범인을 눈앞에서 놓친 충격으로 명예퇴직을 선택했습니다. 조용한 시골에서 낚시나 하며 여생을 보내게 될 것입니다." }
  },
  DOCTOR: {
    win: { jobTitle: "신의 손을 가진 명의", stats: [], message: "당신이 살려낸 생명들이 마을을 평화롭게 만들었습니다. 이제 메스를 내려놓고 당신의 건강을 돌보며 행복하게 사세요." },
    lose: { jobTitle: "면허 정지 위기의 돌팔이", stats: [], message: "치료법이 조금 독특했을 뿐인데... 결국 의사 가운을 벗게 되었습니다. 이제 약초나 캐러 산으로 떠날 준비를 하세요." }
  },
  CITIZEN: [
    {
      jobTitle: "영양사",
      stats: [
        { label: "갱생시킨 편식쟁이 학생", value: "2,500명", desc: "(피망까지 다 먹게 만듦)" },
        { label: "뒤집개로 때려잡은 마피아", value: "48명", desc: "(스테이크 굽듯이 노릇하게 구워줌)" },
        { label: "급식실 위생 점수", value: "100만 점", desc: "(바이러스가 미끄러져서 못 들어옴)" },
      ],
      message: "드디어 뒤집개를 내려놓을 시간입니다. 누구의 입맛도 맞출 필요 없는 오직 당신만을 위한 만찬을 즐기며 평생을 행복하게 살 것입니다."
    }
    // ... 시민 직업 50개 추가 지점
  ]
};

const getRoleImage = (role) => {
  switch (role) {
    case 'MAFIA': return "/assets/images/resultpage/mafia.png";
    case 'POLICE': return "/assets/images/resultpage/police.png";
    case 'DOCTOR': return "/assets/images/resultpage/doctor.png";
    default: return "/assets/images/resultpage/citizen.png";
  }
};

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const winner = params.get("winner") === "mafia" ? "mafia" : "citizen";
  const config = useMemo(() => getResultConfig(winner), [winner]);
  const players = location.state?.players ?? defaultPlayers;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFutureReport, setShowFutureReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const { myInfo, gameResult } = useGameStore();

  // 신고 모달
  const [isComplaintOpen, setIsComplaintOpen] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState("");
  
  useEffect(() => {
    // 3초(3000ms) 후에 모달 상태를 true로 변경
    const timer = setTimeout(() => {
      setIsModalOpen(true);
    }, 3000);

    return () => clearTimeout(timer); // 컴포넌트 언마운트 시 타이머 정리
  }, []);
  

  // 첫 번째 모달에서 '아니오'를 누르거나 닫을 때 실행되는 함수
  const handleCloseFirstModal = () => {
    setIsModalOpen(false);
  };

  const handleConfirm = () => {
    setIsModalOpen(false);

    // ✅ 내 직업과 승패 판별 로직
    const myRole = myInfo.role; // MAFIA, CITIZEN, POLICE, DOCTOR
    const winnerTeam = gameResult?.winnerTeam || (winner === 'mafia' ? 'MAFIA' : 'CITIZEN');
    
    // 내가 마피아면 마피아팀 승리 시 win, 아니면 lose
    // 내가 시민/경찰/의사면 시민팀 승리 시 win, 아니면 lose
    const isWin = (myRole === 'MAFIA' && winnerTeam === 'MAFIA') || 
                  (myRole !== 'MAFIA' && winnerTeam === 'CITIZEN');

    let report;
    if (myRole === 'MAFIA') {
      report = isWin ? reportData.MAFIA.win : reportData.MAFIA.lose;
    } else if (myRole === 'POLICE') {
      report = isWin ? reportData.POLICE.win : reportData.POLICE.lose;
    } else if (myRole === 'DOCTOR') {
      report = isWin ? reportData.DOCTOR.win : reportData.DOCTOR.lose;
    } else {
      // 시민은 승패 상관없이 랜덤 혹은 승패에 따른 랜덤을 원하시면 로직 추가 가능
      const citizenJobs = reportData.CITIZEN;
      report = citizenJobs[Math.floor(Math.random() * citizenJobs.length)];
    }

    setSelectedReport(report);
    setShowFutureReport(true);
  };

  // 두 번째 모달(미래 보고서)에서 '확인'을 눌렀을 때 실행
  const handleFinalClose = () => {
    setShowFutureReport(false);
  };

  // 신고 버튼 클릭 핸들러
  const handleOpenComplaint = (name) => {
    setSelectedTarget(name);
    setIsComplaintOpen(true);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
        <img
            src={config.backgroundSrc}
            alt="result background"
            className="absolute inset-0 h-full w-full object-cover scale-[1.03]"
        />
      <div className={`absolute inset-0 ${config.overlay}`} />
      
      {/* 로비로 돌아가기 버튼 추가 (우측 상단) */}
      <div className="absolute bottom-18 left-1/2 -translate-x-1/2 z-50">
        <button
          onClick={() => navigate("/rooms")}
          className="px-6 py-2 rounded-lg border-2 border-white/30 bg-white/10 text-white font-semibold backdrop-blur-md hover:bg-white/20 transition-all active:scale-95"
          style={{ fontFamily: "Pretendard" }}
        >
          로비로 돌아가기
        </button>
      </div>
      
      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
            <h1 style={{ fontFamily: "PressStart2P", color: "white", textAlign: "center", fontSize: "100px" }}>{config.titleText}</h1>

        <div className="flex justify-center">
            <div
                className={[
                "relative",                
                "mt-[50px] mb-[80px]",     
                "w-[1200px]", 
                "h-[470px]",      
                "rounded-[10px]",          
                "bg-black/70",              
                "p-6",
                "shadow-2xl",
                "backdrop-blur-md",
                ].join(" ")}
            >
            <div className={`pointer-events-none absolute inset-3 rounded-[10px] border-2 ${config.panelBorder}`} />
       

            <div className="relative grid grid-cols-1 gap-x-10 gap-y-8 place-items-center py-6 sm:grid-cols-2 lg:grid-cols-3">
              {players.map((p) => (
            <div key={p.userId || p.id} className="flex flex-col items-center">
                    <img
                    src={getRoleImage(p.role || p.roleLabel)}
                    alt={`${p.nickname || p.name} avatar`}
                    className="h-[100px] w-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.55)]"
                    />

                    <div className="mt-4 flex items-center gap-3">
                    <div
                        className="text-white text-[23px] leading-none"
                        style={{ fontFamily: "Pretendard", fontWeight: "500" }}
                    >
                        {p.nickname || p.name}
                    </div>
                    <button
                        type="button"
                        className={[
                        "flex items-center gap-2",
                        "h-[40px] px-4",
                        "rounded-full",
                        "border-2 border-primary/90",
                        "text-primary",
                        "bg-black/20",
                        "backdrop-blur-sm",
                        "shadow-[0_8px_18px_rgba(0,0,0,0.35)]",
                        "hover:bg-black/30 active:scale-[0.99]",
                        ].join(" ")}
                        onClick={() => {
                        handleOpenComplaint(p.nickname || p.name)
                        }}
                    >
                        <span className="text-primary text-[18px]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-exclamation-triangle" viewBox="0 0 16 16">
                                <path d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.15.15 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.2.2 0 0 1-.054.06.1.1 0 0 1-.066.017H1.146a.1.1 0 0 1-.066-.017.2.2 0 0 1-.054-.06.18.18 0 0 1 .002-.183L7.884 2.073a.15.15 0 0 1 .054-.057m1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767z"/>
                                <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0M7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0z"/>
                            </svg>
                        </span>
                        <span
                        className="text-[20px] text-primary"
                        style={{ fontFamily: "Pretendard", fontWeight: "600" }}
                        >
                        신고
                        </span>
                    </button>
                </div>
            </div>
            ))}

            </div>
          </div>
        </div>
      </div>
      <LastBeggingModal 
        isOpen={isModalOpen} 
        onClose={handleCloseFirstModal}
        onConfirm={handleConfirm}
        message={"당신의 미래를\n알고 싶으신가요?"}
      />
      <FutureReportModal 
        isOpen={showFutureReport} 
        onClose={handleFinalClose} 
        data={selectedReport}
      />

      <ComplaintModal 
        isOpen={isComplaintOpen} 
        onClose={() => setIsComplaintOpen(false)} 
        targetName={selectedTarget}
      />
    </div>
  );
}

/** winner별 설정 */
function getResultConfig(winner) {
  if (winner === "mafia") {
    return {
      titleText: "MAFIA WIN",
      backgroundSrc: "/assets/images/citizenlose.png",
      overlay: "",
      panelBorder: "border-primary/60",
      primaryBtn: "bg-primary text-black hover:brightness-105 active:brightness-95",
    };
  }

  return {
    titleText: "CITIZEN WIN",
    backgroundSrc: "/assets/images/resultpage/citizenwin.png",
    overlay: "",
    panelBorder: "border-primary/60",
    primaryBtn: "bg-primary text-black hover:brightness-105 active:brightness-95",
  };
}

/** 더미 데이터 */
const defaultPlayers = [
  { id: 1, name: "조채연", roleLabel: "POLICE", avatarSrc: "/assets/images/resultpage/police.png" },
  { id: 2, name: "최지희", roleLabel: "CITIZEN", avatarSrc: "/assets/images/resultpage/citizen.png" },
  { id: 3, name: "변지영", roleLabel: "MAFIA", avatarSrc: "/assets/images/resultpage/mafia.png" },
  { id: 4, name: "길태환", roleLabel: "DOCTOR", avatarSrc: "/assets/images/resultpage/doctor.png" },
  { id: 5, name: "박연준", roleLabel: "CITIZEN", avatarSrc: "/assets/images/resultpage/citizen.png" },
  { id: 6, name: "최홍권", roleLabel: "MAFIA", avatarSrc: "/assets/images/resultpage/mafia.png" },
];