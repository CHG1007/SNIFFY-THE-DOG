import AnimatedImageGroup from "./AnimatedImageGroup";

export default function LeftPanel() {
  return (
    <div className="w-[360px] rounded-2xl bg-white/15 backdrop-blur-md border border-white/10 p-4 flex flex-col gap-6">
      <AnimatedImageGroup
        images={[
          "/assets/images/roompage/story1.png",
          "/assets/images/roompage/story2.png",
        ]}
        delay={0}
      />
      <AnimatedImageGroup
        images={[
          "/assets/images/roompage/story3.png",  
          "/assets/images/roompage/story4.png",
        ]}
        delay={0.3}
      />
    </div>
  );
}


//          "/assets/images/roompage/story5.png",
//          "/assets/images/roompage/story4.png",