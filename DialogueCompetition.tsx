import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, User, Send, CheckCircle2, XCircle, RotateCcw, Trophy, Star, ChevronRight } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---

type Player = 'Gor' | 'Gayane';

interface DialogueLine {
  id: number;
  speaker: Player;
  text: string;
  options: string[];
  answer: string;
  translation: string;
}

const DIALOGUE: DialogueLine[] = [
  { 
    id: 1, 
    speaker: 'Gor', 
    text: "Gayane, ¿___ quieres ir al cine conmigo?", 
    options: ["Como", "Cuando", "Cuanto"], 
    answer: "Cuando", 
    translation: "Գայանե, ե՞րբ ես ուզում ինձ հետ կինո գնալ:" 
  },
  { 
    id: 2, 
    speaker: 'Gayane', 
    text: "¡Hola Gor! Yo ___ al cine a las seis.", 
    options: ["vengo", "voy", "vas"], 
    answer: "voy", 
    translation: "Ողջույն Գոռ: Ես կինո եմ գնում ժամը վեցին:" 
  },
  { 
    id: 3, 
    speaker: 'Gor', 
    text: "Perfecto. ¿___ a mi casa antes de salir?", 
    options: ["Vienes", "Vas", "Vengo"], 
    answer: "Vienes", 
    translation: "Հիանալի է: Գալի՞ս ես իմ տուն դուրս գալուց առաջ:" 
  },
  { 
    id: 4, 
    speaker: 'Gayane', 
    text: "Sí, ___ de la universidad a las cinco.", 
    options: ["vas", "vengo", "va"], 
    answer: "vengo", 
    translation: "Այո, համալսարանից գալիս եմ (դուրս եմ գալիս) հինգին:" 
  },
  { 
    id: 5, 
    speaker: 'Gor', 
    text: "¿___ tiempo tenemos antes de la película?", 
    options: ["Donde", "Cuando", "Cuanto"], 
    answer: "Cuanto", 
    translation: "Որքա՞ն ժամանակ ունենք մինչև ֆիլմի սկսվելը:" 
  },
  { 
    id: 6, 
    speaker: 'Gayane', 
    text: "Una hora. ¿___ vas a estar listo?", 
    options: ["Cuando", "Cuanto", "Vienes"], 
    answer: "Cuando", 
    translation: "Մեկ ժամ: Ե՞րբ պատրաստ կլինես:" 
  },
  { 
    id: 7, 
    speaker: 'Gor', 
    text: "A las cinco y media. Nosotros ___ juntos en autobús.", 
    options: ["venimos", "vamos", "van"], 
    answer: "vamos", 
    translation: "Հինգն անց կեսին: Մենք միասին կգնանք ավտոբուսով:" 
  },
  { 
    id: 8, 
    speaker: 'Gayane', 
    text: "¿___ personas más vienen con nosotros?", 
    options: ["Cuantos", "Quien", "Cuantas"], 
    answer: "Cuantas", 
    translation: "Էլ քանի՞ հոգի են գալիս մեզ հետ:" 
  },
  { 
    id: 9, 
    speaker: 'Gor', 
    text: "Tres amigos más. Ellos ___ directamente al cine.", 
    options: ["vienen", "van", "vengo"], 
    answer: "van", 
    translation: "Եվս երեք ընկեր: Նրանք ուղղակիորեն կինոթատրոն կգնան:" 
  },
  { 
    id: 10, 
    speaker: 'Gayane', 
    text: "¡Genial! ¿___ cuesta la entrada hoy?", 
    options: ["Cuando", "Cuanto", "Cuanta"], 
    answer: "Cuanto", 
    translation: "Հիանալի է: Որքա՞ն արժե տոմսն այսօր:" 
  },
];

// --- Components ---

export default function DialogueCompetition() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('Gor');
  const [history, setHistory] = useState<(DialogueLine & { userInput?: string, isCorrect?: boolean })[]>([]);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [scores, setScores] = useState({ Gor: 0, Gayane: 0 });
  const [isFinished, setIsFinished] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, feedback]);

  const handleAnswer = (option: string) => {
    const line = DIALOGUE[currentStep];
    const isCorrect = option === line.answer;

    if (isCorrect) {
      setFeedback('correct');
      setScores(prev => ({ ...prev, [currentPlayer]: prev[currentPlayer] + 10 }));
      
      setTimeout(() => {
        setHistory(prev => [...prev, { ...line, userInput: option, isCorrect: true }]);
        setFeedback(null);
        
        if (currentStep + 1 < DIALOGUE.length) {
          setCurrentStep(s => s + 1);
          setCurrentPlayer(p => p === 'Gor' ? 'Gayane' : 'Gor');
        } else {
          setIsFinished(true);
          confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        }
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  if (isFinished) {
    const winner = scores.Gor > scores.Gayane ? 'Գոռը' : scores.Gayane > scores.Gor ? 'Գայանեն' : 'Ոչ ոք (Ոչ-ոքի)';
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-8">
        <Trophy size={120} className="text-yellow-400 animate-bounce" />
        <h1 className="text-6xl font-black uppercase italic tracking-tighter text-sky-400 font-sans">
          Երկխոսությունն Ավարտված է!
        </h1>
        <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 space-y-4 min-w-[300px]">
           <p className="text-slate-500 uppercase font-black tracking-widest text-xs">Արդյունքներ</p>
           <div className="flex justify-between items-center gap-12 font-black text-2xl italic tracking-tighter font-sans">
              <div className="text-orange-500">Գոռ: {scores.Gor}</div>
              <div className="text-yellow-500">Գայանե: {scores.Gayane}</div>
           </div>
           <p className="text-xl font-bold mt-4 font-sans italic text-white">{winner} հաղթեց!</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-5 bg-sky-600 rounded-full font-black text-xl uppercase tracking-widest hover:bg-sky-500 transition-all flex items-center gap-2 font-sans"
        >
          <RotateCcw /> Սկսել նորից
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 p-4 md:p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="p-3 bg-sky-500/20 rounded-2xl text-sky-400">
                <MessageSquare className="w-6 h-6" />
             </div>
             <div>
                <h1 className="text-xl font-black uppercase italic tracking-tighter">Իսպաներեն Երկխոսություն</h1>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Gor vs Gayane</p>
             </div>
          </div>
          <div className="flex gap-4">
             <div className="bg-orange-500/20 px-4 py-2 rounded-xl border border-orange-500/30 font-black text-orange-500 text-sm">
                Գոռ: {scores.Gor}
             </div>
             <div className="bg-yellow-500/20 px-4 py-2 rounded-xl border border-yellow-500/30 font-black text-yellow-500 text-sm">
                Գայանե: {scores.Gayane}
             </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 pt-32 pb-80 md:pb-96 space-y-6">
        {history.map((line, idx) => (
          <div 
            key={idx} 
            className={`flex flex-col ${line.speaker === 'Gor' ? 'items-start' : 'items-end'} animate-in slide-in-from-bottom-4 duration-500`}
          >
            <div className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${line.speaker === 'Gor' ? 'text-orange-500' : 'text-yellow-500'}`}>
               <User size={12} /> {line.speaker === 'Gor' ? 'Գոռ' : 'Գայանե'}
            </div>
            <div className={`max-w-[80%] p-6 rounded-[2rem] border transition-all ${line.speaker === 'Gor' ? 'bg-slate-900 border-slate-800 rounded-bl-none' : 'bg-sky-900/20 border-sky-800/30 rounded-br-none text-right'}`}>
               <p className="text-xl font-bold tracking-tight mb-2">
                 {line.text.replace('___', line.userInput || '')}
               </p>
               <p className="text-xs text-slate-500 italic">({line.translation})</p>
            </div>
          </div>
        ))}

        {!isFinished && (
          <div className={`flex flex-col ${DIALOGUE[currentStep].speaker === 'Gor' ? 'items-start' : 'items-end'}`}>
            <div className={`flex items-center gap-2 mb-2 text-[10px] font-black uppercase tracking-widest ${DIALOGUE[currentStep].speaker === 'Gor' ? 'text-orange-500' : 'text-yellow-500'}`}>
               <User size={12} /> {DIALOGUE[currentStep].speaker === 'Gor' ? 'Գոռ (Քո հերթն է)' : 'Գայանե (Քո հերթն է)'}
            </div>
            <div className={`max-w-[80%] p-6 rounded-[2rem] border animate-pulse ${DIALOGUE[currentStep].speaker === 'Gor' ? 'bg-slate-900/50 border-orange-500/50 rounded-bl-none' : 'bg-sky-900/10 border-yellow-500/50 rounded-br-none text-right'}`}>
               <p className="text-2xl font-black italic tracking-tighter">
                 {DIALOGUE[currentStep].text.split('___')[0]}
                 <span className="text-sky-500 underline underline-offset-8 decoration-4 mx-2">___</span>
                 {DIALOGUE[currentStep].text.split('___')[1]}
               </p>
               <p className="text-sm font-bold text-slate-500 mt-4 italic">({DIALOGUE[currentStep].translation})</p>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </main>

      {/* Input Area */}
      {!isFinished && (
        <div className="fixed bottom-0 w-full z-50 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 p-6 md:p-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center">
               <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Ընտրեք ճիշտ տարբերակը</p>
               <div className="flex flex-wrap justify-center gap-4">
                  {DIALOGUE[currentStep].options.map(opt => (
                    <button
                      key={opt}
                      onClick={() => handleAnswer(opt)}
                      disabled={!!feedback}
                      className={`px-8 py-4 rounded-2xl font-black text-2xl uppercase tracking-tighter border-2 transition-all ${feedback === 'correct' && opt === DIALOGUE[currentStep].answer ? 'bg-emerald-500 border-emerald-400 scale-105' : feedback === 'wrong' && opt !== DIALOGUE[currentStep].answer ? 'opacity-30 border-slate-800' : feedback === 'wrong' && opt === DIALOGUE[currentStep].answer ? 'bg-rose-500 border-rose-400' : 'bg-slate-900 border-slate-700 hover:border-sky-500 hover:scale-105'}`}
                    >
                      {opt}
                    </button>
                  ))}
               </div>
            </div>

            {feedback && (
              <div className={`flex items-center justify-center gap-3 text-xl font-black uppercase italic tracking-tighter animate-in zoom-in duration-300 ${feedback === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {feedback === 'correct' ? <CheckCircle2 /> : <XCircle />}
                {feedback === 'correct' ? 'Ճիշտ է!' : 'Սխալ է, փորձիր նորից:'}
              </div>
            )}
            
            <div className="flex justify-between items-center pt-8 border-t border-slate-800/50">
               <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                  <Star className="w-4 h-4 text-sky-500" />
                  Քայլ {currentStep + 1} / {DIALOGUE.length}
               </div>
               <div className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <ChevronRight size={16} /> Թեմա: CUANDO vs CUANTO + IR / VENIR
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
