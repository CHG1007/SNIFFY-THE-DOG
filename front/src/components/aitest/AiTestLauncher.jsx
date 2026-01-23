import { useState } from "react";
import AiTestModal from "./AiTestModal";

export default function AudioTestLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 어디서든 항상 뜨는 테스트 버튼 */}
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          color: "white",
        }}
      >
        ⭐ 궁금하면 눌러바방 ㅎ ⭐
      </button>

      {/* 팝업 */}
      {open && (
        <AiTestModal onClose={() => setOpen(false)} />
      )}
    </>
  );
}
