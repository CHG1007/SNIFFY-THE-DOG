// import { useState } from 'react';
// import GameHistoryTable from './GameHistoryTable'; 
// import LastBeggingModal from '../modals/LastBeggingModal';

// const UserHistorySection = () => {
//   const [isQuitModalOpen, setIsQuitModalOpen] = useState(false);

//   const handleQuitConfirm = () => {
//     console.log("회원 탈퇴 처리 로직 실행");
//     setIsQuitModalOpen(false);
//   };

//   return (
//     <div className="flex flex-col w-full text-left">
//       {/* 전적 테이블 영역 */}
//       <div className="flex flex-col items-start w-full">
//         <h3 className="text-[#ff8a00] text-2xl font-black mb-3">전적</h3>
//         <GameHistoryTable /> {/* 여기서 기존 부품을 호출! */}
//       </div>

//       <div className="mt-5 w-full text-right">
//         <button onClick={() => setIsQuitModalOpen(true)} className="text-orange-100/40 text-sm cursor-pointer hover:text-orange-100 transition-all">
//           회원탈퇴
//         </button>
//       </div>
      
//       {/* 회원 탈퇴 확인 모달 */}
//       {isQuitModalOpen && (
//         <LastBeggingModal 
//           isOpen={isQuitModalOpen}
//           onClose={() => setIsQuitModalOpen(false)}
//           onConfirm={handleQuitConfirm}
//           message={`채연입니다님\n탈퇴하시겠습니까?`}
//         />
//       )}

//     </div>
//   );
// };

// export default UserHistorySection;
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

      <div className="mt-10 w-full text-right opacity-30 hover:opacity-100 transition-opacity px-4">
        <button className="text-white text-sm underline underline-offset-4 cursor-pointer">
          회원탈퇴
        </button>
      </div>
    </div>
  );
};

export default UserHistorySection;