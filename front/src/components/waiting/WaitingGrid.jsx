import WaitingSlot from "./WaitingSlot";

const WaitingGrid = ({ players, myId, isHost, onKick, capacity = 6 }) => {
    
  /**
   * 인원수에 따른 너비(width) 결정 로직
   * - 1~4명: 한 줄에 2명씩 (50% 보다 약간 작게)
   * - 5~6명: 한 줄에 3명씩 (33.3% 보다 약간 작게)
   * - 7~8명: 한 줄에 4명씩 (25% 보다 약간 작게)
   */
  const getFlexBasis = () => {
      if (capacity <= 4) return "basis-[calc(50%-1.5rem)]";
      if (capacity <= 6) return "basis-[calc(33.33%-1.5rem)]";
      return "basis-[calc(25%-1.5rem)]";
  };

  const allSlots = Array.from({ length: capacity });

  return (
    <div className="flex flex-wrap justify-center content-center gap-3 w-full max-w-full px-12 transition-all duration-500 h-full overflow-y-auto pb-40 scrollbar-hide">
      {allSlots.map((_, index) => {
        const player = players[index];

        return (
          <div 
            key={player ? player.userId : `empty-${index}`} 
            className={`flex-grow-0 flex-shrink-0 ${getFlexBasis()} min-w-[240px] transition-all duration-500`}
          >
            {player ? (
              <WaitingSlot 
                player={player} 
                isMe={String(player.userId) === String(myId)}
                isHost={isHost} 
                onKickRequest={onKick} 
              />
            ) : (
              // Empty Slot (Simplified - Rolled back to Prompt 15)
              <div className="w-full aspect-video bg-[#1a1a1a]/30 rounded-xl border-2 border-dashed border-white/5 flex items-center justify-center group">
                 <span className="text-white/10 text-sm font-bold group-hover:text-primary/30 transition-colors tracking-widest">
                   WAITING...
                 </span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default WaitingGrid;