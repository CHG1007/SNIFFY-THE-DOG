import GameHistoryTable from './GameHistoryTable';

const UserHistorySection = ({ games, onReport }) => {
  return (
    <div className="w-full flex flex-col items-start mt-0">
      {/* 타이틀 */}
      <h3 className="text-[#ff8a00] text-2xl font-black mb-6 italic tracking-tighter drop-shadow-md">
        전적
      </h3>
      
      {/* 3. 받은 데이터를 테이블 컴포넌트로 전달합니다. */}
      <div className="w-full">
        <GameHistoryTable games={games} onReport={onReport} />
      </div>

    </div>
  );
};

export default UserHistorySection;