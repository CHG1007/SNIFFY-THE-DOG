import { useState, useEffect } from 'react'; 
import VideoCanvas from "../video/VideoCanvas";
import { Siren, Crown, Mic, MicOff, Video, VideoOff } from 'lucide-react';

const WaitingSlot = ({ player, isMe, isHost, onKickRequest }) => {
  const [audioLevel, setAudioLevel] = useState(0);

  // Mock Audio Visualizer
  useEffect(() => {
    if (!player.isMicOn) {
        setAudioLevel(0);
        return;
    }
    const interval = setInterval(() => {
      setAudioLevel(Math.floor(Math.random() * 100));
    }, 100);
    return () => clearInterval(interval);
  }, [player.isMicOn]);
  
  return (
    // Added 'aspect-video' to ensure ratio maintenance in the restored grid
    <div className={`
        relative w-full aspect-video rounded-2xl overflow-hidden transition-all duration-500
        group bg-[#111] 
        ${player.isReady 
            ? 'shadow-[0_0_30px_rgba(255,100,0,0.3)] ring-2 ring-orange-500 translate-y-[-4px]' 
            : 'shadow-2xl border border-white/5 hover:border-white/20 hover:bg-[#1a1a1a]'
        }
    `}>
      
      {/* 1. Status Overlay (Top Right) - Kept from Prompt 17 */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        
        {/* Mic/Video Status Pills */}
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/5 shadow-lg">
            {player.isMicOn ? <Mic size={14} className="text-emerald-400" /> : <MicOff size={14} className="text-red-500/80" />}
            <div className="w-[1px] h-3 bg-white/10" />
            {player.isVideoOn ? <Video size={14} className="text-blue-400" /> : <VideoOff size={14} className="text-red-500/80" />}
        </div>

        {/* Kick Button (Host Action) */}
        {isHost && !isMe && (
            <button
                onClick={() => onKickRequest(player)}
                className="bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white p-1.5 rounded-full transition-all cursor-pointer opacity-0 group-hover:opacity-100 backdrop-blur-md"
                title="Kick Player"
            >
                <Siren size={16} />
            </button>
        )}
      </div>

      {/* 2. Ready Indicator (Top Left Badge) - ICON REMOVED */}
      {player.isReady && (
         <div className="absolute top-4 left-4 z-30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-3 py-1 rounded-full shadow-lg flex items-center justify-center font-bold text-[10px] tracking-wider uppercase backdrop-blur-sm border border-orange-400/30">
                <span>READY</span>
             </div>
         </div>
      )}

      {/* 3. Main Video Layer */}
      <div className="absolute inset-0 z-0">
          <VideoCanvas stream={player.stream} isMuted={isMe || !player.isMicOn} />
          {/* Vignette Overlay for Depth */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.8)_100%)] pointer-events-none" />
      </div>

      {/* 4. Bottom Info Bar - Kept from Prompt 17 */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black via-black/80 to-transparent flex items-end justify-between px-5 pb-4 z-20">
        
        {/* User Info */}
        <div className="flex items-center gap-3">
          {player.isHost ? (
             <div className="relative">
                <div className="absolute inset-0 bg-yellow-500 blur-sm opacity-50 rounded-full" />
                <div className="relative bg-black/50 p-1.5 rounded-full border border-yellow-500/50 text-yellow-400">
                   <Crown size={14} fill="currentColor" />
                </div>
             </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/50 border border-white/5">
                {player.name.charAt(0)}
            </div>
          )}
          
          <div className="flex flex-col justify-end">
             <span className={`text-sm font-bold tracking-wide drop-shadow-md leading-none ${player.isReady ? 'text-white' : 'text-gray-400'}`}>
                {player.name}
             </span>
             {isMe && <span className="text-[10px] text-orange-500 font-semibold tracking-wider uppercase mt-1">You</span>}
          </div>
        </div>

        {/* Audio Visualizer (Live) */}
        {player.isMicOn && (
          <div className="flex items-end gap-[2px] h-6 mb-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-1 bg-emerald-400/80 rounded-t-sm transition-all duration-75 shadow-[0_0_10px_rgba(52,211,153,0.5)]"
                style={{ 
                  height: `${Math.max(15, audioLevel * (Math.random() * 0.8 + 0.2))}%`,
                  opacity: 0.8
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ready Overlay Flash */}
      {player.isReady && (
        <div className="absolute inset-0 border-2 border-orange-500/30 rounded-2xl pointer-events-none animate-pulse" />
      )}

    </div>
  );
};

export default WaitingSlot;
