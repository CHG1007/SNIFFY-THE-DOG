import { create } from 'zustand';


const REPORT_DATA = {
  MAFIA: {
    win: { jobTitle: "밤의 제왕", stats: [], message: "축하합니다! 방해되는 자들을 모두 제거하고 이 도시의 진정한 주인이 되었습니다. 이제 당신은 어둠 속에서 영원한 권력을 누리며, 평생 누구의 간섭도 받지 않는 왕으로 군림하게 될 것입니다." },
    lose: { jobTitle: "이슬로 사라진 밤의 그림자", stats: [], message: "당신의 완벽한 알리바이는 시민들의 날카로운 투표 앞에 무너졌습니다. 총구는 거두고 이제 차가운 감옥 바닥에서 지난날을 참회할 시간입니다. 다음 생에는 꼬리가 밟히지 않도록 좀 더 민첩하게 움직이는 마피아가 되시길 바랍니다." }
  },
  POLICE: {
    win: { jobTitle: "전설의 수사반장", stats: [], message: "모든 범죄를 소탕했습니다! 당신은 이제 정의의 상징으로 역사에 기록될 것이며, 평생 연금을 받으며 평화로운 노후를 보낼 것입니다." },
    lose: { jobTitle: "헛다리 짚은 전직 형사", stats: [], message: "범인은 절벽 끝에 있었는데, 당신은 엉뚱한 시민의 뒷덜미만 잡고 있었군요. 명예는 실추되었고 수사반장의 꿈은 마피아의 총탄과 함께 날아갔습니다. 다음 생에는 촉보다는 팩트를 믿는 민첩한 수사관이 되시길 바랍니다." }
  },
  DOCTOR: {
    win: { jobTitle: "신의 손을 가진 명의", stats: [], message: "당신이 살려낸 생명들이 마을을 평화롭게 만들었습니다. 이제 메스를 내려놓고 당신의 건강을 돌보며 행복하게 사세요." },
    lose: { jobTitle: "처방전 잘못 쓴 돌팔이", stats: [], message: "본인을 살릴 약은 정작 처방하지 못했군요. 살려달라는 시민의 비명보다 마피아의 웃음소리를 먼저 듣게 된 당신의 운명이 처량합니다. 다음 생에는 메스보다 자기 몸을 먼저 지키는 민첩한 의사가 되시길 바랍니다." }
  },
  CITIZEN: [
    {
      jobTitle: "급식 마스터 영양사",
      stats: [
        { label: "갱생시킨 편식쟁이 학생", value: "2,500명", desc: "(피망까지 다 먹게 만듦)" },
        { label: "전쟁터 같은 배식 시간 평정", value: "9,999회", desc: "(국자 한 번 휘두르면 전원 정숙)" },
        { label: "급식실 위생 점수", value: "100만 점", desc: "(바이러스가 미끄러져서 못 들어옴)" },
      ],
      win: { message: "드디어 뒤집개를 내려놓을 시간입니다. 누구의 입맛도 맞출 필요 없는 오직 당신만을 위한 만찬을 즐기며 평생을 행복하게 살 것입니다." },
      lose: { message: "식판 검사가 너무 엄격했던 탓일까요? 결국 마피아에게 소금 테러를 당하고 주방에서 쫓겨났습니다. 500년 전통 소스 비법도 전수하지 못한 채 앞치마를 벗게 되었군요. 다음 생에는 뒤집개보다 빠른 눈치를 가진 민첩한 영양사가 되시길 바랍니다." }
    },
    {
    jobTitle: "전설의 붕어빵 사장님",
    stats: [
      { label: "머리부터 먹냐 꼬리부터 먹냐 논란 종결", value: "3,000회", desc: "(그냥 한입에 넣게 만듦)" },
      { label: "반죽에 들어간 황금 비율 잉어 눈물", value: "5리터", desc: "(한 입 먹으면 용궁이 보임)" },
      { label: "줄 세운 손님으로 만든 지구 띠", value: "0.5바퀴", desc: "(슈크림파와 팥파의 대화합)" },
    ],
    win:{ message: "이제 뜨거운 불판 앞을 떠나셔도 좋습니다. 평생 '붕세권'을 찾아 헤매지 않아도 되는, 당신 자체가 붕어빵 그 자체인 달콤하고 따끈한 여생이 보장되었습니다!"},
    lose: { message: "슈크림인지 팥인지 고민하던 찰나에 마피아가 반죽통을 엎어버렸습니다. 황금 비율 잉어 눈물도 이제는 바닥에 흐르는 눈물이 되었군요. 다음 생에는 탄 냄새를 0.1초 만에 맡는 민첩한 사장님으로 태어나세요." }
  },
  {
    jobTitle: "알프스 요들송 양치기",
    stats: [
      { label: "양들과 따라 부른 요들송", value: "148곡", desc: "(양들이 떼창하느라 풀을 안 뜯음)" },
      { label: "지팡이로 쫓아낸 늑대 정신교육", value: "22마리", desc: "(늑대들이 채식주의자로 전향함)" },
      { label: "고음으로 터뜨린 우유병", value: "9,999개", desc: "(마을 전체가 강제로 치즈 축제)" },
    ],
    win: { message: "이제 산꼭대기에서 소리 지르지 않아도 됩니다. 평생 목캔디가 필요 없는 맑은 목소리와 함께, 구름 위에서 에델바이스를 뜯으며 평화로운 연금을 누리게 될 것입니다!" },
    lose: { message: "고음을 지르느라 마피아가 뒤에 온 줄도 몰랐군요. 당신이 키우던 양들은 이제 마피아의 양털 이불이 되었습니다. 다음 생에는 요들송 대신 마피아 감지 레이더를 돌리는 민첩한 양치기가 되길 바랍니다." }
  },
  {
    jobTitle: "프로 환승 이별가",
    stats: [
      { label: "이별 통보 후 눈물 멈추는 속도", value: "0.03초", desc: "(눈물샘에 와이퍼 설치 의혹)" },
      { label: "전 애인들이 보낸 자니? 문자", value: "1,500건", desc: "(모두 읽지 않음으로 응징)" },
      { label: "다음 정거장 환승 최적 경로 계산", value: "AI급", desc: "(연애의 끊김이 없는 무한 동력)" },
    ],
    win: { message: "축하합니다! 이제 더 이상 환승할 정거장도, 눈치 볼 상대도 없습니다. 당신은 이제 사랑의 종착역을 넘어, 오직 당신 자신만을 사랑하는 완벽하고 풍요로운 삶에 정착했습니다." },
    lose : { message: "새 연인을 찾기도 전에 마피아에게 마음(과 목숨)을 환승당했습니다. 마지막 전 애인에게 보낸 '자니?' 문자가 당신의 유언이 될 줄이야... 다음 생에는 이별 통보보다 빠른 도망을 실천하는 민첩한 사랑꾼이 되세요." }
  },
  {
    jobTitle: "전설의 층간소음 해결사",
    stats: [
      { label: "슬리퍼 발소리 데시벨 측정", value: "0.1dB", desc: "(개미 걷는 소리까지 잡아냄)" },
      { label: "천장에 붙인 우퍼 스피커로 조련한 이웃", value: "12가구", desc: "(이웃들이 까치발로 탭댄스 추게 만듦)" },
      { label: "평화를 되찾은 아파트 단지", value: "48개동", desc: "(당신만 나타나면 도서관이 됨)" },
    ],
    win: { message: "이제 귀마개는 쓰레기통에 버리세요. 당신의 은퇴지는 낙엽 떨어지는 소리조차 감미로운 무소음 천국입니다. 평생 숙면을 취하며 고요한 행복을 만끽할 일만 남았습니다!" },
    lose : { message: "위층 마피아의 발소리를 분석하느라 정작 뒤에 온 마피아의 숨소리를 못 들었네요. 층간소음 없는 고요한 하늘나라로 강제 이사하게 되었습니다. 다음 생에는 우퍼 스피커보다 빠른 순발력을 가진 민첩한 이웃이 되시길." }
  },
  {
    jobTitle: "코인 차트 연금술사",
    stats: [
      { label: "내가 사면 떨어지는 저항선", value: "99.9%", desc: "(인간 지표로서 인류에 기여)" },
      { label: "기도만으로 세운 양봉 그래프", value: "7개", desc: "(우주의 기운을 끌어모음)" },
      { label: "라면만 먹고 버틴 존버의 시간", value: "4,000일", desc: "(위장이 이미 밀가루로 코팅됨)" },
    ],
    win: { message: "축하합니다! 드디어 '떡상'에 성공하여 매도 버튼을 눌렀습니다! 이제 파란색 차트 공포증에서 벗어나, 평생 빨간색 카펫만 밟으며 사는 진정한 부의 안식을 누리게 됩니다." },
    lose: { message: "풀매수 직후 마피아가 랜선을 뽑아버렸습니다. 당신의 인생 그래프가 차트보다 먼저 바닥을 쳐버렸군요. 한강 물 온도를 체크하기엔 이미 늦었습니다. 다음 생에는 하락장보다 먼저 튀는 민첩한 개미가 되세요." }
  },
  {
    jobTitle: "지옥에서 온 헬스 트레이너",
    stats: [
      { label: "회원이 흘린 눈물로 만든 수영장", value: "2레인", desc: "('마지막 한 개'만 50번 외침)" },
      { label: "근육으로 튕겨낸 마피아의 총알", value: "12발", desc: "(가슴 근육이 이미 방탄복)" },
      { label: "닭가슴살 살해 개수", value: "5만 마리", desc: "(닭들 사이에서 저승사자로 불림)" },
    ],
    win: { message: "이제 숫자를 세는 고통에서 해방되었습니다! 더 이상 단백질 쉐이크를 마시지 않아도 근육이 빠지지 않는 '신의 체질'을 하사받았으며, 평생 삼겹살만 먹어도 복근이 유지되는 기적의 삶을 살게 됩니다." },
    lose: { message: "마지막 한 개를 더 외치기도 전에 마피아에게 덤벨로 역습을 당했습니다. 가슴 근육이 방탄복이라더니 등 근육은 무방비였군요. 다음 생에는 '하나 더' 대신 '살려줘'를 먼저 외치는 민첩한 근육맨이 되세요." }
  },
  {
    jobTitle: "비둘기 언어 번역가",
    stats: [
      { label: "구구구 소리로 알아낸 맛집 정보", value: "800곳", desc: "(전국 옥상 맛집 지도 보유)" },
      { label: "비둘기 떼 습격에서 시민 구출", value: "450회", desc: "(새우깡 한 봉지로 군대 통솔)" },
      { label: "길거리 배설물 회피 성공률", value: "100%", desc: "(하늘을 안 봐도 궤적을 읽음)" },
    ],
    win: { message: "이제 길거리에서 고개를 숙이지 않아도 됩니다. 평생 새똥을 맞지 않는 운명을 얻었으며, 모든 조류의 존경을 받는 '버드 마스터'로서 공원 벤치에서 평화로운 여생을 보내게 될 것입니다." },
    lose: { message: "비둘기들과 작전 회의를 하던 중 새우깡 냄새를 맡고 온 마피아에게 들키고 말았습니다. 비둘기들이 당신을 버리고 날아가는 뒷모습이 마지막 기억이네요. 다음 생에는 구구구 소리보다 빠른 발을 가진 민첩한 조류 학자가 되길." }
  },
  {
    jobTitle: "전설의 수강신청 대리인",
    stats: [
      { label: "광클로 쟁취한 인기 전공", value: "1,200개", desc: "(0.001초의 승부사)" },
      { label: "서버를 마비시킨 마우스 클릭 속도", value: "광속", desc: "(F5 키보드 82개 파괴)" },
      { label: "성공시킨 우주 공강 시간표", value: "500명분", desc: "(월화수금 자체 휴강의 신)" },
    ],
    win: { message: "더 이상 시계의 초침을 보며 떨지 마세요. 당신의 남은 인생은 그 어떤 경쟁도 없는 '올 패스' 상태입니다. 평생 줄 서지 않고 맛집과 공연장에 입장하는 하이패스 인생이 예약되었습니다!" },
    lose: { message: "마피아 검거 버튼을 클릭하려 했으나, 서버 시간 0.01초 차이로 마피아의 공격이 먼저 성공했습니다. 당신의 인생 시간표는 이제 '자체 휴강' 확정입니다. 다음 생에는 광클보다 더 빠른 민첩한 판단력을 갖추시길 바랍니다." }
  },
  {
    jobTitle: "퇴사만 99번째인 프로 프로이직러",
    stats: [
      { label: "책상 정리 짐 싸는 속도", value: "1분 30초", desc: "(거의 매직 유랑단 수준)" },
      { label: "단톡방 '나가기' 버튼 누른 횟수", value: "99회", desc: "(손가락에 미련이 없음)" },
      { label: "사표 던지고 나온 회장실 문짝", value: "12개", desc: "(박력 있게 걷어차서 수리비 청구됨)" },
    ],
    win: { message: "축하합니다! 드디어 100번째 직장은 '백수'라는 이름의 천직입니다. 이제 상사의 잔소리 대신 파도 소리를 들으며, 평생 월요일이 없는 영원한 일요일의 삶을 살게 됩니다." },
    lose: { message: "100번째 퇴사 서류를 내기도 전에 인생에서 먼저 퇴사당했습니다. 인수인계할 짐도 없는데 마피아가 너무 성급했군요. 다음 생에는 사표 던지는 속도보다 도망가는 속도가 더 민첩한 프로 탈출러가 되세요." }
  },
  {
    jobTitle: "전설의 탕수육 찍먹파 수장",
    stats: [
      { label: "부먹파를 개종시킨 소스 논리", value: "2,000명", desc: "(바삭함은 인권이라는 신념)" },
      { label: "소스 농도로 맞춘 오늘의 운세", value: "적중률 98%", desc: "(점성이 높으면 대박)" },
      { label: "튀김 옷 두께로 판별한 마피아", value: "15명", desc: "(튀김이 눅눅하면 바로 검거)" },
    ],
    win: { message: "이제 소스 전쟁을 멈추셔도 됩니다. 당신의 인생은 찍지 않아도, 부어버려도 맛있는 완벽한 황금 밸런스의 상태가 되었습니다. 평생 바삭하고 고소한 행복만 씹으며 사시길 바랍니다!" },
    lose: { message: "소스가 튀김에 닿기도 전에 마피아가 판을 엎었습니다. 눅눅해진 것은 튀김만이 아니라 당신의 운명이었군요. 다음 생에는 소스를 찍기 전에 마피아의 급소부터 찍는 민첩한 미식가가 되시길 바랍니다." }
  }
  ]
};

const useResultStore = create(() => ({
  // 1. 결과 데이터 가져오기 (승패 및 역할에 따른 리포트 생성)
  getFutureReport: (myRole, isWin) => {
    let report;
    
    if (myRole === 'MAFIA') {
      return isWin ? REPORT_DATA.MAFIA.win : REPORT_DATA.MAFIA.lose;
    } else if (myRole === 'POLICE') {
      return isWin ? REPORT_DATA.POLICE.win : REPORT_DATA.POLICE.lose;
    } else if (myRole === 'DOCTOR') {
      return isWin ? REPORT_DATA.DOCTOR.win : REPORT_DATA.DOCTOR.lose;
    } else {
      const citizenJobs = REPORT_DATA.CITIZEN;
      const randomJob = citizenJobs[Math.floor(Math.random() * citizenJobs.length)];
      report = {
        jobTitle: randomJob.jobTitle,
        stats: randomJob.stats,
        message: isWin ? randomJob.win.message : randomJob.lose.message
      };
    }
    
    if (isWin && report) {
      report.message = `${report.message}\n\n🏆 전리품 획득: [전설의 황금 개껌]`;
    }

    return report;

  },

 // 2. 역할별 이미지 경로 반환 (다시 추가!)
  getRoleImage: (role) => {
    switch (role) {
      case 'MAFIA': return "/assets/images/resultpage/mafia.png";
      case 'POLICE': return "/assets/images/resultpage/police.png";
      case 'DOCTOR': return "/assets/images/resultpage/doctor.png";
      default: return "/assets/images/resultpage/citizen.png";
    }
  },

  // 3. 역할별 라벨 정보
  ROLE_LABELS: {
    MAFIA: { name: '마피아', color: 'text-red-400', bg: 'bg-red-900/40', border: 'border-red-500/60' },
    POLICE: { name: '경찰', color: 'text-blue-400', bg: 'bg-blue-900/40', border: 'border-blue-500/60' },
    DOCTOR: { name: '의사', color: 'text-yellow-400', bg: 'bg-yellow-900/40', border: 'border-yellow-500/60' },
    CITIZEN: { name: '시민', color: 'text-green-400', bg: 'bg-green-900/40', border: 'border-green-500/60' },
  },
}));

export default useResultStore;