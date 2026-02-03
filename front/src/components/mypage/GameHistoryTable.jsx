import GameHistoryRow from './GameHistoryRow';

const GameHistoryTable = ({ games, onReport }) => {
  return (
    <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar flex flex-col gap-4">
      {games.map((game, index) => (
        <GameHistoryRow key={index} {...game} />
      ))}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }
      `}</style>
    </div>
  );
};

export default GameHistoryTable;