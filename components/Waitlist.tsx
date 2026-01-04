
import React, { useRef, useState } from 'react';
import { AppState } from '../types';

interface WaitlistProps {
  setView: (view: AppState) => void;
  playerName: string;
}

const Waitlist: React.FC<WaitlistProps> = ({ setView, playerName }) => {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [isNudging, setIsNudging] = useState(false);
  const [bursts, setBursts] = useState<{ id: number; x: number; y: number }[]>([]);

  const playChickenCluck = async (e: React.PointerEvent) => {
    try {
      setIsNudging(true);
      setTimeout(() => setIsNudging(false), 150);

      // Visual burst effect
      const id = Date.now();
      setBursts(prev => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => setBursts(prev => prev.filter(b => b.id !== id)), 600);

      // Audio Logic - Improved Synthesis for better audibility
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const now = ctx.currentTime;

      const cluck = (time: number, freq: number, duration: number) => {
        const osc = ctx.createOscillator();
        const sub = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.4, time + duration);

        sub.type = 'square';
        sub.frequency.setValueAtTime(freq * 1.5, time);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.1, time);
        subGain.gain.exponentialRampToValueAtTime(0.001, time + 0.04);
        sub.connect(subGain);
        subGain.connect(gain);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2400, time);

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.8, time + 0.01); // High gain for impact
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        sub.start(time);
        osc.stop(time + duration + 0.1);
        sub.stop(time + duration + 0.1);
      };

      // Double cluck "Buk-Buk!"
      cluck(now, 380, 0.12);
      cluck(now + 0.12, 320, 0.18);
      
    } catch (err) {
      console.error("Audio failed:", err);
    }
  };

  return (
    <div className="p-6 animate-fade-in relative">
      {/* Floating Bursts */}
      {bursts.map(b => (
        <div 
          key={b.id}
          className="fixed pointer-events-none z-[100] font-bungee text-[#E51D37] text-2xl animate-ping opacity-0"
          style={{ left: b.x - 20, top: b.y - 40 }}
        >
          BUK!
        </div>
      ))}

      <div className="bg-[#2B3890]/10 rounded-3xl p-8 border border-[#2B3890]/30 mb-6 text-center relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 group-hover:rotate-45 transition-transform duration-700">
            <span className="text-7xl text-white">❤️</span>
        </div>
        <div className="mb-4 flex justify-center">
          <div className="bg-[#E51D37] p-4 rounded-full shadow-[0_0_20px_rgba(229,29,55,0.4)] animate-pulse">
            <span className="text-4xl">🏇</span>
          </div>
        </div>
        <h2 className="text-2xl font-bungee text-white mb-1 leading-tight">
          YOU'RE IN, {playerName.toUpperCase() || 'PONY'}!
        </h2>
        <div className="flex items-center justify-center gap-3 text-[10px] font-bold text-blue-400 uppercase tracking-[0.2em]">
          <span>B.O.P Experience</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-blue-300 font-bold uppercase tracking-widest text-[9px] px-2 opacity-50">Kill some time</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setView('vinyl')}
            className="group flex flex-col p-5 bg-slate-900 border border-blue-900/30 rounded-3xl transition-all active:scale-95 hover:border-[#8b5cf6]/50"
          >
            <div className="text-3xl bg-[#8b5cf6] w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">💿</div>
            <p className="font-bold text-white text-xs mb-1">Vinyl Spin</p>
            <p className="text-[8px] text-blue-400 uppercase font-black tracking-widest">Rhythm</p>
          </button>

          <button 
            onClick={() => setView('wingflip')}
            className="group flex flex-col p-5 bg-slate-900 border border-blue-900/30 rounded-3xl transition-all active:scale-95 hover:border-[#E51D37]/50"
          >
            <div className="text-3xl bg-[#2B3890] w-12 h-12 flex items-center justify-center rounded-2xl mb-4 group-hover:scale-110 transition-transform">🍗</div>
            <p className="font-bold text-white text-xs mb-1">Wing Catch</p>
            <p className="text-[8px] text-blue-400 uppercase font-black tracking-widest">Arcade</p>
          </button>
        </div>

        <button 
          onClick={() => setView('leaderboard')}
          className="w-full group flex items-center justify-between p-5 bg-blue-900/10 border border-blue-600/20 rounded-3xl transition-all active:scale-95 hover:bg-blue-900/20"
        >
          <div className="flex items-center gap-4 text-left">
            <div className="text-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg group-hover:rotate-12 transition-transform">🏆</div>
            <div>
              <p className="font-bold text-white text-base font-bungee tracking-tight">HALL OF FAME</p>
              <p className="text-[9px] text-blue-400 uppercase font-black tracking-widest">See B.O.P Records</p>
            </div>
          </div>
          <span className="text-white group-hover:translate-x-1 transition-transform">→</span>
        </button>

        <div className={`p-5 bg-white/5 rounded-3xl border border-white/10 relative overflow-hidden flex items-center justify-between group/nudge transition-all ${isNudging ? 'scale-[0.98] bg-white/10 border-red-500/50' : ''}`}>
           <div className="flex items-center gap-4">
              <span className={`text-2xl transition-transform ${isNudging ? 'scale-125 rotate-12' : ''}`}>🐔</span>
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-tighter">Kitchen Nudge</p>
                <p className="text-[10px] text-blue-400 italic">Chef notified (politely)</p>
              </div>
           </div>
           <button 
            onPointerDown={playChickenCluck}
            className={`bg-[#E51D37] text-white text-[10px] font-black py-3 px-6 rounded-xl uppercase transition-all shadow-[0_4px_0_0_#991b1b] active:shadow-none translate-y-0 active:translate-y-[4px] font-bungee ${isNudging ? 'bg-white text-red-600 scale-105' : ''}`}
           >
            BUK-BUK!
           </button>
        </div>

        <div className="pt-8 border-t border-blue-900/30">
          <p className="text-center text-[9px] text-blue-500/50 italic uppercase tracking-widest leading-relaxed">
            "The heart of BOP beats in the deep fryer"<br/>— Jigger & Pony Group
          </p>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
