
import React from 'react';
import { AppState } from '../types';

interface NavigationProps {
  currentView: AppState;
  setView: (view: AppState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, setView }) => {
  const tabs: { id: AppState; label: string; icon: string }[] = [
    { id: 'waitlist', label: 'Home', icon: '🏠' },
    { id: 'game', label: 'Bok POP', icon: '🍷' },
    { id: 'wingflip', label: 'Flip', icon: '🍗' },
    { id: 'vinyl', label: 'Spin', icon: '💿' },
    { id: 'leaderboard', label: 'Hall', icon: '🏆' },
    { id: 'mixer', label: 'Mixer', icon: '🍺' },
    { id: 'quiz', label: 'ID', icon: '🍸' },
    { id: 'oracle', label: 'Sensei', icon: '🐔' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-slate-950/95 backdrop-blur-xl border-t border-[#2B3890]/30 px-1 py-4 flex justify-around items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setView(tab.id)}
          className={`flex flex-col items-center gap-1 transition-all flex-1 ${
            currentView === tab.id ? 'text-[#E51D37] scale-125' : 'text-blue-500/40'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-[7px] font-black uppercase tracking-tighter whitespace-nowrap">{tab.label}</span>
          {currentView === tab.id && (
            <div className="w-1.5 h-1.5 bg-[#E51D37] rounded-full mt-1 animate-pulse shadow-[0_0_8px_#E51D37]" />
          )}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;
