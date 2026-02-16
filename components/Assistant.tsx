
import React, { useState, useRef, useEffect } from 'react';
import { 
  chatWithAssistant, 
  analyzeRounds, 
  speakText 
} from '../services/geminiService';
import { TracerRound, ChatMessage } from '../types';
import { 
  Send, 
  Sparkles, 
  Volume2, 
  User, 
  Bot, 
  Loader2,
  BrainCircuit,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface AssistantProps {
  rounds: TracerRound[];
  lang: 'en' | 'th';
}

const Assistant: React.FC<AssistantProps> = ({ rounds, lang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await chatWithAssistant(messages, input);
      setMessages(prev => [...prev, { role: 'model', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', content: "Error connecting to AI." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (rounds.length === 0 || isAnalyzing) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeRounds(rounds);
      setAnalysis(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`grid grid-cols-1 ${isExpanded ? '' : 'lg:grid-cols-3'} gap-6`}>
      <div className={`${isExpanded ? 'hidden' : 'lg:col-span-1'} bg-white rounded-xl shadow-lg border border-indigo-100 flex flex-col h-[600px]`}>
        <div className="p-4 bg-indigo-600 rounded-t-xl text-white flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><BrainCircuit size={18} /> {lang === 'en' ? 'Deep Insights' : 'ข้อมูลเชิงลึก'}</h3>
          <button onClick={handleAnalyze} disabled={isAnalyzing || rounds.length === 0} className="bg-indigo-500 p-1 rounded">
            {isAnalyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
          </button>
        </div>
        <div className="p-4 flex-1 overflow-y-auto bg-indigo-50/30">
          {analysis ? <div className="whitespace-pre-wrap text-sm text-slate-700">{analysis}</div> : 
          <div className="text-center text-slate-400 p-10 text-xs">{lang === 'en' ? 'Click spark icon for analysis.' : 'คลิกไอคอนประกายไฟเพื่อเริ่มวิเคราะห์'}</div>}
        </div>
      </div>

      <div className={`${isExpanded ? '' : 'lg:col-span-2'} bg-white rounded-xl shadow-lg border border-indigo-100 flex flex-col h-[600px]`}>
        <div className="p-4 bg-slate-800 rounded-t-xl text-white flex justify-between items-center">
          <div className="flex items-center gap-2"><Bot size={20} /><h3 className="font-bold">{lang === 'en' ? 'Assistant' : 'ผู้ช่วยอัจฉริยะ'}</h3></div>
          <button onClick={() => setIsExpanded(!isExpanded)}>{isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
        </div>
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-3 rounded-2xl max-w-[80%] text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border text-slate-800'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="..." className="flex-1 p-2 bg-slate-100 rounded-lg outline-none" />
          <button onClick={handleSend} disabled={isLoading || !input.trim()} className="p-2 bg-indigo-600 text-white rounded-lg"><Send size={18} /></button>
        </div>
      </div>
    </div>
  );
};

export default Assistant;
