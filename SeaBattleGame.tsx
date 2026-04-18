import React, { useState, useEffect, useCallback } from 'react';
import { Ship, Crosshair, Target, User, Bomb, Anchor, RotateCcw, Swords, CheckCircle2, XCircle, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Constants & Types ---

const GRID_SIZE = 7;
const SHIPS_COUNT = 10;

type Player = 'Gor' | 'Gayane';
type CellStatus = 'empty' | 'ship' | 'hit' | 'miss';

interface Question {
  id: number;
  sentence: string;
  options: string[];
  answer: string;
  translation: string;
}

const QUESTIONS: Question[] = [
  { id: 1, sentence: "Yo ___ a la escuela todos los días.", options: ["voy", "vengo"], answer: "voy", translation: "Ես դպրոց եմ գնում ամեն օր:" },
  { id: 2, sentence: "¿Cuándo ___ a visitarme?", options: ["vas", "vienes"], answer: "vienes", translation: "Ե՞րբ ես գալու ինձ այցելության:" },
  { id: 3, sentence: "Ellos ___ de la biblioteca ahora.", options: ["van", "vienen"], answer: "vienen", translation: "Նրանք գալիս են գրադարանից հիմա:" },
  { id: 4, sentence: "Mañana nosotros ___ a Madrid.", options: ["vamos", "venimos"], answer: "vamos", translation: "Վաղը մենք գնում ենք Մադրիդ:" },
  { id: 5, sentence: "Tú ___ a mi fiesta, ¿verdad?", options: ["vas", "vienes"], answer: "vienes", translation: "Դու գալիս ես իմ խնջույքին, չէ՞:" },
  { id: 6, sentence: "Él ___ al gimnasio por la mañana.", options: ["va", "viene"], answer: "va", translation: "Նա գնում է մարզասրահ առավոտյան:" },
  { id: 7, sentence: "Nosotros ___ de las vacaciones hoy.", options: ["vamos", "venimos"], answer: "venimos", translation: "Մենք գալիս ենք արձակուրդից այսօր:" },
  { id: 8, sentence: "¿___ tú al mercado ahora?", options: ["Vas", "Vienes"], answer: "Vas", translation: "Գնո՞ւմ ես շուկա հիմա:" },
  { id: 9, sentence: "Mis padres ___ a cenar a mi casa.", options: ["van", "vienen"], answer: "vienen", translation: "Ծնողներս գալիս են իմ տուն ընթրելու:" },
  { id: 10, sentence: "Ustedes ___ al teatro esta noche.", options: ["van", "vienen"], answer: "van", translation: "Դուք գնում եք թատրոն այսօր երեկոյան:" },
];

// --- Helper Functions ---

const createEmptyGrid = () => Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill('empty' as CellStatus));

const placeRandomShips = (grid: CellStatus[][]) => {
  const newGrid = grid.map(row => [...row]);
  let placed = 0;
  while (placed < SHIPS_COUNT) {
    const r = Math.floor(Math.random() * GRID_SIZE);
    const c = Math.floor(Math.random() * GRID_SIZE);
    if (newGrid[r][c] === 'empty') {
      newGrid[r][c] = 'ship';
      placed++;
    }
  }
  return newGrid;
};

// --- Components ---

const GridCell = ({ status, onClick, hidden }: { status: CellStatus, onClick: () => void, hidden: boolean }) => {
  const getIcon = () => {
    switch (status) {
      case 'hit': return <Bomb className="text-red-500 animate-bounce" size={24} />;
      case 'miss': return <Crosshair className="text-slate-500" size={24} />;
      case 'ship': return hidden ? null : <Ship className="text-sky-400" size={24} />;
      default: return null;
    }
  };

  const getBg = () => {
    if (status === 'hit') return 'bg-red-500/20';
    if (status === 'miss') return 'bg-slate-800';
    return 'bg-slate-900 hover:bg-slate-800';
  };

  return (
    <button
      onClick={onClick}
      className={`w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-xl border-2 border-slate-700/50 transition-all ${getBg()}`}
    >
      {getIcon()}
    </button>
  );
};

export default function SeaBattleGame() {
  const [gameState, setGameState] = useState<'setup' | 'quiz' | 'battle' | 'won'>('setup');
  const [currentPlayer, setCurrentPlayer] = useState<Player>('Gor');
  const [gorGrid, setGorGrid] = useState<CellStatus[][]>(createEmptyGrid());
  const [gayaneGrid, setGayaneGrid] = useState<CellStatus[][]>(createEmptyGrid());
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [winner, setWinner] = useState<Player | null>(null);

  // Initialize grids
  useEffect(() => {
    setGorGrid(placeRandomShips(createEmptyGrid()));
    setGayaneGrid(placeRandomShips(createEmptyGrid()));
  }, []);

  const startTurn = () => {
    const randomIdx = Math.floor(Math.random() * QUESTIONS.length);
    setCurrentQuestion(QUESTIONS[randomIdx]);
    setFeedback(null);
    setGameState('quiz');
  };

  const nextTurn = () => {
    setCurrentPlayer(p => p === 'Gor' ? 'Gayane' : 'Gor');
    startTurn();
  };

  const handleAnswer = (option: string) => {
    if (option === currentQuestion?.answer) {
      setFeedback('correct');
      setTimeout(() => setGameState('battle'), 1000);
    } else {
      setFeedback('wrong');
      // Give a chance to correct: don't switch turn, just reset feedback after a delay
      setTimeout(() => {
        setFeedback(null);
      }, 1000);
    }
  };

  const handleShot = (r: number, c: number) => {
    if (gameState !== 'battle') return;

    const targetGrid = currentPlayer === 'Gor' ? gayaneGrid : gorGrid;
    const setTargetGrid = currentPlayer === 'Gor' ? setGayaneGrid : setGorGrid;

    if (targetGrid[r][c] === 'hit' || targetGrid[r][c] === 'miss') return;

    const newGrid = targetGrid.map(row => [...row]);
    let hit = false;
    if (newGrid[r][c] === 'ship') {
      newGrid[r][c] = 'hit';
      hit = true;
    } else {
      newGrid[r][c] = 'miss';
    }

    setTargetGrid(newGrid);

    // Check for win
    const remainingShips = newGrid.flat().filter(cell => cell === 'ship').length;
    if (remainingShips === 0) {
      setWinner(currentPlayer);
      setGameState('won');
      confetti({ particleCount: 200, spread: 70, origin: { y: 0.6 } });
      return;
    }

    // Pass turn or stay if hit
    setTimeout(() => {
        if (hit) {
            // New question for same player
            startTurn();
        } else {
            // Next player
            nextTurn();
        }
    }, 1000);
  };

  if (gameState === 'setup') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-12">
        <Swords size={80} className="text-sky-500 animate-pulse" />
        <div className="space-y-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter">Մարտական <span className="text-sky-500">Նավեր</span></h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-lg">Գոռ ընդդեմ Գայանեի</p>
          <div className="flex gap-4 justify-center py-4">
             <div className="px-6 py-2 bg-slate-900 border border-slate-700 rounded-full font-bold">Venir vs Ir</div>
             <div className="px-6 py-2 bg-slate-900 border border-slate-700 rounded-full font-bold">Spanish Class</div>
          </div>
        </div>
        <button 
          onClick={startTurn}
          className="px-12 py-6 bg-sky-600 rounded-full font-black text-2xl uppercase tracking-widest hover:bg-sky-500 transition-all shadow-xl shadow-sky-600/20"
        >
          Սկսել Մարտը
        </button>
      </div>
    );
  }

  if (gameState === 'won') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-white text-center space-y-8">
        <Trophy size={120} className="text-yellow-400 animate-bounce" />
        <h1 className="text-6xl font-black uppercase italic tracking-tighter text-sky-400">{winner} ՀԱՂԹԵՑ!</h1>
        <p className="text-xl font-bold text-slate-400 uppercase tracking-widest">Դուք գերազանց տիրապետում եք IR և VENIR բայերին</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-10 py-5 bg-slate-800 rounded-full font-black text-xl uppercase tracking-widest border border-slate-700 hover:bg-slate-700 transition-all flex items-center gap-2"
        >
          <RotateCcw className="w-6 h-6" /> Խաղալ նորից
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 md:p-8 font-sans transition-colors duration-500">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Status Header */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/50 p-6 rounded-[2rem] border border-slate-800">
          <div className="flex items-center gap-6">
             <div className={`p-4 rounded-2xl transition-all ${currentPlayer === 'Gor' ? 'bg-sky-500 shadow-lg shadow-sky-500/20' : 'bg-slate-800 opacity-50'}`}>
                <User />
             </div>
             <div>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Հերթը</p>
                <h2 className="text-3xl font-black italic uppercase tracking-tighter">{currentPlayer === 'Gor' ? 'Գոռ' : 'Գայանե'}</h2>
             </div>
          </div>

          <div className="mt-4 md:mt-0 px-8 py-3 bg-slate-800 rounded-full border border-slate-700 font-black text-slate-400 uppercase tracking-widest text-sm">
             {gameState === 'quiz' ? 'Հարցի Փուլ' : 'Կրակի Փուլ'}
          </div>

          <div className="hidden md:flex items-center gap-6 text-right">
             <div className={`p-4 rounded-2xl transition-all ${currentPlayer === 'Gayane' ? 'bg-sky-500 shadow-lg shadow-sky-500/20' : 'bg-slate-800 opacity-50'}`}>
                <User />
             </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar / Own Ships */}
          <div className="lg:col-span-3 space-y-6">
             <div className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-6 text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ձեր նավատորմը</p>
                <div className="grid grid-cols-7 gap-1 justify-center max-w-[180px] mx-auto">
                    {(currentPlayer === 'Gor' ? gorGrid : gayaneGrid).map((row, r) => (
                        row.map((cell, c) => (
                            <div key={`own-${r}-${c}`} className={`w-5 h-5 border border-white/5 rounded flex items-center justify-center ${cell === 'hit' ? 'bg-red-500/20' : cell === 'miss' ? 'bg-slate-800' : 'bg-slate-900'}`}>
                                {cell === 'hit' && <Bomb size={10} className="text-red-500" />}
                            </div>
                        ))
                    ))}
                </div>
                <div className="pt-4 border-t border-white/5">
                   <p className="text-[10px] font-bold text-slate-500 uppercase italic">Մնացած նավեր: {(currentPlayer === 'Gor' ? gorGrid : gayaneGrid).flat().filter(c => c === 'ship').length}</p>
                </div>
             </div>
          </div>

          {/* Quiz Section */}
          <div className={`lg:col-span-4 space-y-6 transition-all duration-500 ${gameState === 'battle' ? 'opacity-30 pointer-events-none grayscale' : ''}`}>
             <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 md:p-12 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-sky-500/50" />
                <div className="space-y-4">
                   <p className="text-xs font-black uppercase tracking-[0.4em] text-slate-500">Իսպաներեն Հարց</p>
                   {currentQuestion && (
                     <div className="space-y-6">
                        <h3 className="text-3xl md:text-5xl font-black italic tracking-tighter leading-tight">
                           {currentQuestion.sentence.split('___')[0]}
                           <span className="text-sky-500 underline decoration-2 underline-offset-8">___</span>
                           {currentQuestion.sentence.split('___')[1]}
                        </h3>
                        <p className="text-xl font-bold text-slate-400 italic">({currentQuestion.translation})</p>
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                   {currentQuestion?.options.map(opt => (
                     <button
                       key={opt}
                       onClick={() => handleAnswer(opt)}
                       disabled={!!feedback}
                       className={`py-6 rounded-3xl font-black text-3xl uppercase tracking-tighter border-2 transition-all ${feedback === 'correct' && opt === currentQuestion.answer ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700 hover:border-sky-500'}`}
                     >
                       {opt}
                     </button>
                   ))}
                </div>

                <div className="flex flex-col items-center gap-4">
                  {feedback && (
                    <div className={`flex items-center justify-center gap-3 text-2xl font-black uppercase italic tracking-tighter transition-all ${feedback === 'correct' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {feedback === 'correct' ? <CheckCircle2 /> : <XCircle />}
                      {feedback === 'correct' ? 'Ճիշտ է! Կրա՛կ:' : 'Սխալ է: Փորձիր նորից:'}
                    </div>
                  )}
                  
                  {!feedback && (
                    <button 
                      onClick={nextTurn}
                      className="text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-sky-500 transition-colors"
                    >
                      Փոխել խաղացողին (Skip)
                    </button>
                  )}
                </div>
             </div>
          </div>

          {/* Battle Section */}
          <div className="lg:col-span-5 space-y-8">
             <div className="flex justify-center flex-col items-center gap-6">
                <div className="text-center">
                    <p className="text-lg font-black uppercase tracking-[0.3em] text-sky-500">Ընտրեք թիրախը</p>
                    {gameState === 'quiz' && (
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 animate-pulse">
                           Պատասխանեք հարցին կրակելու համար
                        </p>
                    )}
                </div>
                <div className={`p-4 bg-slate-900 border-2 border-slate-800 rounded-[2.5rem] shadow-2xl relative transition-all duration-500 ${gameState === 'quiz' ? 'opacity-30 pointer-events-none' : 'scale-105 border-sky-500/50'}`}>
                   <div className="absolute inset-0 pointer-events-none border border-sky-500/10 rounded-[2.5rem]" />
                   <div className="grid grid-cols-7 gap-2 md:gap-3">
                      {(currentPlayer === 'Gor' ? gayaneGrid : gorGrid).map((row, r) => (
                        row.map((cell, c) => (
                          <GridCell 
                            key={`${r}-${c}`}
                            status={cell}
                            onClick={() => handleShot(r, c)}
                            hidden={true}
                          />
                        ))
                      ))}
                   </div>
                </div>
                <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-slate-500">
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-sm" /> Հարված</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-500 rounded-sm" /> Վրիպում</div>
                   <div className="flex items-center gap-2"><div className="w-3 h-3 bg-sky-500 rounded-sm" /> Նավ</div>
                </div>
             </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="bg-slate-900/30 p-8 rounded-[3rem] border border-slate-800/50 grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="space-y-2">
              <div className="flex items-center gap-2 text-sky-400 font-black text-sm uppercase"><Anchor size={16}/> IR (Գնալ)</div>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">Օգտագործվում է, երբ շարժվում ենք դեպի այլ վայր (հեռու խոսողից):</p>
           </div>
           <div className="flex items-center justify-center">
              <Swords className="text-slate-700" size={40} />
           </div>
           <div className="space-y-2 md:text-right">
              <div className="flex items-center md:justify-end gap-2 text-emerald-400 font-black text-sm uppercase">VENIR (Գալ) <Anchor size={16}/></div>
              <p className="text-xs text-slate-500 leading-relaxed font-bold">Օգտագործվում է, երբ շարժվում ենք դեպի խոսողը կամ լսողի գտնվելու վայրը:</p>
           </div>
        </div>

      </div>
    </div>
  );
}
