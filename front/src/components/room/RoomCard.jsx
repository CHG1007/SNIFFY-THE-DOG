export default function RoomCard({
  roomCode,
  title,
  hostName,
  current,
  capacity,
  onJoin,
}) {
  const isFull = current >= capacity;

  return (
    <div
      className="relative rounded-xl overflow-visible shadow-lg border border-black/10 bg-[#efe6c8]"
      onClick={onJoin}
      role={onJoin ? "button" : undefined}
      tabIndex={onJoin ? 0 : undefined}
    >
      {/* JOIN 배지 */}
      <div className="absolute -top-4 -right-4 h-12 w-12 rounded-full bg-[#6A0D06] border-2 border-black grid place-items-center rotate-12 shadow-xl z-10">
        <span className="text-white text-xs font-black">JOIN</span>
      </div>

      <div className="p-5">
        <div className="text-[10px] tracking-widest text-black/50 font-bold">
          {roomCode}
        </div>

        <div className="mt-2 text-2xl font-black text-black/80">
          {title}
        </div>

        <div className="mt-4 text-sm text-black/60">
          {hostName}
        </div>

        <div className="mt-6 flex items-end justify-between">
          <div className={["text-lg font-black", isFull ? "text-red-500" : "text-black/70"].join(" ")}>
            {current} / {capacity}
          </div>
        </div>
      </div>

      {isFull && <div className="absolute inset-0 bg-black/10" />}
    </div>
  );
}
