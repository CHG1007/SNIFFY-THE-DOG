import WaitingSlot from "./WaitingSlot";

const WaitingGrid = ({ players, myId }) => {
    const playerCount = players.length;
    /**
   * 인원수에 따른 너비(width) 결정 로직
   * - 1~4명: 한 줄에 2명씩 (50% 보다 약간 작게)
   * - 5~6명: 한 줄에 3명씩 (33.3% 보다 약간 작게)
   * - 7~8명: 한 줄에 4명씩 (25% 보다 약간 작게)
   */
    const getFlexBasis = () => {
        if (playerCount <= 4) return "basis-[calc(50%-1.5rem)]";
        if (playerCount <= 6) return "basis-[calc(33.33%-1.5rem)]";
        return "basis-[calc(25%-1.5rem)]";
    };
  return (
    
    /* grid-cols-3: 가로로 3개씩 놓겠다
      gap-x-6: 가로 간격
      gap-y-10: 세로 간격 
    */
    <div className="flex flex-wrap justify-center gap-6 w-full max-w-7xl p-4 transition-all duration-500">
      {players.map((player) => (
        <div 
          key={player.id} 
          className={`flex-grow-0 flex-shrink-0 ${getFlexBasis()} min-w-[200px] transition-all duration-500`}
        >
          <WaitingSlot 
            player={player} 
            isMe={player.id === myId} 
          />
        </div>
      ))}
    </div>
  );
};

export default WaitingGrid;