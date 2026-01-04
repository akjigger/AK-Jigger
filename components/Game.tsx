
import React, { useState, useEffect, useRef } from 'react';
import { saveScore } from '../services/scoreService';

interface GameProps {
  playerName: string;
}

const Game: React.FC<GameProps> = ({ playerName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [glassPos, setGlassPos] = useState(50);
  const [shotPos, setShotPos] = useState<number | null>(null);
  const [shotY, setShotY] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [bestScore, setBestScore] = useState(0);

  const requestRef = useRef<number | undefined>(undefined);
  const glassDir = useRef(1);

  const glassPosRef = useRef(50);
  const shotPosRef = useRef<number | null>(null);
  const shotYRef = useRef(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'drop' | 'score' | 'fail') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'drop') {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'score') {
      osc.frequency.setValueAtTime(523.25, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'fail') {
      osc.frequency.setValueAtTime(110, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  };

  const animate = (time: number) => {
    const speed = 2 + (score * 0.12);
    let nextGlass = glassPosRef.current + glassDir.current * speed;
    if (nextGlass > 85) glassDir.current = -1;
    if (nextGlass < 15) glassDir.current = 1;
    glassPosRef.current = nextGlass;
    setGlassPos(nextGlass);

    if (shotPosRef.current !== null) {
      let nextY = shotYRef.current + 8;
      shotYRef.current = nextY;
      setShotY(nextY);
      
      // Hit detection (Y between 75% and 85%)
      if (nextY > 75 && nextY < 85) {
        const distance = Math.abs(shotPosRef.current - glassPosRef.current);
        if (distance < 12) {
          setScore(s => s + 1);
          setFeedback("DAEBAK! 🍷");
          playSound('score');
          shotPosRef.current = null;
          setShotPos(null);
        }
      }
      
      if (nextY > 100) {
        setFeedback("STAINED! 🫐");
        playSound('fail');
        
        // Save score if they made progress
        if (score > 0) {
          saveScore('shot-drop', playerName, score);
        }
        
        setScore(0);
        shotPosRef.current = null;
        setShotPos(null);
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, score]);

  useEffect(() => {
    if (score > bestScore) setBestScore(score);
  }, [score, bestScore]);

  const handleInteraction = () => {
    initAudio();
    if (!isPlaying) {
      setIsPlaying(true);
      setScore(0);
      setFeedback(null);
      return;
    }
    if (shotPosRef.current !== null) return;
    
    shotPosRef.current = 50;
    shotYRef.current = 10;
    setShotPos(50);
    setShotY(10);
    setFeedback(null);
    playSound('drop');
  };

  return (
    <div className="h-full p-6 flex flex-col animate-fade-in select-none min-h-[500px]">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h3 className="font-bungee text-[#E51D37] text-2xl tracking-tighter leading-none neon-text-red uppercase">BOKBUNJA POP</h3>
          <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest mt-1">Raspberry Rush</p>
        </div>
        <div className="text-right">
          <p className="text-[9px] text-slate-500 font-bold uppercase">Best: {bestScore}</p>
          <p className="text-4xl font-bungee text-white">{score}</p>
        </div>
      </div>

      <div className="flex-1 bg-[#020617] rounded-[2.5rem] border-2 border-blue-900/40 relative overflow-hidden mb-6 shadow-2xl min-h-[300px]">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'linear-gradient(#2B3890 1px, transparent 1px), linear-gradient(90deg, #2B3890 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

        {/* The Dispenser */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-slate-800 rounded-b-xl border-x border-b border-blue-400/20 z-10 flex items-center justify-center">
          <span className="text-2xl">🍇</span>
        </div>
        
        {/* Falling Shot */}
        {shotPos !== null && (
          <div 
            className="absolute text-4xl z-20"
            style={{ 
              top: `${shotY}%`, 
              left: `calc(${shotPos}% - 20px)` 
            }}
          >
            🍷
          </div>
        )}

        {/* Sliding Cup */}
        <div 
          className="absolute bottom-12 z-10 transition-transform duration-0"
          style={{ left: `calc(${glassPos}% - 40px)` }}
        >
          <div className="text-7xl drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">🥛</div>
        </div>

        {feedback && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <span className="font-bungee text-4xl text-white neon-text-red animate-bounce">
              {feedback}
            </span>
          </div>
        )}

        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-40">
            <h4 className="font-bungee text-xl text-white mb-4 leading-none tracking-tight">BOKBUNJA<br/>CHALLENGE</h4>
            
            <div className="bg-blue-900/20 border border-blue-400/20 rounded-3xl p-5 mb-8 w-full max-w-[280px]">
              <h5 className="font-black text-blue-400 text-[10px] uppercase tracking-[0.3em] mb-3 text-center">Instructions</h5>
              <ul className="text-left text-blue-100 text-[11px] space-y-2 font-medium">
                <li>• Objective: Catch the Bokbunja shot in the cup.</li>
                <li>• How: Tap the red button to release the raspberry joy.</li>
                <li>• Goal: Perfect timing for a sweet K-pairing!</li>
              </ul>
            </div>

            <button 
              onClick={handleInteraction}
              className="bg-[#E51D37] text-white font-bungee px-12 py-5 rounded-3xl shadow-[0_8px_0_0_#991b1b] active:translate-y-1 active:shadow-[0_4px_0_0_#991b1b] transition-all text-xl"
            >
              START
            </button>
          </div>
        )}
      </div>

      <button 
        onPointerDown={handleInteraction}
        className="w-full bg-[#E51D37] border-b-8 border-red-900 py-8 rounded-[2rem] active:translate-y-1 active:border-b-0 transition-all shadow-2xl"
      >
        <span className="font-bungee text-3xl text-white block uppercase">Pop It!</span>
      </button>
    </div>
  );
};

export default Game;
