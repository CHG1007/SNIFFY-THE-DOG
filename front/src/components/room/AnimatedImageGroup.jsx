export default function AnimatedImageGroup({ images, delay = 0 }) {
  return (
    <div
      className="flex flex-col gap-4 animate-float"
      style={{ animationDelay: `${delay}s` }}
    >
      {images.map((src, idx) => (
        <div
          key={idx}
          className="rounded-xl overflow-hidden shadow-lg"
        >
          <img
            src={src}
            alt=""
            className="w-full object-cover"
          />
        </div>
      ))}
    </div>
  );
}
