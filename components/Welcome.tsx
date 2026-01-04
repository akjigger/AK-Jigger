
import React, { useState } from 'react';
import Logo from './Logo';

interface WelcomeProps {
  onStart: (name: string) => void;
}

const Welcome: React.FC<WelcomeProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart(name || 'Guest Pony');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in bg-gradient-to-b from-slate-950 via-[#020617] to-[#2B3890]/20">
      <div className="mb-8 relative flex items-center justify-center">
        <div className="absolute inset-0 bg-[#E51D37]/10 blur-3xl rounded-full scale-150 animate-pulse" />
        <Logo className="w-48 h-48 float-animation relative z-10" />
      </div>
      
      <div className="mb-10">
        <h2 className="font-bungee text-5xl mb-1 tracking-tight leading-none text-white drop-shadow-2xl">
          B.O.P
        </h2>
        <div className="flex items-center justify-center gap-3 text-[#E51D37] font-bold text-[10px] tracking-[0.2em] uppercase">
          <span>BARTENDERS</span>
          <span className="text-white opacity-20">•</span>
          <span>OF</span>
          <span className="text-white opacity-20">•</span>
          <span>PONY</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-4 max-w-xs">
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="ENTER YOUR NICKNAME..."
            maxLength={12}
            className="w-full bg-slate-900/50 border-2 border-blue-900/30 rounded-2xl px-6 py-4 text-white text-center font-bold tracking-widest focus:outline-none focus:border-[#E51D37] transition-all placeholder:text-blue-900 text-sm"
          />
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-950 px-2 text-[8px] font-black text-blue-500 uppercase tracking-widest whitespace-nowrap">
            Who's joining us?
          </div>
        </div>

        <button 
          type="submit"
          className="w-full bg-[#E51D37] text-white font-bungee text-xl py-5 rounded-2xl shadow-[0_8px_0_0_#991b1b] active:translate-y-1 active:shadow-[0_4px_0_0_#991b1b] transition-all hover:bg-[#ff2442]"
        >
          {name ? `HI ${name.toUpperCase()}!` : 'ENTER THE PARTY'}
        </button>
        
        <p className="text-blue-300/40 font-medium text-[8px] tracking-[0.3em] uppercase pt-4">
          Jigger & Pony Group
        </p>
      </form>
    </div>
  );
};

export default Welcome;
