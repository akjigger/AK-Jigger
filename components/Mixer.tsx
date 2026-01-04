
import React, { useState } from 'react';
import { getBoilermakerRecommendation } from '../services/geminiService';

const Mixer: React.FC = () => {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const moods = [
    { emoji: '❤️', label: 'In Love' },
    { emoji: '🔥', label: 'Spicy' },
    { emoji: '🧊', label: 'Chill' },
    { emoji: '🎉', label: 'Hype' },
    { emoji: '🎷', label: 'Smooth' },
    { emoji: '🤔', label: 'Curious' },
  ];

  const handleMix = async (selectedMood: string) => {
    setMood(selectedMood);
    setLoading(true);
    try {
      const data = await getBoilermakerRecommendation(selectedMood);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 animate-fade-in">
      <div className="mb-8">
        <h3 className="font-bungee text-[#E51D37] text-2xl tracking-tighter">MIXER LAB</h3>
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">Jigger & Pony Group</p>
      </div>

      {!result && !loading && (
        <div className="space-y-6">
          <div className="text-white text-center bg-blue-950/40 p-5 rounded-[2rem] border border-blue-900/30">
            <p className="font-bold text-sm tracking-tight">Tell us your vibe tonight...</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => handleMix(m.label)}
                className="flex items-center gap-4 p-5 bg-slate-900 rounded-3xl border border-blue-900/20 hover:border-[#E51D37]/50 transition-all active:scale-95 shadow-xl group"
              >
                <span className="text-3xl group-hover:scale-125 transition-transform">{m.emoji}</span>
                <span className="text-[11px] font-black uppercase text-blue-400 group-hover:text-white tracking-tighter">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="h-64 flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
             <div className="w-20 h-20 border-4 border-[#2B3890] border-t-[#E51D37] rounded-full animate-spin"></div>
             <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl">❤️</span>
             </div>
          </div>
          <p className="font-bungee text-white animate-pulse tracking-widest uppercase text-xs">Mixing the Magic...</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-slate-900 rounded-[2.5rem] border-2 border-[#2B3890] overflow-hidden animate-slide-up shadow-2xl">
          <div className="bg-[#2B3890] p-8 text-white text-center relative">
            <div className="absolute top-2 right-4 text-xs font-black opacity-30 tracking-widest">JIGGER & PONY EXCLUSIVE</div>
            <h4 className="font-bungee text-3xl leading-none tracking-tighter mb-4">{result.comboName}</h4>
            <div className="inline-block px-4 py-1.5 bg-slate-950/40 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
              VIBE: {mood}
            </div>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-950 rounded-3xl border border-blue-900/30">
                <p className="text-[9px] text-[#2B3890] font-black uppercase mb-1 tracking-widest">BEER</p>
                <p className="font-bold text-white text-xs leading-tight">{result.beer}</p>
              </div>
              <div className="p-5 bg-slate-950 rounded-3xl border border-blue-900/30">
                <p className="text-[9px] text-[#E51D37] font-black uppercase mb-1 tracking-widest">WHISKEY</p>
                <p className="font-bold text-white text-xs leading-tight">{result.whiskey}</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] text-blue-500 font-black uppercase mb-3 tracking-[0.2em] opacity-50 text-center">Tasting Notes</p>
              <p className="text-white text-sm leading-relaxed text-center font-medium px-2">{result.description}</p>
            </div>

            <div className="bg-[#E51D37]/10 p-6 rounded-3xl border border-[#E51D37]/30 text-center">
              <p className="text-[9px] text-[#E51D37] font-black uppercase mb-2 tracking-widest">Pro Tip</p>
              <p className="text-xs text-blue-100 italic leading-snug">"{result.pairingTip}"</p>
            </div>

            <button 
              onClick={() => setResult(null)}
              className="w-full text-white/40 font-black uppercase text-[10px] py-2 hover:text-white transition-colors tracking-[0.3em]"
            >
              CHOOSE ANOTHER VIBE
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mixer;
