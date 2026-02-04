import GameHistoryRow from './GameHistoryRow';

const GameHistoryTable = ({ games }) => {
  return (
    <div className="flex-grow overflow-y-auto pr-2 flex flex-col gap-4">
      {games.map((game, index) => (
        <GameHistoryRow key={index} {...game} />
      ))}
    </div>
  );
};

export default GameHistoryTable;