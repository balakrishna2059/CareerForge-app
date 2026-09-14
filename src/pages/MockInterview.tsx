import React, { useState } from 'react';
import { Bot, Play, Square, Loader2, Target, CheckCircle2, XCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';

export function MockInterview() {
  const { user } = useAuth();
  const [setupPhase, setSetupPhase] = useState(true);
  const [targetRole, setTargetRole] = useState('');
  const [generating, setGenerating] = useState(false);
  
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answer, setAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const [sessionFinished, setSessionFinished] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);

  const startInterview = async () => {
    if (!user || !targetRole.trim()) return;
    setGenerating(true);
    try {
      const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
      const expSnap = await getDocs(query(collection(db, 'experiences'), where("userId", "==", user.uid)));
      
      const profileData = {
        profile: profileSnap.data() || {},
        experience: expSnap.docs.map(d => d.data())
      };

      const res = await fetch("/api/generate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, profileData })
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setQuestions(data.questions);
      setSetupPhase(false);
    } catch (error) {
      console.error(error);
      alert('Error generating interview questions.');
    } finally {
      setGenerating(false);
    }
  };

  const submitAnswer = async () => {
    if (!answer.trim()) return;
    setEvaluating(true);
    try {
      const q = questions[currentQ];
      const res = await fetch("/api/evaluate-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q.text,
          answer: answer,
          expectedKeyPoints: q.expectedKeyPoints
        })
      });

      if (!res.ok) throw new Error("Failed to evaluate");
      const data = await res.json();
      setFeedback(data);
    } catch (error) {
      console.error(error);
      alert('Error evaluating answer.');
    } finally {
      setEvaluating(false);
    }
  };

  const nextQuestion = () => {
    // Record score
    setSessionScore(prev => prev + (feedback?.score || 0));
    
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
      setAnswer('');
      setFeedback(null);
    } else {
      finishSession();
    }
  };

  const finishSession = async () => {
    setSessionFinished(true);
    const finalScore = Math.round((sessionScore + (feedback?.score || 0)) / questions.length * 10);
    
    // Save attempt to DB
    if (user) {
      try {
         await addDoc(collection(db, "interview_attempts"), {
           userId: user.uid,
           role: targetRole,
           score: finalScore,
           date: new Date().toISOString()
         });
      } catch(e) {
         console.error(e);
      }
    }
  };

  if (!user) return <div className="p-8 text-center">Please sign in.</div>;

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-display-sm font-bold text-on-background">AI Mock Interview</h1>
        <p className="text-on-surface-variant mt-2 text-body">Practice answering personalized interview questions tailored to your profile.</p>
      </div>

      {setupPhase ? (
        <div className="bg-surface border border-outline-variant rounded-xl p-12 card-shadow text-center max-w-2xl mx-auto w-full">
           <Bot className="w-16 h-16 text-primary mx-auto mb-6" />
           <h2 className="text-display-sm font-bold text-on-surface mb-2">Ready to practice?</h2>
           <p className="text-on-surface-variant text-body mb-8">Tell us what role you are interviewing for, and we will generate custom technical and behavioral questions based on your resume and experience.</p>
           
           <input 
             type="text" 
             placeholder="e.g. Frontend React Developer" 
             value={targetRole}
             onChange={(e) => setTargetRole(e.target.value)}
             className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 text-headline text-center focus:outline-none focus:border-primary mb-6"
           />
           
           <button 
             onClick={startInterview} 
             disabled={generating || !targetRole} 
             className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-4 rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 text-headline"
           >
             {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6" />}
             {generating ? 'Generating Questions...' : 'Start Interview Session'}
           </button>
        </div>
      ) : sessionFinished ? (
        <div className="bg-surface border border-outline-variant rounded-xl p-12 card-shadow text-center">
           <div className="w-24 h-24 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-6">
             <span className="text-display-lg font-black text-primary">
               {Math.round((sessionScore / questions.length) * 10)}%
             </span>
           </div>
           <h2 className="text-display-sm font-bold text-on-surface mb-2">Interview Complete</h2>
           <p className="text-on-surface-variant text-body mb-8">Great job! Consistency is key. Review your feedback to see what you missed.</p>
           <button onClick={() => { setSetupPhase(true); setSessionFinished(false); setCurrentQ(0); setSessionScore(0); setFeedback(null); setAnswer(''); }} className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition-colors">
             Start Another Session
           </button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between text-label text-outline uppercase tracking-widest font-bold">
            <span>Question {currentQ + 1} of {questions.length}</span>
            <span className="bg-surface-container-low px-3 py-1 rounded-full text-on-surface-variant">{questions[currentQ].category}</span>
          </div>

          <div className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow relative">
             <div className="absolute top-8 left-8 w-12 h-12 bg-primary-container rounded-full flex items-center justify-center text-primary">
               <Bot className="w-6 h-6" />
             </div>
             <div className="pl-20">
               <h2 className="text-headline font-bold text-on-surface leading-snug">"{questions[currentQ].text}"</h2>
             </div>
          </div>

          {!feedback ? (
            <div className="bg-surface border border-outline-variant rounded-xl p-6 card-shadow flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4">
              <label className="text-label text-on-surface-variant uppercase tracking-widest font-bold">Your Answer</label>
              <textarea 
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer here, just as you would say it..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 text-body text-on-surface focus:outline-none focus:border-primary min-h-[200px]"
              />
              <div className="flex justify-end">
                <button 
                  onClick={submitAnswer} 
                  disabled={evaluating || !answer.trim()} 
                  className="flex items-center justify-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-secondary/90 transition-colors disabled:opacity-50"
                >
                  {evaluating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Square className="w-5 h-5" />}
                  {evaluating ? 'Evaluating...' : 'Submit Answer'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-surface border border-outline-variant rounded-xl p-6 card-shadow flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4">
               <div className="flex justify-between items-center pb-6 border-b border-outline-variant">
                 <div>
                   <div className="text-label text-outline uppercase tracking-widest font-bold mb-1">Score</div>
                   <div className="text-display-sm font-black text-primary">{feedback.score}/10</div>
                 </div>
                 <button onClick={nextQuestion} className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold shadow-sm hover:bg-primary/90 transition-colors">
                   {currentQ < questions.length - 1 ? 'Next Question' : 'Finish Session'}
                 </button>
               </div>

               <div>
                 <h3 className="font-bold text-on-background mb-2">Feedback</h3>
                 <p className="text-on-surface-variant text-body-sm">{feedback.feedback}</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                 <div>
                   <h4 className="font-bold text-on-background flex items-center gap-2 mb-3"><CheckCircle2 className="w-4 h-4 text-primary" /> What you did well</h4>
                   <ul className="space-y-2">
                     {feedback.strongPoints.map((pt: string, i: number) => <li key={i} className="text-body-sm text-on-surface-variant flex items-start gap-2"><span className="text-primary mt-1">•</span> {pt}</li>)}
                   </ul>
                 </div>
                 <div>
                   <h4 className="font-bold text-on-background flex items-center gap-2 mb-3"><XCircle className="w-4 h-4 text-error" /> What you missed</h4>
                   <ul className="space-y-2">
                     {feedback.missedPoints.map((pt: string, i: number) => <li key={i} className="text-body-sm text-on-surface-variant flex items-start gap-2"><span className="text-error mt-1">•</span> {pt}</li>)}
                   </ul>
                 </div>
               </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
