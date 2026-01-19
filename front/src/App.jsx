import './App.css'

function App() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
      <h1 className="text-5xl font-extrabold text-red-600 drop-shadow-lg">
        MAFIA GAME
      </h1>
      <p className="mt-4 text-gray-400">Tailwind CSS가 성공적으로 연결되었습니다!</p>
      <button className="mt-8 px-6 py-2 bg-red-700 hover:bg-red-500 rounded-full transition">
        게임 시작하기
      </button>
    </div>
  )
}

export default App
