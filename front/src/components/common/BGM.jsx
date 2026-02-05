import { useEffect, useRef, useState } from "react";

export default function BGM() {
  const audioRef = useRef(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    a.loop = true;
    a.volume = 0.25; // 0~1
    a.muted = true;
  }, []);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const sync = async () => {
      try {
        if (on) {
          await a.play(); 
          a.muted = false;
        } else {
          a.pause();
          a.muted = true;
        }
      } catch (e) {
        setOn(false);
        console.log("BGM play blocked:", e);
      }
    };

    sync();
  }, [on]);

  useEffect(() => {
    return () => {
      const a = audioRef.current;
      if (a) {
        a.pause();
        a.currentTime = 0;
      }
    };
  }, []);

  const toggle = () => {
    setOn((prev) => !prev);
  };

  return (
    <>
      <audio ref={audioRef} src="/assets/music/bgm.mp3" />
      <button
        onClick={toggle}
        style={{
          position: "fixed",
          width: 64,
          height: 27,
          right: 30,
          bottom: 18,
          zIndex: 9999,
          padding: "4px 6px",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.18)",
          background: "rgba(0,0,0,0.4)",
          color: "white",
          cursor: "pointer",
          fontSize: 11,
          letterSpacing: "0.02em",
        }}
      >
        {on ? "🔇 BGM" : "🎵 BGM"}
      </button>
    </>
  );
}
