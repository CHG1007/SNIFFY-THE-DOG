import { useNavigate } from 'react-router-dom';

/**
 * 방 입장 로직을 처리하는 커스텀 훅
 * 방 생성 후 자동 입장, 초대 코드 입장 등에서 재사용
 */
export const useRoomEntry = () => {
    const navigate = useNavigate();

    /**
     * 대기방으로 이동
     * @param {string} roomId - 방 ID
     * @param {boolean} isHost - 호스트 여부
     * @param {object} additionalState - 추가 state 정보
     */
    const enterRoom = (roomId, isHost = false, additionalState = {}) => {
        navigate(`/waiting-room/${roomId}`, {
            state: {
                isHost,
                ...additionalState
            }
        });
    };

    return { enterRoom };
};
