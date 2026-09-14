import React, { useState, useEffect } from 'react';
import { Route, CheckCircle, Circle, PlayCircle, Clock, BookOpen, PenTool, LayoutTemplate, Briefcase } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';

export function Roadmap() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [roadmap, setRoadmap] = useState<any>(null);

  useEffect(() => {
    async function loadRoadmap() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docSnap = await getDoc(doc(db, 'roadmaps', user.uid));
        if (docSnap.exists()) {
          setRoadmap(docSnap.data());
        }
      } catch (error) {
        console.error("Error loading roadmap", error);
      } finally {
        setLoading(false);
      }
    }
    loadRoadmap();
  }, [user]);

  const toggleStep = async (index: number) => {
    if (!user || !roadmap) return;
    const newSteps = [...roadmap.steps];
    newSteps[index].completed = !newSteps[index].completed;
    
    setRoadmap({ ...roadmap, steps: newSteps });
    
    try {
      await setDoc(doc(db, 'roadmaps', user.uid), {
        steps: newSteps,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch(err) {
      console.error(err);
    }
  };

  const getIconForCategory = (cat: string) => {
    if (cat === 'Skill') return <BookOpen className="w-5 h-5" />;
    if (cat === 'Project') return <PenTool className="w-5 h-5" />;
    if (cat === 'Resume') return <LayoutTemplate className="w-5 h-5" />;
    if (cat === 'Interview') return <Briefcase className="w-5 h-5" />;
    return <PlayCircle className="w-5 h-5" />;
  };

  if (!user) return <div className="p-8 text-center">Please sign in.</div>;
  if (loading) return <div className="p-8">Loading roadmap...</div>;

  if (!roadmap || !roadmap.steps || roadmap.steps.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh] text-center">
         <Route className="w-16 h-16 text-primary mb-6" />
         <h1 className="text-display-sm font-bold text-on-background mb-4">No Roadmap Found</h1>
         <p className="text-on-surface-variant text-body mb-8">You need to set your Target Career and run an AI Gap Analysis to generate your personalized action plan.</p>
         <Link to="/target-career" className="bg-primary text-on-primary px-6 py-3 rounded font-bold shadow-sm hover:bg-primary/90">
           Go to Target Career
         </Link>
      </div>
    );
  }

  const completedCount = roadmap.steps.filter((s: any) => s.completed).length;
  const totalSteps = roadmap.steps.length;
  const progress = Math.round((completedCount / totalSteps) * 100);

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-display-sm font-bold text-on-background">Your Career Roadmap</h1>
          <p className="text-on-surface-variant mt-2 text-body">A personalized, step-by-step plan to reach your target role.</p>
        </div>
        <div className="text-right">
           <div className="text-headline font-black text-primary">{progress}%</div>
           <div className="text-label uppercase tracking-widest text-outline">Completed</div>
        </div>
      </div>

      <div className="relative border-l-2 border-outline-variant ml-4 md:ml-8 space-y-10 py-4">
        {roadmap.steps.map((step: any, idx: number) => {
          const isDone = step.completed;
          
          return (
            <div key={idx} className="relative pl-8">
              <button 
                onClick={() => toggleStep(idx)}
                className={`absolute -left-[21px] top-1 rounded-full bg-surface border-4 border-surface w-10 h-10 flex items-center justify-center transition-colors ${isDone ? 'text-primary' : 'text-outline-variant hover:text-primary'}`}
              >
                {isDone ? <CheckCircle className="w-full h-full" /> : <Circle className="w-full h-full" />}
              </button>
              
              <div className={`bg-surface border border-outline-variant rounded-xl p-6 card-shadow transition-all ${isDone ? 'opacity-60' : 'opacity-100'}`}>
                <div className="flex justify-between items-start mb-2">
                   <div className="flex items-center gap-2">
                     <div className={`p-1.5 rounded-md ${isDone ? 'bg-surface-variant text-on-surface-variant' : 'bg-primary-container text-primary'}`}>
                        {getIconForCategory(step.category)}
                     </div>
                     <span className="text-label uppercase tracking-widest text-outline font-bold">{step.category}</span>
                   </div>
                   <div className="flex items-center gap-1 text-label text-on-surface-variant font-bold bg-surface-container-low px-2 py-1 rounded">
                     <Clock className="w-3 h-3" /> {step.estimatedHours}h
                   </div>
                </div>
                
                <h3 className={`text-headline font-bold mb-2 ${isDone ? 'line-through text-on-surface-variant' : 'text-on-background'}`}>
                  {step.title}
                </h3>
                <p className="text-on-surface-variant text-body-sm">
                  {step.description}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}
