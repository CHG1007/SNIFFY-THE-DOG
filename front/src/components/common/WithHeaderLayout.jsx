import Header from "./Header";

export default function WithHeaderLayout({ children, backgroundUrl, overlay = "bg-black/35" }) {
  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />
        <div className={`absolute inset-0 ${overlay}`} />
        <div className="relative h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
