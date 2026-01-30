export default function TopMenu({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group relative w-31 h-31 select-none"
      style={{
        backgroundImage: "url(/assets/images/roompage/goldbox.svg)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
      }}
    >
      {/* 텍스트를 아이콘 위에 올리기 */}
      <span
        className="absolute inset-0 flex items-center justify-center
                   text-white text-3xl font-black tracking-tight leading-none
                   drop-shadow-[0_2px_2px_rgba(0,0,0,0.6)]
                   group-hover:scale-[1.02] transition"
      >
        {label}
      </span>
    </button>
  );
}
