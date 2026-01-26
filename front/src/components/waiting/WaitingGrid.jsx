import WaitingSlot from "./WaitingSlot";

const WaitingGrid = ({ players, myId, isHost, onKick, capacity = 6 }) => {
    
      /**
   * 인원수에 따른 너비(width) 결정 로직
   * - 1~4명: 한 줄에 2명씩 (50% 보다 약간 작게)
   * - 5~6명: 한 줄에 3명씩 (33.3% 보다 약간 작게)
   * - 7~8명: 한 줄에 4명씩 (25% 보다 약간 작게)
   */
  // 1~4명일 때와 5~8명일 때의 레이아웃을 유연하게 잡기 위한 로직입니다.
  const getFlexBasis = () => {
      if (capacity <= 4) return "basis-[calc(50%-1.5rem)]";
      if (capacity <= 6) return "basis-[calc(33.33%-1.5rem)]";
      return "basis-[calc(25%-1.5rem)]";
  };

  // 설정된 capacity(6~8)만큼 빈 배열을 만들어 화면에 뿌립니다.
  const allSlots = Array.from({ length: capacity });


  return (
    
    /* grid-cols-3: 가로로 3개씩 놓겠다
      gap-x-6: 가로 간격
      gap-y-10: 세로 간격 
    */
    <div className="flex flex-wrap justify-center gap-6 w-full max-w-7xl p-4 transition-all duration-500">
      {allSlots.map((_, index) => {
        // 현재 순서(index)에 해당하는 플레이어가 있는지 확인합니다.
        const player = players[index];

        return (
          <div 
            key={player ? player.id : `empty-${index}`} 
            className={`flex-grow-0 flex-shrink-0 ${getFlexBasis()} min-w-[200px] transition-all duration-500`}
          >
            {player ? (
              // 1. 해당 자리에 유저가 있다면 슬롯 노출
              <WaitingSlot 
                player={player} 
                isMe={player.id === myId} 
                isHost={isHost} 
                onKickRequest={onKick} 
              />
            ) : (
              // 2. 유저가 없다면 빈 슬롯(WAITING) 노출
              <div className="flex flex-col gap-2 w-full max-w-[300px] animate-pulse">
                <div className="aspect-video bg-[#1a1a1a]/40 rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center group">
    <span className="text-white/5 text-xs font-bold group-hover:text-[#ff8a00]/20 transition-colors">EMPTY SLOT</span>
                </div>
                <div className="w-full h-[52px] rounded-xl bg-[#1a1a1a]/20 border border-white/5" />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WaitingGrid;