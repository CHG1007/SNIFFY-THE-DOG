import { useState } from 'react';
import ModalWrapper from './ModalWrapper';
import TextInput from '../common/TextInput';
import ConfirmBtn from '../common/ConfirmBtn';

const EditNicknameModal = ({ isOpen, onClose }) => {
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");

  const handleEdit = () => {
    if (nickname.trim() === "") {
      setError("닉네임을 입력해주세요.");
    } else {
      setError("");
      console.log("닉네임 변경 시도:", nickname);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center w-full h-full pt-4">
        <h2 className="text-3xl font-black text-white pt-15 mb-4 tracking-widest text-center">
          닉네임 수정
        </h2>

        <div className="w-full">
          <TextInput
            value={nickname}
            onChange={(e) => {
              const val = e.target.value;
              if (val.length <= 5) {
                setNickname(val);
                if (val.trim() !== "") setError("");
              }
            }}
            maxLength={5}
            placeholder="새 닉네임 (최대 5자)"
            errorMsg={error}
          />
        </div>

        {/* 💡 직접 만든 ConfirmBtn 부품을 조립합니다 */}
        <div className="flex w-full gap-4 mt-2">
          <ConfirmBtn
            text="수정"
            onClick={handleEdit}
            className="flex-1 text-xl" // flex-1로 너비를 반반씩!
          />
          <ConfirmBtn
            text="취소"
            variant="secondary"
            onClick={onClose}
            className="flex-1 text-xl"
          />
        </div>
      </div>
    </ModalWrapper>
  );
};

export default EditNicknameModal;