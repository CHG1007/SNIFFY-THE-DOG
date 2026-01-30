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
    <div className="relative flex-1 overflow-hidden">
      {/* 배경 */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${backgroundUrl})` }}
      />
      {/* 어두운 오버레이 */}
      <div className="absolute inset-0 bg-black/35" />

      {/* 컨텐츠 */}
      <div className="relative h-full px-8 py-0">
        {/* 화상 테스트 버튼 */}
        <button
          onClick={onVideoTest}
          className="absolute top-6 right-8 px-4 py-2 rounded-xl bg-white/10 text-white/80 text-sm
                     hover:bg-white/20 hover:text-white transition"
          type="button"
        >
          화상 테스트
        </button>

        {/* 상단 메뉴 */}
        <div className="mt-0 flex items-center justify-center gap-28">
          {topMenus}
        </div>

        {/* 메인 영역 */}
        <div className="mt-0 flex gap-10 h-[68%]">
          {leftPanel}
          {mainPanel}
        </div>

        {/* 하단 */}
        <div className="absolute left-0 right-0 bottom-8 flex items-center justify-center">
          {footer}
        </div>

        {/* 모달 등 오버레이 */}
        {children}
      </div>
    </div>
  );
}
