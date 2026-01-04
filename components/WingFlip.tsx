
import React, { useState, useEffect, useRef } from 'react';
import { saveScore } from '../services/scoreService';

interface Wing {
  id: number;
  x: number;
  y: number;
  speed: number;
  rotation: number;
  rotSpeed: number;
}

interface WingFlipProps {
  playerName: string;
}

const WingFlip: React.FC<WingFlipProps> = ({ playerName }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [misses, setMisses] = useState(0);
  const [bucketX, setBucketX] = useState(50);
  const [wings, setWings] = useState<Wing[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | undefined>(undefined);
  const lastSpawnRef = useRef<number>(0);
  const wingsRef = useRef<Wing[]>([]);
  const bucketXRef = useRef(50);
  const scoreRef = useRef(0);
  const missesRef = useRef(0);
  
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  };

  const playSound = (type: 'catch' | 'miss' | 'over') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    if (ctx.state === 'suspended') ctx.resume();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    const now = ctx.currentTime;

    if (type === 'catch') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'miss') {
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(50, now + 0.2);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
    } else if (type === 'over') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.linearRampToValueAtTime(30, now + 1);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0, now + 1);
      osc.start(now);
      osc.stop(now + 1);
    }
  };

  const spawnWing = () => {
    const newWing: Wing = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: -10,
      speed: 1.5 + Math.random() * 2 + (scoreRef.current * 0.1),
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10
    };
    wingsRef.current = [...wingsRef.current, newWing];
  };

  const update = (time: number) => {
    if (!isPlaying || isGameOver) return;

    // Spawn logic
    const spawnRate = Math.max(400, 1500 - (scoreRef.current * 50));
    if (time - lastSpawnRef.current > spawnRate) {
      spawnWing();
      lastSpawnRef.current = time;
    }

    // Move wings and collision detection
    const updatedWings: Wing[] = [];
    let caughtCount = 0;
    let missedThisFrame = 0;

    for (const wing of wingsRef.current) {
      const nextY = wing.y + wing.speed;
      const nextRot = wing.rotation + wing.rotSpeed;

      // Check collision with bucket (at Y ~85%)
      if (nextY >= 80 && nextY <= 90) {
        const dist = Math.abs(wing.x - bucketXRef.current);
        if (dist < 15) {
          caughtCount++;
          playSound('catch');
          setFeedback("YUM! 🍗");
          continue; // Caught, don't add back to list
        }
      }

      if (nextY > 105) {
        missedThisFrame++;
        playSound('miss');
        continue; // Missed, don't add back to list
      }

      updatedWings.push({ ...wing, y: nextY, rotation: nextRot });
    }

    if (caughtCount > 0) {
      scoreRef.current += caughtCount;
      setScore(scoreRef.current);
    }

    if (missedThisFrame > 0) {
      missesRef.current += missedThisFrame;
      setMisses(missesRef.current);
      if (missesRef.current >= 5) {
        setIsGameOver(true);
        playSound('over');
        saveScore('wing-catcher', playerName, scoreRef.current);
      }
    }

    wingsRef.current = updatedWings;
    setWings(updatedWings);

    requestRef.current = requestAnimationFrame(update);
  };

  useEffect(() => {
    if (isPlaying && !isGameOver) {
      requestRef.current = requestAnimationFrame(update);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, isGameOver]);

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isPlaying || isGameOver || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    let clientX = 0;
    if ('touches' in e) {
      clientX = (e as React.TouchEvent).touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }
    
    const x = ((clientX - rect.left) / rect.width) * 100;
    const boundedX = Math.max(10, Math.min(90, x));
    bucketXRef.current = boundedX;
    setBucketX(boundedX);
  };

  const startGame = () => {
    initAudio();
    setIsPlaying(true);
    setIsGameOver(false);
    setScore(0);
    setMisses(0);
    scoreRef.current = 0;
    missesRef.current = 0;
    wingsRef.current = [];
    setWings([]);
    setFeedback(null);
    lastSpawnRef.current = performance.now();
  };

  return (
    <div className="h-full p-6 flex flex-col animate-fade-in select-none min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bungee text-[#E51D37] text-2xl tracking-tighter neon-text-red">WING CATCHER</h3>
          <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Don't let them drop!</p>
        </div>
        <div className="text-right flex flex-col items-end">
          <div className="flex gap-1 mb-1">
            {[...Array(5)].map((_, i) => (
              <span key={i} className={`text-xs transition-opacity ${i < misses ? 'opacity-20 grayscale' : 'opacity-100'}`}>🍗</span>
            ))}
          </div>
          <p className="text-4xl font-bungee text-white leading-none">{score}</p>
        </div>
      </div>

      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onTouchMove={handleMouseMove}
        className="flex-1 bg-slate-900 rounded-[2.5rem] border-2 border-[#2B3890]/40 relative overflow-hidden mb-6 shadow-inner min-h-[350px] touch-none"
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#3b82f6 1px, transparent 1px)', backgroundSize: '25px 25px' }} />

        {/* The Wings */}
        {wings.map(wing => (
          <div 
            key={wing.id}
            className="absolute z-20 text-4xl pointer-events-none"
            style={{ 
              top: `${wing.y}%`, 
              left: `${wing.x}%`,
              transform: `translate(-50%, -50%) rotate(${wing.rotation}deg)` 
            }}
          >
            🍗
          </div>
        ))}

        {/* The Bucket */}
        <div 
          className="absolute z-10 pointer-events-none"
          style={{ 
            bottom: '5%', 
            left: `${bucketX}%`,
            transform: 'translateX(-50%)' 
          }}
        >
          <div className="text-6xl drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]">🪣</div>
        </div>

        {feedback && !isGameOver && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
            <span className="font-bungee text-2xl text-white neon-text-blue animate-fade-out-up">
              {feedback}
            </span>
          </div>
        )}

        {(!isPlaying || isGameOver) && (
          <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 text-center z-40 animate-fade-in">
            <h4 className="font-bungee text-3xl text-white mb-2">{isGameOver ? 'GAME OVER' : 'WING RUSH'}</h4>
            {isGameOver && (
               <p className="text-[#E51D37] font-black text-sm mb-2 uppercase tracking-widest">
                YOU LOST 5 CHICKENS!
               </p>
            )}
            <p className="text-blue-300 text-[10px] mb-8 uppercase tracking-[0.2em] font-black max-w-[200px]">
              Slide your finger to catch falling wings in the bucket.
            </p>
            
            <div className="mb-8">
              <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Score</p>
              <p className="text-5xl font-bungee text-white">{score}</p>
            </div>

            <button 
              onClick={startGame}
              className="bg-[#E51D37] text-white font-bungee px-12 py-5 rounded-3xl shadow-[0_8px_0_0_#991b1b] active:translate-y-1 active:shadow-[0_4px_0_0_#991b1b] transition-all text-xl"
            >
              {isGameOver ? 'TRY AGAIN' : 'START CATCHING'}
            </button>
          </div>
        )}
      </div>

      <div className="bg-blue-900/10 p-4 rounded-3xl border border-blue-900/20 text-center">
        <p className="text-[9px] text-blue-500 font-black uppercase tracking-[0.3em]">
          Catch 50 wings for a special B.O.P discount!
        </p>
      </div>

      <style>{`
        @keyframes fade-out-up {
          0% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -150%) scale(1.5); }
        }
        .animate-fade-out-up {
          animation: fade-out-up 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default WingFlip;
