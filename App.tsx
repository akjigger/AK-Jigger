
import React, { useState } from 'react';
import Welcome from './components/Welcome';
import Mixer from './components/Mixer';
import Game from './components/Game';
import Oracle from './components/Oracle';
import Waitlist from './components/Waitlist';
import Navigation from './components/Navigation';
import SauceQuiz from './components/SauceQuiz';
import WingFlip from './components/WingFlip';
import VinylRhythm from './components/VinylRhythm';
import Leaderboard from './components/Leaderboard';
import Logo from './components/Logo';
import { AppState } from './types';

type SobrietyLevel = 'sober' | 'tipsy' | 'drunk';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppState>('welcome');
  const [sobriety, setSobriety] = useState<SobrietyLevel>('sober');
  const [playerName, setPlayerName] = useState('');

  const toggleSobriety = () => {
    setSobriety(prev => {
      if (prev === 'sober') return 'tipsy';
      if (prev === 'tipsy') return 'drunk';
      return 'sober';
    });
  };

  const getSobrietyClass = () => {
    if (sobriety === 'drunk') return 'drunk-mode';
    if (sobriety === 'tipsy') return 'tipsy-mode';
    return '';
  };

  const renderView = () => {
    switch (currentView) {
      case 'welcome':
        return <Welcome onStart={(name) => {
          setPlayerName(name);
          setCurrentView('waitlist');
        }} />;
      case 'mixer':
        return <Mixer />;
      case 'game':
        return <Game playerName={playerName} />;
      case 'oracle':
        return <Oracle />;
      case 'quiz':
        return <SauceQuiz />;
      case 'wingflip':
        return <WingFlip playerName={playerName} />;
      case 'vinyl':
        return <VinylRhythm playerName={playerName} />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'waitlist':
        return <Waitlist setView={setCurrentView} playerName={playerName} />;
      default:
        return <Welcome onStart={(name) => {
          setPlayerName(name);
          setCurrentView('waitlist');
        }} />;
    }
  };

  return (
    <div className={`min-h-screen flex flex-col max-w-md mx-auto bg-slate-950 overflow-hidden relative border-x border-blue-900/20 ${getSobrietyClass()}`}>
      {/* Brand Header */}
      <header className="p-3 flex items-center justify-between border-b border-blue-900/40 bg-slate-950/90 sticky top-0 z-50">
        <button 
          onClick={() => setCurrentView('welcome')}
          className="flex items-center gap-2"
        >
          <Logo className="w-10 h-10" />
          <h1 className="font-bungee text-xl tracking-tighter neon-text-blue text-white">B.O.P</h1>
        </button>
        <div className="flex items-center gap-2">
          {playerName && (
            <div className="text-[8px] font-black text-white/40 uppercase bg-white/5 px-2 py-1 rounded border border-white/10 max-w-[80px] truncate">
              {playerName}
            </div>
          )}
          <button 
            onClick={toggleSobriety}
            className={`text-[9px] px-2 py-1 rounded border font-black transition-all uppercase tracking-tighter flex items-center gap-1.5 ${
              sobriety === 'drunk' 
                ? 'bg-[#E51D37] border-[#E51D37] text-white shadow-lg' 
                : sobriety === 'tipsy'
                  ? 'bg-orange-500 border-orange-500 text-white shadow-md'
                  : 'bg-blue-900/10 border-blue-800/40 text-blue-400'
            }`}
          >
            <span className="text-[10px]">
              {sobriety === 'sober' ? '🍺' : sobriety === 'tipsy' ? '🍹' : '😵'}
            </span>
            {sobriety.toUpperCase()}
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-y-auto pb-24 scroll-smooth">
        {renderView()}
      </main>

      {currentView !== 'welcome' && (
        <Navigation currentView={currentView} setView={setCurrentView} />
      )}
    </div>
  );
};

export default App;
