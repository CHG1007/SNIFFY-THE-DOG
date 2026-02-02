import AnimatedImageGroup from "./AnimatedImageGroup";

export default function LeftPanel() {
  return (
    <div className="w-[320px] h-[60vh] min-h-[465px] max-h-[550px] overflow-hidden rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 p-4 flex flex-col gap-6 shadow-xl">
      <AnimatedImageGroup
        images={[
          "assets/images/roompage/memory1.png",
          "assets/images/roompage/memory2.png",
          "assets/images/roompage/memory3.png",
          "assets/images/roompage/memory4.png",
          "assets/images/roompage/memory5.png",
          "assets/images/roompage/memory6.png",
        ]}
        delay={0}
      />

    </div>
  );
}
