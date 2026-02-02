export default function Pagination({ currentPage, totalPages, onPrev, onNext, onSelect }) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-3 mt-3">
      <PageBtn onClick={onPrev}>◀</PageBtn>
      {pages.map((p) => (
        <PageNum key={p} active={p === currentPage} onClick={() => onSelect(p)}>
          {p}
        </PageNum>
      ))}
      <PageBtn onClick={onNext}>▶</PageBtn>
    </div>
  );
}

function PageBtn({ children, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="h-9 w-9 rounded-xl bg-white/15 text-white text-lg font-black hover:bg-white/25 transition"
    >
      {children}
    </button>
  );
}

function PageNum({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className={[
        "h-9 w-9 rounded-xl text-lg font-black transition",
        active ? "bg-white/25 text-white" : "bg-white/10 text-white/80 hover:bg-white/20",
      ].join(" ")}
    >
      {children}
    </button>
  );
}
