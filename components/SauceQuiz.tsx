
import React, { useState } from 'react';
import { getCocktailIdentity } from '../services/geminiService';
import { CocktailResult } from '../types';

const SauceQuiz: React.FC = () => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CocktailResult | null>(null);

  const questions = [
    {
      q: "A stranger drops a gold coin in your drink. You...",
      options: ["Down it. Extra minerals!", "Call the manager (politely)", "Check if it's chocolate", "Buy them a drink too"]
    },
    {
      q: "Your ideal Friday night atmosphere is...",
      options: ["Neon chaos & K-Pop", "Dim lights & Jazz", "Tropical beach fire", "Cozy blanket & Dalgona"]
    },
    {
      q: "If you were a garnish, which one would you be?",
      options: ["A spicy chili", "A classy gold leaf", "A funky umbrella", "A salty olive"]
    },
    {
      q: "You're handed a mysterious key at the door. It opens...",
      options: ["The velvet ropes to VIP", "A locked vintage fridge", "The DJ booth", "The secret rooftop garden"]
    },
    {
      q: "The last song of the night starts playing. It's...",
      options: ["A high-energy K-Pop anthem", "A smooth R&B slow jam", "A funky disco track", "A classic power ballad"]
    }
  ];

  const handleAnswer = async (option: string) => {
    const newAnswers = [...answers, option];
    setAnswers(newAnswers);
    
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setLoading(true);
      try {
        const identity = await getCocktailIdentity(newAnswers);
        setResult(identity);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
  };

  if (result) {
    return (
      <div className="p-6 animate-fade-in text-center bg-gradient-to-b from-slate-950 to-blue-950/20 h-full">
        <div className="mb-8">
            <span className="text-8xl float-animation inline-block">🍸</span>
        </div>
        <h3 className="font-bungee text-[#E51D37] text-2xl mb-2 tracking-tighter">MIXOLOGY MATCH</h3>
        <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest mb-6">B.O.P Soul Identity Result</p>
        
        <div className="bg-slate-900 rounded-[2.5rem] border-2 border-[#2B3890] p-8 shadow-[0_0_40px_rgba(43,56,144,0.3)] mb-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
            <h4 className="font-bungee text-3xl text-white mb-4 neon-text-blue leading-tight">{result.cocktailName}</h4>
            <p className="text-blue-200 italic mb-6 text-sm leading-relaxed">"{result.description}"</p>
            <div className="h-px bg-blue-900/30 my-6" />
            
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-[#E51D37] font-black uppercase mb-1 tracking-widest">Bar Personality</p>
                <p className="text-white text-sm font-medium">{result.personality}</p>
              </div>
              <div>
                <p className="text-[10px] text-blue-500 font-black uppercase mb-1 tracking-widest">Inner Spirit Animal</p>
                <p className="font-bold text-blue-200 uppercase tracking-tight">{result.spiritAnimal}</p>
              </div>
            </div>
        </div>

        <button 
          onClick={() => {setResult(null); setStep(0); setAnswers([]);}}
          className="w-full bg-[#E51D37] text-white font-bungee py-5 rounded-[2rem] shadow-[0_8px_0_0_#991b1b] active:translate-y-1 active:shadow-none transition-all"
        >
          RE-SHAKE THE TIN
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 animate-fade-in h-full flex flex-col">
      <div className="mb-8">
        <h3 className="font-bungee text-[#2B3890] text-2xl tracking-tighter neon-text-blue">BOP COCKTAIL IDENTITY</h3>
        <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1">Question {step + 1} of {questions.length}</p>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="relative w-24 h-24 mb-8">
              <div className="absolute inset-0 border-4 border-[#2B3890] border-t-transparent rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl animate-pulse">🧊</span>
              </div>
            </div>
            <p className="font-bungee text-white animate-pulse uppercase tracking-[0.2em] text-xs">Stirring the soul...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-blue-900/10 p-10 rounded-[2.5rem] border border-blue-900/30 mb-4 shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#E51D37]/40" />
            <p className="text-xl font-bold text-white leading-snug relative z-10">{questions[step].q}</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {questions[step].options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleAnswer(opt)}
                className="w-full p-6 bg-slate-900 border border-blue-900/20 rounded-3xl text-left font-bold text-blue-400 hover:border-[#E51D37]/50 hover:text-white transition-all active:scale-[0.98] shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">🍹</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SauceQuiz;
