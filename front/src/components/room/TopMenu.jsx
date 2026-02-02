export default function TopMenu({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="group relative w-28 h-28 select-none flex-shrink-0"
      style={{
        backgroundImage: "url(/assets/images/roompage/goldbox.svg)",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "contain",
      }}
    >
      {/* 텍스트를 아이콘 위에 올리기 */}
      <span
        className="absolute inset-0 flex items-center justify-center text-white text-2xl font-black drop-shadow-md group-hover:scale-105 transition"
      >
        {label}
      </span>
    </button>
  );
}
