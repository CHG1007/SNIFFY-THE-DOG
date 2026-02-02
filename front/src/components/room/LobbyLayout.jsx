export default function LobbyLayout({
  backgroundUrl,
  onVideoTest,
  topMenus,
  leftPanel,
  mainPanel,
  footer,
  children,
}) {
  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${backgroundUrl})` }} />
      <div className="absolute inset-0 bg-black/35" />

      {/* 컨텐츠 */}
      <div className="relative flex-1 flex flex-col px-8 pt-4 min-h-0">
        {/* 화상 테스트 버튼 */}
        <button onClick={onVideoTest} className="absolute top-2 right-8 px-4 py-2 ... z-50">화상 테스트</button>

        {/* 상단 메뉴 */}
        <div className="h-[15%] min-h-[100px] flex gap-8 items-center">
          {/* 왼쪽 패널 너비(320px)만큼 빈 공간을 주어 TopMenu를 오른쪽(메인 위)으로 밀어줍니다 */}
          <div className="w-[320px] shrink-0" /> 
          <div className="flex-1 flex justify-center gap-20">
            {topMenus}
          </div>
        </div>

        {/* 메인 영역 */}
        <div className="flex-1 min-h-0 flex gap-8 mb-10 items-center justify-center">
          <div className="shrink-0">{leftPanel}</div>
          <div className="flex-1 max-w-[1050px] min-h-0">{mainPanel}</div>
        </div>

        {/* 하단 */}
        <div className="h-10 flex items-center justify-center shrink-0">
          {footer}
        </div>

        {/* 모달 등 오버레이 */}
        {children}
      </div>
    </div>
  );
}
