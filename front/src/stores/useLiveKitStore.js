import { create } from 'zustand';

/**
 * LiveKit 전역 상태 관리 스토어
 * 페이지 이동 시에도 연결을 유지하기 위해 사용
 */
const useLiveKitStore = create((set) => ({
    room: null,
    tracks: {}, // { [identity: string]: VideoTrack }
    localTrack: null,
    roomId: null,
    localTracks: [], // cleanup용

    setRoom: (room) => set({ room }),
    setTracks: (tracks) => set({ tracks }),
    updateTrack: (identity, track) => set((state) => ({
        tracks: { ...state.tracks, [identity]: track }
    })),
    removeTrack: (identity) => set((state) => {
        const next = { ...state.tracks };
        delete next[identity];
        return { tracks: next };
    }),
    setLocalTrack: (localTrack) => set({ localTrack }),
    setLocalTracks: (localTracks) => set({ localTracks }),
    setRoomId: (roomId) => set({ roomId }),

    reset: () => {
        set((state) => {
            if (state.room) {
                state.room.disconnect();
            }
            state.localTracks.forEach(t => t.stop());
            return {
                room: null,
                tracks: {},
                localTrack: null,
                roomId: null,
                localTracks: [],
            };
        });
    }
}));

export default useLiveKitStore;
