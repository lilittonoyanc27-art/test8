import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Mic, Square, Play, Star, RotateCcw, AlertCircle, CheckCircle2, Trophy, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// --- Types ---
interface WordTask {
  id: number;
  word: string;
  type: 'single' | 'double';
  armTranslation: string;
}

const TASKS: WordTask[] = [
  { id: 1, word: 'Rosa', type: 'double', armTranslation: 'Վարդ' },
  { id: 2, word: 'Pero', type: 'single', armTranslation: 'Բայց' },
  { id: 3, word: 'Perro', type: 'double', armTranslation: 'Շուն' },
  { id: 4, word: 'Rojo', type: 'double', armTranslation: 'Կարմիր' },
  { id: 5, word: 'Caro', type: 'single', armTranslation: 'Թանկ' },
  { id: 6, word: 'Carro', type: 'double', armTranslation: 'Մեքենա' },
  { id: 7, word: 'Guitarra', type: 'double', armTranslation: 'Կիթառ' },
  { id: 8, word: 'Rápido', type: 'double', armTranslation: 'Արագ' },
  { id: 9, word: 'Pera', type: 'single', armTranslation: 'Տանձ' },
  { id: 10, word: 'Correr', type: 'double', armTranslation: 'Վազել' },
];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// --- Component ---

export default function PronunciationQuest() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<{ score: number; text: string; success: boolean } | null>(null);
  const [score, setScore] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isFinished, setIsFinished] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentTask = TASKS[currentIndex];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        analyzeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setFeedback(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Խնդրում ենք թույլատրել միկրոֆոնի օգտագործումը բրաուզերի կարգավորումներում:");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const analyzeAudio = async (blob: Blob) => {
    setIsAnalyzing(true);
    try {
      const base64Audio = await blobToBase64(blob);

      const prompt = `Analyze the pronunciation of the Spanish word "${currentTask.word}". 
      In Spanish, "r" is either a single tap [ɾ] or an alveolar trill [r].
      This word has a ${currentTask.type === 'double' ? 'trilled (strong) RR or initial R' : 'single tap (soft) R'}.
      Evaluate the audio:
      1. Correct word?
      2. Accurate "R" pronunciation for this word?
      Return JSON:
      {
        "score": number (0-100),
        "success": boolean (true if score > 75),
        "text": "feedback in Armenian explaining the R pronunciation"
      }`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: "audio/webm",
                  data: base64Audio,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = response.text || "{}";
      const result = JSON.parse(text);
      setFeedback(result);
      if (result.success) {
        setScore(s => s + (result.score || 0));
      }
    } catch (err) {
      console.error("Analysis error:", err);
      setFeedback({ score: 0, text: "Սխալ տեղի ունեցավ վերլուծության ժամանակ: Փորձեք նորից:", success: false });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  };

  const nextTask = () => {
    if (currentIndex + 1 < TASKS.length) {
      setCurrentIndex(i => i + 1);
      setFeedback(null);
      setAudioUrl(null);
    } else {
      setIsFinished(true);
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.6 }
      });
    }
  };

  const restartGame = () => {
    setCurrentIndex(0);
    setScore(0);
    setFeedback(null);
    setAudioUrl(null);
    setIsFinished(false);
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-white font-sans">
        <div className="max-w-md w-full bg-slate-900 border-2 border-sky-500 rounded-[3rem] p-12 text-center space-y-8 shadow-2xl">
          <Trophy className="w-32 h-32 text-yellow-400 mx-auto animate-bounce" />
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Գերազանց է!</h1>
          <p className="text-xl font-bold uppercase tracking-widest text-slate-400">Դուք անցաք բոլոր մակարդակները</p>
          <div className="text-4xl font-black text-sky-400">Ընդհանուր միավոր: {score}</div>
          <button 
            onClick={restartGame}
            className="w-full py-5 bg-sky-600 rounded-full font-black text-2xl uppercase tracking-widest hover:bg-sky-500 transition-all"
          >
            Նորից սկսել <RotateCcw className="inline-block ml-2" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="max-w-4xl w-full space-y-12 pb-20">
        <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-sky-500/20 rounded-2xl text-sky-400">
               <Mic className="w-6 h-6" />
            </div>
            <div>
               <h1 className="text-xl font-black uppercase italic tracking-tighter">Spanish R Quest</h1>
               <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Արտասանության Մարզիչ</p>
            </div>
          </div>
          <div className="bg-yellow-500/20 px-6 py-2 rounded-full border border-yellow-500/30 flex items-center gap-2 font-black text-yellow-500">
             <Star className="w-5 h-5 fill-yellow-500" /> {score}
          </div>
        </div>

        <div className="flex justify-center gap-2">
           {TASKS.map((_, i) => (
             <div 
               key={i} 
               className={`h-2 rounded-full transition-all ${i === currentIndex ? 'w-12 bg-sky-500' : i < currentIndex ? 'w-4 bg-emerald-500' : 'w-4 bg-slate-800'}`} 
             />
           ))}
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[4rem] p-8 md:p-16 text-center space-y-12 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-500 to-transparent opacity-50" />
           <div className="space-y-4">
              <p className="text-sm font-black uppercase tracking-[0.5em] text-slate-500">Արտասանեք բառը</p>
              <h2 className="text-7xl md:text-9xl font-black italic tracking-tighter text-white">
                {currentTask.word}
              </h2>
              <p className="text-2xl font-bold italic text-sky-400">({currentTask.armTranslation})</p>
           </div>
           <div className="flex justify-center flex-col items-center gap-8">
              {!isRecording ? (
                <button 
                  onClick={startRecording}
                  disabled={isAnalyzing}
                  className="w-32 h-32 rounded-full bg-sky-600 flex items-center justify-center shadow-xl shadow-sky-600/30 hover:scale-110 active:scale-95 transition-all group disabled:opacity-50"
                >
                  <Mic className="w-12 h-12 group-hover:animate-pulse" />
                </button>
              ) : (
                <button 
                  onClick={stopRecording}
                  className="w-32 h-32 rounded-full bg-rose-600 flex items-center justify-center shadow-xl shadow-rose-600/30 animate-pulse active:scale-95 transition-all"
                >
                  <Square className="w-12 h-12 fill-white" />
                </button>
              )}
              {isAnalyzing && (
                <div className="flex items-center gap-3 text-sky-400 font-bold animate-pulse">
                  <Loader2 className="w-6 h-6 animate-spin" /> Վերլուծություն...
                </div>
              )}
              {audioUrl && !isRecording && !isAnalyzing && (
                <div className="flex flex-col items-center gap-4">
                   <button 
                     onClick={() => { const audio = new Audio(audioUrl); audio.play(); }}
                     className="flex items-center gap-2 px-6 py-2 bg-white/10 rounded-full border border-white/10 hover:bg-white/20 transition-all font-bold"
                   >
                     <Play className="w-4 h-4" /> Լսել ձայներիզը
                   </button>
                </div>
              )}
           </div>
        </div>

        {feedback && (
          <div className={`p-10 rounded-[3rem] border-4 space-y-4 shadow-2xl text-center ${feedback.success ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
             <div className="flex items-center justify-center gap-3 text-3xl font-black uppercase italic tracking-tighter transition-all">
                {feedback.success ? (
                  <>
                    <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    <span className="text-emerald-500">Գերազանց! ({feedback.score}%)</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-10 h-10 text-rose-500" />
                    <span className="text-rose-500">Փորձիր նորից ({feedback.score}%)</span>
                  </>
                )}
             </div>
             <p className="text-xl font-bold text-white max-w-2xl mx-auto">{feedback.text}</p>
             {feedback.success && (
               <button 
                 onClick={nextTask}
                 className="mt-6 px-12 py-4 bg-emerald-500 rounded-full font-black text-xl uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg"
               >
                 Հաջորդ բառը
               </button>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
