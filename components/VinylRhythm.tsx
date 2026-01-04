
import React, { useState, useEffect, useRef } from 'react';
import { saveScore } from '../services/scoreService';

interface Track {
  id: number;
  title: string;
  artist: string;
  genre: string;
  category: 'Modern' | 'Iconic' | 'Retro' | 'B.O.P';
  bpm: number;
  url: string;
  color: string;
}

const TRACKS: Track[] = [
  { 
    id: 1, 
    title: "PINK VENOMOUS", 
    artist: "B.O.P PINK", 
    genre: "K-Pop Trap", 
    category: 'Modern',
    bpm: 130, 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", 
    color: "#FF10F0" 
  },
  { 
    id: 2, 
    title: "DYNAMITE DISCO", 
    artist: "B.O.P ARMY", 
    genre: "K-Pop Funk", 
    category: 'Iconic',
    bpm: 114, 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3", 
    color: "#FFD700" 
  },
  { 
    id: 3, 
    title: "WONDER BEAT", 
    artist: "RETRO QUEENS", 
    genre: "K-Pop Retro", 
    category: 'Retro',
    bpm: 120, 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3", 
    color: "#60a5fa" 
  },
  { 
    id: 4, 
    title: "FANTASTIC BLAZE", 
    artist: "BIG BANGERS", 
    genre: "K-Pop Club", 
    category: 'Iconic',
    bpm: 126, 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", 
    color: "#fbbf24" 
  },
  { 
    id: 5, 
    title: "HYPE PONY", 
    artist: "NEW BOP", 
    genre: "K-Pop R&B", 
    category: 'Modern',
    bpm: 100, 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3", 
    color: "#a78bfa" 
  },
  { 
    id: 6, 
    title: "FEEL SPECIAL", 
    artist: "BOP ONCE", 
    genre: "K-Pop Pop", 
    category: 'Modern',
    bpm: 124, 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3", 
    color: "#f472b6" 
  },
  { 
    id: 7, 
    title: "BOILERMAKER ANTHEM", 
    artist: "B.O.P CREW", 
    genre: "House", 
    category: 'B.O.P',
    bpm: 128, 
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3", 
    color: "#E51D37" 
  }
];

const GAME_DURATION = 30;

interface VinylRhythmProps {
  playerName: string;
}

const VinylRhythm: React.FC<VinylRhythmProps> = ({ playerName }) => {
  const [gameState, setGameState] = useState<'selection' | 'playing'>('selection');
  const [selectedTrack, setSelectedTrack] = useState<Track>(TRACKS[0]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [notes, setNotes] = useState<{ id: number; angle: number; active: boolean }[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(8).fill(0));
  const [isBuffering, setIsBuffering] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const rotationRef = useRef(0);
  const lastNoteTime = useRef(0);
  const startTimeRef = useRef(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);

  const initAudio = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    if (!analyzerRef.current) {
      analyzerRef.current = audioCtxRef.current.createAnalyser();
      analyzerRef.current.fftSize = 64;
      analyzerRef.current.connect(audioCtxRef.current.destination);
    }

    if (audioRef.current && !sourceNodeRef.current) {
      try {
        sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(audioRef.current);
        sourceNodeRef.current.connect(analyzerRef.current);
      } catch (err) {
        console.warn("Audio node already connected", err);
      }
    }
  };

  const playScratchSound = (isHit: boolean) => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    if (isHit) {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.15);
      gain.gain.setValueAtTime(0.1, now);
    }
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  };

  const startGame = async () => {
    setIsBuffering(true);
    setAudioError(false);
    await initAudio();
    
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 1.0;
      
      try {
        // Attempt to play. Some browsers block autoplay if no user interaction.
        const playPromise = audioRef.current.play();
        
        if (playPromise !== undefined) {
          playPromise.then(() => {
            startLogic();
          }).catch(e => {
            console.warn("Audio play blocked or failed. Starting in silent mode.", e);
            setAudioError(true);
            startLogic();
          });
        } else {
          startLogic();
        }
      } catch (e) {
        console.error("Critical music failure", e);
        startLogic();
      }
    } else {
      startLogic();
    }
  };

  const startLogic = () => {
    setGameState('playing');
    setScore(0);
    setNotes([]);
    setFeedback(null);
    setTimeLeft(GAME_DURATION);
    rotationRef.current = 0;
    startTimeRef.current = performance.now();
    setIsBuffering(false);
  };

  const stopGame = () => {
    if (audioRef.current) audioRef.current.pause();
    if (score > 0) saveScore('vinyl-scratch', playerName, score);
    if (score > highScore) setHighScore(score);
    setGameState('selection');
  };

  const animate = (time: number) => {
    if (gameState !== 'playing') return;

    const elapsed = (time - startTimeRef.current) / 1000;
    const remaining = Math.max(0, GAME_DURATION - elapsed);
    setTimeLeft(remaining);

    if (remaining <= 0) {
      stopGame();
      setFeedback("TIME'S UP!");
      return;
    }

    if (analyzerRef.current) {
      const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
      analyzerRef.current.getByteFrequencyData(dataArray);
      const bars = [];
      for (let i = 0; i < 8; i++) {
        bars.push(dataArray[i * 2] / 255);
      }
      setVisualizerData(bars);
    }

    const delta = (selectedTrack.bpm / 60) * 1.6;
    rotationRef.current = (rotationRef.current + delta) % 360;
    setRotation(rotationRef.current);

    const beatInterval = (60 / selectedTrack.bpm) * 1000;
    if (time - lastNoteTime.current > beatInterval) {
      const newNote = {
        id: Date.now(),
        angle: (360 - rotationRef.current) % 360, 
        active: true
      };
      setNotes(prev => [...prev.slice(-15), newNote]);
      lastNoteTime.current = time;
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, selectedTrack]);

  const handleTap = async () => {
    if (gameState !== 'playing') return;
    if (audioCtxRef.current?.state === 'suspended') await audioCtxRef.current.resume();

    let hit = false;
    const hitZone = 28; 

    setNotes(prev => prev.map(note => {
      const currentPos = (note.angle + rotationRef.current) % 360;
      const diff = Math.min(Math.abs(currentPos), 360 - Math.abs(currentPos));
      
      if (note.active && diff < hitZone) {
        hit = true;
        setScore(s => s + 1);
        setFeedback("BOOM! 🔥");
        playScratchSound(true);
        return { ...note, active: false };
      }
      return note;
    }));

    if (!hit) {
      setFeedback("MISS! 💥");
      playScratchSound(false);
    }
  };

  return (
    <div className="h-full flex flex-col animate-fade-in select-none bg-slate-950 overflow-hidden">
      <audio 
        ref={audioRef} 
        src={selectedTrack.url} 
        crossOrigin="anonymous" 
        preload="auto"
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onError={() => {
          console.warn("Audio element error, using synthesizer only.");
          setAudioError(true);
          setIsBuffering(false);
        }}
      />
      
      <div className="p-6 flex justify-between items-end bg-slate-900/50 border-b border-blue-900/20 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="font-bungee text-[#2B3890] text-2xl tracking-tighter leading-none neon-text-blue">VINYL SCRATCH</h3>
            <p className="text-[10px] text-blue-500 font-black uppercase tracking-widest mt-1">
              {gameState === 'playing' ? `${selectedTrack.title} • ${selectedTrack.genre}` : 'Select your 30s K-Pop Beat'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">BEST: {highScore}</p>
          <p className="text-4xl font-bungee text-white leading-none">{score}</p>
        </div>
      </div>

      {gameState === 'selection' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar pb-32">
          <div className="text-center py-6 bg-gradient-to-r from-[#2B3890]/10 to-[#E51D37]/10 rounded-[2.5rem] border border-white/5 mb-4 relative overflow-hidden">
             <p className="text-[9px] text-[#E51D37] font-black uppercase tracking-[0.4em] mb-1">Jigger & Pony Selection</p>
             <h4 className="font-bungee text-white text-xl uppercase tracking-tighter">7 STAGE CHALLENGE</h4>
          </div>
          
          {TRACKS.map(track => (
            <button
              key={track.id}
              onClick={() => {
                setSelectedTrack(track);
                setAudioError(false);
                if (audioRef.current) audioRef.current.load();
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-3xl transition-all border relative overflow-hidden ${
                selectedTrack.id === track.id 
                ? 'bg-[#2B3890] border-blue-400 shadow-[0_0_20px_rgba(43,56,144,0.3)] scale-[1.01]' 
                : 'bg-slate-900 border-blue-900/20 opacity-70 hover:opacity-100'
              }`}
            >
              <div 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner border border-white/5 flex-shrink-0 ${selectedTrack.id === track.id ? 'animate-pulse' : ''}`}
                style={{ backgroundColor: track.color + '44' }}
              >
                {selectedTrack.id === track.id ? '💿' : '📻'}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[7px] font-black uppercase px-1.5 py-0.5 bg-black/40 text-blue-400 rounded-md border border-blue-500/20">
                    {track.category}
                  </span>
                  <span className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{track.artist}</span>
                </div>
                <p className={`font-bold text-sm truncate ${selectedTrack.id === track.id ? 'text-white' : 'text-blue-200'}`}>{track.title}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <span className="text-[9px] font-black text-blue-300 tabular-nums">{track.bpm} BPM</span>
              </div>
              {selectedTrack.id === track.id && (
                <div className="absolute bottom-0 left-0 h-1 bg-white/20 w-full" />
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="flex-1 relative flex flex-col items-center justify-center p-6 overflow-hidden" onClick={handleTap}>
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/10 to-slate-950" />
          
          <div className="absolute top-10 right-10 w-20 h-20 flex items-center justify-center z-20">
             <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="40" cy="40" r="36" fill="none" stroke="#2B3890" strokeWidth="4" className="opacity-20" />
                <circle cx="40" cy="40" r="36" fill="none" stroke="#E51D37" strokeWidth="4" strokeDasharray="226.2" strokeDashoffset={226.2 - (226.2 * (timeLeft / GAME_DURATION))} className="transition-all duration-100" />
             </svg>
             <span className="font-bungee text-white text-2xl">{Math.ceil(timeLeft)}</span>
          </div>

          <div className="absolute top-10 flex gap-1 h-16 items-end opacity-40 pointer-events-none">
            {visualizerData.map((v, i) => (
              <div 
                key={i} 
                className="w-2 rounded-t-sm transition-all duration-75" 
                style={{ height: `${20 + (v * 100)}%`, backgroundColor: selectedTrack.color }}
              />
            ))}
          </div>

          <div className="relative z-10 mt-8 scale-90 sm:scale-100">
             <div className="absolute inset-0 -m-12 bg-blue-900/10 rounded-full blur-3xl animate-pulse" />
             
             <div 
               className="relative w-72 h-72 rounded-full border-[10px] border-[#0a0a0a] shadow-[0_0_60px_rgba(0,0,0,0.8)] flex items-center justify-center"
               style={{ 
                 transform: `rotate(${rotation}deg)`,
                 boxShadow: `0 0 50px ${selectedTrack.color}33`
               }}
             >
               <div className="absolute inset-0 bg-[repeating-radial-gradient(circle,transparent,transparent_2px,#ffffff05_4px)]" />
               
               <div 
                 className="w-36 h-36 rounded-full border-[8px] border-white/5 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden"
                 style={{ 
                   backgroundColor: selectedTrack.color,
                   transform: `scale(${1 + visualizerData[0] * 0.15})` 
                 }}
               >
                 <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white,transparent)]" />
                 <div className="w-3 h-3 rounded-full bg-black mb-1 relative z-10" />
                 <p className="text-[9px] font-black text-white uppercase tracking-tighter text-center px-4 leading-tight relative z-10">
                   {selectedTrack.title}
                 </p>
               </div>

               {notes.map(note => (
                 <div
                   key={note.id}
                   className={`absolute w-12 h-12 flex items-center justify-center transition-all ${note.active ? 'scale-100' : 'scale-150 opacity-0'}`}
                   style={{
                     transform: `rotate(${note.angle}deg) translateY(-120px) rotate(-${note.angle + rotation}deg)`
                   }}
                 >
                   <div 
                    className="w-6 h-6 rounded-full shadow-[0_0_15px_#fff] border-2 border-white animate-pulse"
                    style={{ backgroundColor: selectedTrack.color }}
                   />
                 </div>
               ))}
             </div>

             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[180px] z-30 pointer-events-none">
                <div className="w-1 h-32 bg-slate-500 rounded-full shadow-2xl origin-top rotate-3" />
                <div className="w-8 h-10 bg-slate-300 rounded-lg absolute bottom-0 left-1/2 -translate-x-1/2 shadow-xl border-t-2 border-white" />
             </div>
          </div>

          <div className="h-24 flex flex-col items-center justify-center mt-4 text-center">
            {audioError && gameState === 'playing' && (
              <p className="text-[8px] text-white/40 uppercase tracking-widest mb-1">
                Music Stream Error - Playing Silently
              </p>
            )}
            {feedback && (
              <span className="font-bungee text-3xl text-white neon-text-red italic animate-bounce tracking-tight">
                {feedback}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-6 bg-slate-950/98 border-t border-blue-900/30 sticky bottom-0 z-50">
        {gameState === 'selection' ? (
          <button 
            onClick={startGame}
            disabled={isBuffering && !audioError}
            className={`w-full bg-[#E51D37] border-b-8 border-red-900 py-6 rounded-[2rem] active:translate-y-1 active:border-b-0 transition-all shadow-[0_15px_40px_rgba(229,29,55,0.4)] ${isBuffering && !audioError ? 'opacity-50 cursor-wait' : ''}`}
          >
            <span className="font-bungee text-2xl text-white block uppercase">
              {isBuffering && !audioError ? 'Cueing Beat...' : 'LET\'S SPIN!'}
            </span>
          </button>
        ) : (
          <div className="flex gap-4">
            <button 
              onClick={stopGame}
              className="px-6 bg-slate-900 text-blue-500 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest border border-blue-900/30 active:scale-95"
            >
              STOP
            </button>
            <button 
              onPointerDown={handleTap}
              className="flex-1 bg-[#E51D37] border-b-8 border-red-900 py-6 rounded-[2rem] active:translate-y-1 active:border-b-0 transition-all shadow-[0_20px_50px_rgba(229,29,55,0.5)] group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity" />
              <span className="font-bungee text-3xl text-white group-active:scale-95 transition-transform block uppercase">Scratch</span>
            </button>
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #2B3890; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default VinylRhythm;
