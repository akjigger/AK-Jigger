
import React, { useState, useRef, useEffect } from 'react';
import { getChickenWisdom } from '../services/geminiService';

interface Message {
  text: string;
  sender: 'user' | 'sensei';
}

const Oracle: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { text: "Bawk bawk! I am the Great Chicken Sensei. What weighs on your mind while you wait for the deep fryer?", sender: 'sensei' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input;
    setInput('');
    setMessages(prev => [...prev, { text: userText, sender: 'user' }]);
    setLoading(true);

    try {
      const response = await getChickenWisdom(userText);
      setMessages(prev => [...prev, { text: response || "The fryer is calling me, ask later!", sender: 'sensei' }]);
    } catch (error) {
      setMessages(prev => [...prev, { text: "Technical errors are like burnt wings—best avoided. Ask again!", sender: 'sensei' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full animate-fade-in bg-slate-950">
      <div className="p-6 pb-2 border-b border-blue-900/30">
        <h3 className="font-bungee text-red-600 text-xl tracking-tighter">CHICKEN SENSEI</h3>
        <p className="text-blue-500 text-[10px] font-bold uppercase tracking-widest">Philosophy of the Fryer</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${
              m.sender === 'user' 
                ? 'bg-blue-600 text-white rounded-tr-none font-medium shadow-lg' 
                : 'bg-slate-900 text-blue-100 border border-blue-900/30 rounded-tl-none'
            }`}>
              {m.sender === 'sensei' && <span className="block text-[10px] font-bold text-red-500 uppercase mb-1 tracking-widest">The Sensei</span>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-900 text-blue-400 p-4 rounded-3xl rounded-tl-none italic text-xs animate-pulse border border-blue-900/20">
              Sensei is deep-thinking...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-950 border-t border-blue-900/30 flex gap-2">
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Seek wing wisdom..."
          className="flex-1 bg-slate-900 border border-blue-900/30 rounded-2xl px-5 py-4 text-white placeholder:text-blue-900 focus:outline-none focus:border-red-600/50 text-sm"
        />
        <button 
          type="submit"
          className="bg-red-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-2xl hover:bg-red-500 active:scale-95 transition-all shadow-lg border-b-4 border-red-900 active:border-b-0"
        >
          🍗
        </button>
      </form>
    </div>
  );
};

export default Oracle;
