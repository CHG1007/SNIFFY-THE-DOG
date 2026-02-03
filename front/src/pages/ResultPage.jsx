import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const winner = params.get("winner") === "mafia" ? "mafia" : "citizen";
  const config = useMemo(() => getResultConfig(winner), [winner]);
  const players = location.state?.players ?? defaultPlayers;

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
        <img
            src={config.backgroundSrc}
            alt="result background"
            className="absolute inset-0 h-full w-full object-cover scale-[1.03]"
        />
      <div className={`absolute inset-0 ${config.overlay}`} />
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
            <div key={p.id} className="flex flex-col items-center">
                    <img
                    src={p.avatarSrc}
                    alt={`${p.name} avatar`}
                    className="h-[100px] w-auto object-contain drop-shadow-[0_10px_14px_rgba(0,0,0,0.55)]"
                    />

                    <div className="mt-4 flex items-center gap-3">
                    <div
                        className="text-white text-[23px] leading-none"
                        style={{ fontFamily: "Pretendard", fontWeight: "500" }}
                    >
                        {p.name}
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
                        // TODO: 신고 로직 연결
                        console.log("report:", p.id, p.name);
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
    </div>
  );
}

/** winner별 설정 */
function getResultConfig(winner) {
  if (winner === "mafia") {
    return {
      titleText: "MAFIA WIN",
      backgroundSrc: "/assets/images/citizenlose.png",
      overlay: "bg-black/55",
      panelBorder: "border-primary/60",
      primaryBtn: "bg-primary text-black hover:brightness-105 active:brightness-95",
    };
  }

  return {
    titleText: "CITIZEN WIN",
    backgroundSrc: "/assets/images/resultpage/citizenwin.png",
    overlay: "bg-black/35",
    panelBorder: "border-primary/60",
    primaryBtn: "bg-primary text-black hover:brightness-105 active:brightness-95",
  };
}

/** 더미 데이터 */
const defaultPlayers = [
  { id: 1, name: "조채연", roleLabel: "경찰", avatarSrc: "/assets/images/resultpage/police.png" },
  { id: 2, name: "최지희", roleLabel: "시민", avatarSrc: "/assets/images/resultpage/citizen.png" },
  { id: 3, name: "변지영", roleLabel: "마피아", avatarSrc: "/assets/images/resultpage/mafia.png" },
  { id: 4, name: "길태환", roleLabel: "의사", avatarSrc: "/assets/images/resultpage/doctor.png" },
  { id: 5, name: "박연준", roleLabel: "시민", avatarSrc: "/assets/images/resultpage/citizen.png" },
  { id: 6, name: "최홍권", roleLabel: "마피아", avatarSrc: "/assets/images/resultpage/mafia.png" },
];
