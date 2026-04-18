import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Timer, Users, ChevronRight, User, RotateCcw, AlertCircle, CheckCircle2, Flag } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types & Constants ---

type Player = 'Gor' | 'Gayane';

interface Question {
  id: number;
  sentence: string;
  options: string[];
  answer: string;
  translation: string;
}

const RACE_LENGTH = 10;

const QUESTIONS: Question[] = [
  { id: 1, sentence: "¿___ años tienes?", options: ["Cuanto", "Cuantos", "Cuando"], answer: "Cuantos", translation: "Քանի՞ տարեկան ես:" },
  { id: 2, sentence: "¿___ vas a venir?", options: ["Cuando", "Cuanta", "Cuanto"], answer: "Cuando", translation: "Ե՞րբ ես գալու:" },
  { id: 3, sentence: "¿___ dinero necesitas?", options: ["Cuanta", "Cuanto", "Cuantos"], answer: "Cuanto", translation: "Որքա՞ն գումար է քեզ պետք:" },
  { id: 4, sentence: "¿___ personas hay?", options: ["Cuantas", "Cuanto", "Cuando"], answer: "Cuantas", translation: "Քանի՞ հոգի կան:" },
  { id: 5, sentence: "¿___ es tu cumpleaños?", options: ["Cuantos", "Cuando", "Cuanta"], answer: "Cuando", translation: "Ե՞րբ է քո ծննդյան օրը:" },
  { id: 6, sentence: "¿___ agua bebes?", options: ["Cuanta", "Cuanto", "Cuantas"], answer: "Cuanta", translation: "Որքա՞ն ջուր ես խմում:" },
  { id: 7, sentence: "¿___ cuesta este pan?", options: ["Cuanto", "Cuando", "Cuantos"], answer: "Cuanto", translation: "Որքա՞ն արժե այս հացը:" },
  { id: 8, sentence: "¿___ chicas corren?", options: ["Cuantos", "Cuantas", "Cuando"], answer: "Cuantas", translation: "Քանի՞ աղջիկ են վազում:" },
  { id: 9, sentence: "¿___ termina la carrera?", options: ["Cuando", "Cuanto", "Cuanta"], answer: "Cuando", translation: "Ե՞րբ է ավարտվում վազքը:" },
  { id: 10, sentence: "¿___ tiempo tenemos?", options: ["Cuanto", "Cuanta", "Cuando"], answer: "Cuanto", translation: "Որքա՞ն ժամանակ ունենք:" },
  { id: 11, sentence: "¿___ libros lees?", options: ["Cuantos", "Cuanto", "Cuando"], answer: "Cuantos", translation: "Քանի՞ գիրք ես կարդում:" },
  { id: 12, sentence: "¿___ sale el tren?", options: ["Cuanta", "Cuando", "Cuanto"], answer: "Cuando", translation: "Ե՞րբ է դուրս գալիս գնացքը:" },
  { id: 13, sentence: "¿___ leche hay?", options: ["Cuanta", "Cuanto", "Cuantas"], answer: "Cuanta", translation: "Որքա՞ն կաթ կա:" },
  { id: 14, sentence: "¿___ llegas a casa?", options: ["Cuando", "Cuanto", "Cuantos"], answer: "Cuando", translation: "Ե՞րբ ես տուն հասնում:" },
  { id: 15, sentence: "¿___ sillas faltan?", options: ["Cuantas", "Cuanto", "Cuantos"], answer: "Cuantas", translation: "Քանի՞ աթոռ է պակասում:" },
];

// --- Sub-components ---

const PlayerAvatar = ({ name, active, side }: { name: Player, active: boolean, side: 'left' | 'right' }) => (
  <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${active ? 'scale-110' : 'opacity-40 grayscale'}`}>
    <div className={`w-16 h-16 rounded-3xl flex items-center justify-center border-4 ${active ? 'bg-orange-500 border-orange-300 shadow-lg shadow-orange-500/30' : 'bg-slate-800 border-slate-700'}`}>
       <User size={32} className="text-white" />
    </div>
    <span className={`font-black uppercase tracking-widest text-xs ${active ? 'text-orange-400' : 'text-slate-500'}`}>{name === 'Gor' ? 'Գոռ' : 'Գայանե'}</span>
  </div>
);

const ProgressBar = ({ progress, color }: { progress: number, color: string }) => (
  <div className="w-full h-8 bg-slate-900 rounded-full border-2 border-slate-800 p-1 relative overflow-hidden">
     <div 
       className={`h-full rounded-full transition-all duration-1000 ease-out flex items-center justify-end px-2 ${color}`}
       style={{ width: `${(progress / RACE_LENGTH) * 100}%` }}
     >
        {progress > 0 && <span className="text-[10px] font-black">{progress}</span>}
     </div>
  </div>
);

// --- Main Application ---

export default function CuandoCuantoQuest() {
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'won'>('lobby');
  const [scores, setScores] = useState({ Gor: 0, Gayane: 0 });
  const [currentPlayer, setCurrentPlayer] = useState<Player>('Gor');
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong', message: string } | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  const startTurn = () => {
    const randomIdx = Math.floor(Math.random() * QUESTIONS.length);
    setCurrentQuestion(QUESTIONS[randomIdx]);
    setFeedback(null);
  };

  const handleStart = () => {
    setGameState('playing');
    startTurn();
  };

  const handleAnswer = (option: string) => {
    if (gameState !== 'playing' || feedback) return;

    if (option === currentQuestion?.answer) {
      setFeedback({ type: 'correct', message: 'Ճիշտ է! Մեկ քայլ առաջ:' });
      setScores(prev => {
        const newScore = prev[currentPlayer] + 1;
        const newScores = { ...prev, [currentPlayer]: newScore };
        
        if (newScore >= RACE_LENGTH) {
          setTimeout(() => {
            setWinner(currentPlayer);
            setGameState('won');
            confetti({
              particleCount: 300,
              spread: 120,
              origin: { y: 0.6 }
            });
          }, 1000);
        }
        return newScores;
      });

      // Switch turn after success
      setTimeout(() => {
        if (scores[currentPlayer] + 1 < RACE_LENGTH) {
           setCurrentPlayer(p => p === 'Gor' ? 'Gayane' : 'Gor');
           startTurn();
        }
      }, 1500);
    } else {
      setFeedback({ type: 'wrong', message: `Սխալ է: Ճիշտ պատասխանն է՝ ${currentQuestion?.answer}` });
      // Switch turn after failure
      setTimeout(() => {
        setCurrentPlayer(p => p === 'Gor' ? 'Gayane' : 'Gor');
        startTurn();
      }, 2000);
    }
  };

  if (gameState === 'lobby') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-12 overflow-hidden relative">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-orange-500 via-yellow-500 to-orange-500 animate-pulse" />
        
        <div className="relative">
           <Trophy size={120} className="text-yellow-400 mx-auto animate-bounce mb-6" />
           <Flag className="absolute -top-4 -right-8 text-orange-500 rotate-12" size={48} />
        </div>

        <div className="space-y-4">
          <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter leading-none">
            Գավաթի <span className="text-orange-500">Որոնում</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] text-lg">Գոռ և Գայանե: Սպորտային Մրցույթ</p>
        </div>

        <div className="flex gap-4 md:gap-8 justify-center">
            <div className="px-8 py-3 bg-slate-900 border border-slate-700 rounded-2xl font-black text-orange-400 uppercase tracking-widest text-sm shadow-xl">CUANDO</div>
            <div className="px-8 py-3 bg-slate-900 border border-slate-700 rounded-2xl font-black text-yellow-400 uppercase tracking-widest text-sm shadow-xl">CUANTO</div>
        </div>

        <button 
          onClick={handleStart}
          className="group relative px-16 py-8 bg-orange-600 rounded-[2rem] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-orange-600/20"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <span className="relative z-10 font-black text-3xl uppercase tracking-widest">Սկսել Մրցավազքը</span>
        </button>

        <div className="grid grid-cols-2 gap-12 pt-8">
           <div className="space-y-2 opacity-50">
              <User className="mx-auto" size={40} />
              <p className="font-black uppercase tracking-widest text-xs">Գոռ</p>
           </div>
           <div className="space-y-2 opacity-50">
              <User className="mx-auto" size={40} />
              <p className="font-black uppercase tracking-widest text-xs">Գայանե</p>
           </div>
        </div>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-12">
        <div className="relative">
           <Trophy size={160} className="text-yellow-400 mx-auto animate-pulse" />
           <div className="absolute top-0 w-full h-full animate-ping bg-yellow-400 opacity-20 rounded-full" />
        </div>
        
        <div className="space-y-4">
           <h1 className="text-6xl md:text-8xl font-black uppercase italic tracking-tighter">
             {winner === 'Gor' ? 'ԳՈՌԸ' : 'ԳԱՅԱՆԵՆ'} <span className="text-orange-500">ՀԱՂԹԵՑ</span>!
           </h1>
           <p className="text-2xl font-bold uppercase tracking-widest text-slate-400">Ոսկե Գավաթը քոնն է</p>
        </div>

        <button 
          onClick={() => window.location.reload()}
          className="flex items-center gap-4 px-12 py-6 bg-slate-900 border-2 border-slate-800 rounded-full font-black text-2xl uppercase tracking-widest hover:bg-slate-800 transition-all"
        >
          <RotateCcw /> Նորից խաղալ
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 flex flex-col items-center">
       <div className="max-w-5xl w-full space-y-8">
          
          {/* Dashboard */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-8 flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-5">
                <Timer size={100} />
             </div>

             <PlayerAvatar name="Gor" active={currentPlayer === 'Gor'} side="left" />

             <div className="flex-1 w-full max-w-md space-y-4">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 italic">
                   <span>Մեկնարկ</span>
                   <span className="text-orange-500">Վերջնագիծ</span>
                </div>
                <div className="space-y-3">
                   <ProgressBar progress={scores.Gor} color="bg-orange-500" />
                   <ProgressBar progress={scores.Gayane} color="bg-yellow-500" />
                </div>
             </div>

             <PlayerAvatar name="Gayane" active={currentPlayer === 'Gayane'} side="right" />
          </div>

          {/* Question Card */}
          <div className="bg-white/5 border border-white/10 rounded-[4rem] p-8 md:p-16 text-center space-y-12 relative overflow-hidden backdrop-blur-sm">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
             
             <div className="space-y-4">
                <div className="inline-flex items-center gap-3 px-6 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full font-black text-orange-500 uppercase tracking-widest text-xs">
                   <Medal size={16} /> Փուլ {scores.Gor + scores.Gayane + 1}
                </div>
                {currentQuestion && (
                   <div className="space-y-8">
                      <h2 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-tight max-w-3xl mx-auto">
                        {currentQuestion.sentence.split('___')[0]}
                        <span className="text-orange-500 underline decoration-4 underline-offset-8 decoration-orange-500/30">
                          {feedback?.type === 'correct' ? currentQuestion.answer : '___'}
                        </span>
                        {currentQuestion.sentence.split('___')[1]}
                      </h2>
                      <p className="text-2xl font-bold italic text-slate-400">({currentQuestion.translation})</p>
                   </div>
                )}
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {['Cuando', 'Cuanto', 'Cuanta', 'Cuantos', 'Cuantas'].map((opt) => (
                   <button
                     key={opt}
                     onClick={() => handleAnswer(opt)}
                     disabled={!!feedback}
                     className={`py-5 rounded-3xl font-black text-xl uppercase tracking-tighter transition-all border-4 relative group ${
                       feedback?.type === 'correct' && opt === currentQuestion?.answer 
                       ? 'bg-emerald-500 border-emerald-300' 
                       : feedback?.type === 'wrong' && opt === currentQuestion?.answer
                       ? 'bg-slate-800 border-orange-500'
                       : feedback?.type === 'wrong' && opt !== currentQuestion?.answer
                       ? 'bg-rose-500/20 border-rose-500/20 opacity-50'
                       : 'bg-slate-900 border-slate-800 hover:border-orange-500 hover:scale-105 active:scale-95'
                     }`}
                   >
                     {opt}
                   </button>
                ))}
             </div>

             {/* Feedback Overlay */}
             {feedback && (
               <div className={`flex items-center justify-center gap-3 text-2xl font-black uppercase italic tracking-tighter animate-in fade-in zoom-in duration-300 ${feedback.type === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {feedback.type === 'correct' ? <CheckCircle2 size={32} /> : <AlertCircle size={32} />}
                  {feedback.message}
               </div>
             )}
          </div>

          {/* Grammar Reminder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] space-y-4">
                <div className="flex items-center gap-3 text-orange-400 font-black uppercase tracking-widest text-sm">
                   <ChevronRight /> CUANDO
                </div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed italic uppercase">Օգտագործվում է ժամանակը հարցնելիս: Նշանակում է՝ «Ե՞րբ»:</p>
             </div>
             <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] space-y-4">
                <div className="flex items-center gap-3 text-yellow-400 font-black uppercase tracking-widest text-sm">
                   <ChevronRight /> CUANTO / -A / -S
                </div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed italic uppercase">Օգտագործվում է քանակը հարցնելիս: Համաձայնեցվում է գոյականի սեռի և թվի հետ:</p>
             </div>
          </div>

       </div>
    </div>
  );
}
