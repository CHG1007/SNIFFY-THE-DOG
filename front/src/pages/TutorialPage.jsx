import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Trophy, ArrowLeft } from 'lucide-react';

// 1. 이미지 경로 설정 (Public 폴더 사용)
const bgMain = '/assets/images/tutorial/bg_main.png';
const roleIntro = '/assets/images/tutorial/role_intro.png';
const roleMafia = '/assets/images/tutorial/role_mafia.png';
const rolePolice = '/assets/images/tutorial/role_police.png';
const roleDoctor = '/assets/images/tutorial/role_doctor.png';
const roleCitizen = '/assets/images/tutorial/role_citizen.png';

const TutorialPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // 2. 튜토리얼 데이터 (저택 스토리 & 테마 & 인디케이터 색상)
  const tutorialSteps = [
    {
      id: 'intro',
      role: '비밀의 저택',
      image: roleIntro,
      theme: {
        color: 'text-orange-500',
        borderColor: 'border-orange-500',
        shadowColor: 'shadow-orange-500/30',
        bgTint: 'bg-orange-500/10',
        iconColor: 'text-orange-500',
        indicatorColor: 'bg-orange-500'
      },
      story: "과거 광산 관리인의 저택. 폐쇄된 광산과 이어진 비밀 통로를 품은 채 조용히 남아있던 이곳에, 최근 '개껌(황금)'의 흔적이 발견되었습니다. 광산의 기록을 찾기 위해 모인 사람들. 하지만 저택은 이미 마피아가 잠식하고 있었습니다.",
      winCondition: "[게임 목표] 저택에 숨어든 마피아를 찾아내 처형하거나, 밤새 살아남아 광산의 비밀을 지켜내세요.",
    },
    {
      id: 'mafia',
      role: '마피아 (광산의 주인)',
      image: roleMafia,
      theme: {
        color: 'text-red-500',
        borderColor: 'border-red-500',
        shadowColor: 'shadow-red-500/30',
        bgTint: 'bg-red-500/10',
        iconColor: 'text-red-500',
        indicatorColor: 'bg-red-600'
      },
      story: "당신은 저택 지하의 비밀 통로를 알고 있는 유일한 존재입니다. 낮에는 평범한 척 정보를 수집하고, 밤이 되면 통로를 통해 광산으로 내려가 금을 캐며 세력을 확장합니다. 이 비밀을 파헤치려는 자들을 조용히 제거하십시오.",
      winCondition: "[비밀 사수] 통로의 존재를 들키지 않고 시민들을 제거하여, 마피아의 수가 시민보다 많아지게 만드세요.",
    },
    {
      id: 'police',
      role: '경찰 (추적자)',
      image: rolePolice,
      theme: {
        color: 'text-blue-500',
        borderColor: 'border-blue-500',
        shadowColor: 'shadow-blue-500/30',
        bgTint: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        indicatorColor: 'bg-blue-500'
      },
      story: "당신은 저택 어딘가 남겨진 광산의 기록과 자금 흐름을 추적하기 위해 파견되었습니다. 밤마다 저택을 수색하여 수상한 흙냄새를 풍기는 자를 찾아내십시오. 당신의 코가 닿는 곳에 통로의 단서가 있을 것입니다.",
      winCondition: "[범인 색출] 밤마다 의심 가는 인물을 조사하여 마피아 여부를 알아내고, 시민들을 설득해 그들을 저택에서 추방하세요.",
    },
    {
      id: 'doctor',
      role: '의사 (수호자)',
      image: roleDoctor,
      theme: {
        color: 'text-green-500',
        borderColor: 'border-green-500',
        shadowColor: 'shadow-green-500/30',
        bgTint: 'bg-green-500/10',
        iconColor: 'text-green-500',
        indicatorColor: 'bg-green-500'
      },
      story: "밤마다 저택 지하에서 들려오는 기계 소음과 비명소리. 당신은 본능적으로 누군가 위험에 처했음을 감지합니다. 비록 통로를 찾을 순 없지만, 어둠 속에서 습격받은 동료를 치료하여 아침을 맞이하게 할 수는 있습니다.",
      winCondition: "[동료 보호] 마피아의 표적이 될 것 같은 시민을 선택해 치료하세요. 단, 자신을 치료할 수 있는 기회는 한정적일 수 있습니다.",
    },
    {
      id: 'citizen',
      role: '시민 (목격자)',
      image: roleCitizen,
      theme: {
        color: 'text-amber-400',
        borderColor: 'border-amber-400',
        shadowColor: 'shadow-amber-400/30',
        bgTint: 'bg-amber-400/10',
        iconColor: 'text-amber-400',
        indicatorColor: 'bg-amber-400'
      },
      story: "외출 기록도 없이 밤새 사라지는 사람들, 설명되지 않는 누군가의 막대한 자금력. 당신은 확신합니다. '이 저택 어딘가에 광산으로 이어지는 통로가 있다.' 토론을 통해 가면 뒤에 숨은 광산의 주인을 찾아내야 합니다.",
      winCondition: "[통로 봉쇄] 낮 시간의 토론을 통해 마피아를 찾아내 투표로 저택에서 쫓아내십시오. 모든 마피아를 제거하면 광산은 폐쇄됩니다.",
    },
  ];

  // 3. 무한 롤링 네비게이션
  const handleNext = () => {
    if (!isAnimating) {
      triggerTransition(() => setCurrentStep((prev) => (prev + 1) % tutorialSteps.length));
    }
  };

  const handlePrev = () => {
    if (!isAnimating) {
      triggerTransition(() => setCurrentStep((prev) => (prev === 0 ? tutorialSteps.length - 1 : prev - 1)));
    }
  };

  const triggerTransition = (callback) => {
    setIsAnimating(true);
    setTimeout(() => {
      callback();
      setIsAnimating(false);
    }, 500); 
  };

  const handleExit = () => {
    navigate('/');
  };

  const handleImageError = (e) => {
    e.target.src = 'https://placehold.co/400x400/333/ff8a00?text=No+Image';
    e.target.style.opacity = '0.5';
  };

  const highlightKeywords = (text, colorClass) => {
    const parts = text.split(/(\[.*?\])/g);
    return parts.map((part, index) => 
      part.match(/^\[.*\]$/) ? (
        <span key={index} className={`${colorClass} font-bold mr-1`}>{part}</span>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  const step = tutorialSteps[currentStep];
  const theme = step.theme;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&family=Noto+Sans+KR:wght@300;400;700;900&display=swap');
        .font-batang { font-family: 'Gowun Batang', serif; }
        .font-noto { font-family: 'Noto Sans KR', sans-serif; }
      `}</style>

      <div className="relative w-full h-screen overflow-hidden bg-[#121212] flex items-center justify-center p-4 font-noto">
        
        {/* Background Layer */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div 
            className="absolute inset-0 w-full h-full bg-cover bg-center animate-fog-flow"
            style={{ backgroundImage: `url(${bgMain})` }}
          />
          <div className="absolute inset-0 bg-black/80 animate-pulse-slow pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black opacity-90 pointer-events-none" />
        </div>

        {/* Back Button */}
        <button 
          onClick={handleExit}
          className="absolute top-6 left-6 z-50 flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-300 group"
        >
          <div className="p-2 rounded-full border border-gray-600 group-hover:border-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </div>
          <span className="text-sm tracking-widest uppercase font-bold hidden md:block">Back to Main</span>
        </button>

        {/* 4. Layout Fix: max-w-6xl (adjusted from 7xl) and px-16 for arrow spacing */}
        <div className={`relative z-10 w-full max-w-6xl px-16 aspect-auto md:aspect-[16/9] bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-700`}>
          
          {/* Content Wrapper */}
          <div 
            className={`flex flex-col md:flex-row w-full h-full transition-opacity duration-500 ease-in-out ${
              isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
            }`}
          >
            
            {/* Left Content */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center items-center text-center relative">
              
              <div className="relative h-64 mb-6 flex items-center justify-center">
                <img 
                  src={step.image} 
                  alt={step.role}
                  onError={handleImageError} 
                  className="h-full w-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                />
              </div>

              <h1 className={`text-4xl md:text-5xl font-black ${theme.color} mb-6 tracking-tight drop-shadow-lg uppercase`}>
                {step.role.split('(')[0]}
              </h1>
              
              <div className="w-full max-w-md bg-gradient-to-b from-transparent via-black/20 to-transparent p-4 rounded-lg">
                <p className="font-batang text-gray-200 text-lg leading-loose break-keep">
                  {step.story}
                </p>
              </div>
            </div>

            {/* Right Content */}
            <div className={`
              w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center 
              bg-black/60 border-t md:border-t-0 md:border-l border-white/5
            `}>
              
              <div className={`
                flex-1 flex flex-col justify-center p-8 rounded-2xl border
                ${theme.borderColor} ${theme.bgTint} ${theme.shadowColor} shadow-[0_0_20px_-5px]
                transition-all duration-500
              `}>
                <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
                  <Trophy className={`w-8 h-8 ${theme.iconColor}`} />
                  <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
                    승리 조건
                  </h2>
                </div>

                <p className="text-gray-100 font-noto text-xl leading-relaxed">
                  {highlightKeywords(step.winCondition, theme.color)}
                </p>
              </div>

              {/* 5. Dynamic Indicator Colors */}
              <div className="mt-8 flex items-center justify-between">
                <div className="flex gap-2">
                  {tutorialSteps.map((s, idx) => (
                    <div 
                      key={idx} 
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        idx === currentStep 
                          ? `w-10 ${s.theme.indicatorColor} shadow-[0_0_10px]` 
                          : 'w-2 bg-gray-700'
                      }`} 
                    />
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Navigation Buttons (Always visible inside padding area) */}
          <div className="absolute inset-y-0 left-4 flex items-center z-20">
            <button 
              onClick={handlePrev}
              className={`p-3 rounded-full border border-white/20 text-white bg-black/50 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-110`}
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>

          <div className="absolute inset-y-0 right-4 flex items-center z-20">
            <button 
              onClick={handleNext}
              className={`p-3 rounded-full border border-white/20 text-white bg-black/50 backdrop-blur-md hover:bg-white/10 transition-all duration-300 hover:scale-110`}
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

        </div>

      </div>
    </>
  );
};

export default TutorialPage;