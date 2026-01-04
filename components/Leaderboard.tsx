
import React from 'react';
import { getLeaderboard, GameId } from '../services/scoreService';

const Leaderboard: React.FC = () => {
  const games: { id: GameId; label: string; icon: string; color: string }[] = [
    { id: 'shot-drop', label: 'Bokbunja POP', icon: '🍷', color: '#E51D37' },
    { id: 'wing-catcher', label: 'Wing Catcher', icon: '🍗', color: '#2B3890' },
    { id: 'vinyl-scratch', label: 'Vinyl Scratch', icon: '💿', color: '#8b5cf6' },
  ];

  return (
    <div className="p-6 animate-fade-in space-y-8">
      <div className="text-center mb-8">
        <h3 className="font-bungee text-[#E51D37] text-3xl tracking-tighter neon-text-red">HALL OF FAME</h3>
        <p className="text-blue-400 text-[10px] font-black uppercase tracking-[0.4em]">B.O.P Legends Only</p>
      </div>

      <div className="space-y-10">
        {games.map((game) => {
          const scores = getLeaderboard(game.id);
          return (
            <div key={game.id} className="relative">
              <div className="flex items-center gap-3 mb-4 px-2">
                <span className="text-2xl">{game.icon}</span>
                <h4 className="font-bungee text-white text-lg tracking-tight uppercase">{game.label}</h4>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <div className="bg-slate-900/50 rounded-3xl border border-white/5 overflow-hidden shadow-2xl">
                {scores.length > 0 ? (
                  <table className="w-full text-left">
                    <thead>
                      <tr className="bg-white/5 text-[9px] font-black uppercase text-blue-500 tracking-widest">
                        <th className="px-6 py-3">Rank</th>
                        <th className="px-4 py-3">Player</th>
                        <th className="px-6 py-3 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {scores.map((s, idx) => (
                        <tr key={idx} className="group hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 font-bungee text-[11px] text-white/40">
                            {idx === 0 ? '🏆' : `#${idx + 1}`}
                          </td>
                          <td className="px-4 py-4">
                            <p className="text-sm font-bold text-white tracking-tight">{s.playerName}</p>
                            <p className="text-[8px] text-white/20 uppercase tracking-widest">{s.date}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span 
                              className="font-bungee text-xl" 
                              style={{ color: idx === 0 ? game.color : 'white' }}
                            >
                              {s.score}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-10 text-center opacity-30">
                    <p className="text-[10px] font-black uppercase tracking-widest">No records yet...</p>
                    <p className="text-[8px] mt-1">Be the first to claim the throne!</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-10 pb-6 text-center">
        <p className="text-[8px] text-blue-900 font-bold uppercase tracking-[0.5em] animate-pulse">
          Keep Playing • Stay Pony
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
