import { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import TextInput from '../common/TextInput';

const FindGameModal = ({ isOpen, onClose }) => {
    const [code, setCode] = useState("");
    const [error, setError] = useState("");

  const handleJoin = () => {
    if (code.trim() === "") {
      setError("입장 코드를 입력해주세요."); // 빈 값일 때 에러 메시지 세팅
    } else {
      setError(""); // 에러 해결
      console.log("입장 시도:", code);
      // 여기에 서버 통신 로직이 들어갈 예정
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center w-full h-full pt-4">
        <h2 className="text-3xl font-black text-white pt-15 mb-4 tracking-widest text-center">
          게임 찾기
        </h2>

        <div className="w-full">
          <TextInput 
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (e.target.value.trim() !== "") setError(""); // 타이핑 시작하면 에러 삭제
            }}
            placeholder="입장 코드를 입력해주세요"
            errorMsg={error} // 상태로 관리되는 error 전달
          />
        </div>

        <button 
          onClick={handleJoin} // 이제 이 함수에서 체크함
          className="w-full py-3 bg-[#ff8a00] hover:bg-[#ffaa44] text-white text-2xl font-black rounded-xl transition-all shadow-lg active:scale-95 mt-2"
        >
          입장 하기
        </button>
      </div>
    </ModalWrapper>
  );
};

export default FindGameModal;