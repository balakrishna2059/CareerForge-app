import React, { useState } from 'react';
import { Wand2, Loader2, CheckCircle2, XCircle, AlertCircle, BookmarkPlus } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { Link } from 'react-router-dom';

export function JobMatch() {
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleMatch = async () => {
    if (!user || !jobDescription.trim()) return;
    setAnalyzing(true);
    try {
      const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
      const skillsSnap = await getDocs(query(collection(db, 'skills'), where("userId", "==", user.uid)));
      const expSnap = await getDocs(query(collection(db, 'experiences'), where("userId", "==", user.uid)));
      
      const profileData = {
        profile: profileSnap.data() || {},
        skills: skillsSnap.docs.map(d => d.data().name),
        experience: expSnap.docs.map(d => d.data())
      };

      const res = await fetch("/api/match-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          profileData
        })
      });

      if (!res.ok) throw new Error("Failed to match job");
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Error running AI Job Match');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSaveToApplications = async () => {
    if (!user || !result) return;
    try {
      await addDoc(collection(db, "applications"), {
        userId: user.uid,
        company: "Unknown Company (from Job Match)",
        position: "Target Role",
        status: "SAVED",
        appliedDate: new Date().toISOString().split('T')[0],
        matchScore: result.matchScore,
        createdAt: new Date().toISOString()
      });
      alert('Saved to your Application Workspace!');
    } catch (error) {
      console.error(error);
      alert('Error saving application');
    }
  };

  if (!user) return <div className="p-8 text-center">Please sign in.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-display-sm font-bold text-on-background">AI Job Match</h1>
        <p className="text-on-surface-variant mt-2 text-body">Paste a job description to instantly see how well your profile matches the requirements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow flex flex-col">
           <label className="block text-label font-bold text-on-surface-variant mb-4 uppercase tracking-wider">Paste Job Description</label>
           <textarea 
             value={jobDescription}
             onChange={(e) => setJobDescription(e.target.value)}
             className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 text-body text-on-surface focus:outline-none focus:border-primary flex-1 min-h-[300px] mb-6 custom-scrollbar"
             placeholder="Paste the full job description here, including responsibilities and requirements..."
           />
           <button 
             onClick={handleMatch} 
             disabled={analyzing || !jobDescription} 
             className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-4 rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 text-headline"
           >
             {analyzing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Wand2 className="w-6 h-6" />}
             {analyzing ? 'Analyzing Match...' : 'Calculate Match Score'}
           </button>
        </div>

        {result ? (
          <div className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow flex flex-col animate-in fade-in slide-in-from-right-4">
             <div className="text-center mb-8 pb-8 border-b border-outline-variant">
                <div className="text-label text-outline uppercase tracking-widest mb-2 font-bold">Match Score</div>
                <div className="text-display-lg font-black text-primary">{result.matchScore}%</div>
                <p className="text-on-surface-variant text-body mt-4 max-w-md mx-auto">{result.recommendation}</p>
             </div>

             <div className="space-y-6 flex-1">
               <div>
                 <h3 className="font-bold text-on-background flex items-center gap-2 mb-3"><CheckCircle2 className="w-5 h-5 text-primary" /> Matching Skills</h3>
                 <div className="flex flex-wrap gap-2">
                   {result.skillsMatched?.map((skill: string, i: number) => (
                     <span key={i} className="px-3 py-1 bg-primary-container text-primary rounded-full text-body-sm font-medium">{skill}</span>
                   ))}
                 </div>
               </div>
               
               <div>
                 <h3 className="font-bold text-on-background flex items-center gap-2 mb-3"><XCircle className="w-5 h-5 text-error" /> Missing Skills (Gaps)</h3>
                 <div className="flex flex-wrap gap-2">
                   {result.skillsMissing?.map((skill: string, i: number) => (
                     <span key={i} className="px-3 py-1 bg-error-container text-error rounded-full text-body-sm font-medium">{skill}</span>
                   ))}
                 </div>
               </div>

               <div>
                 <h3 className="font-bold text-on-background flex items-center gap-2 mb-2"><AlertCircle className="w-5 h-5 text-secondary" /> Experience Match</h3>
                 <p className="text-on-surface-variant text-body-sm">{result.experienceMatch}</p>
               </div>
             </div>

             <div className="mt-8 pt-6 border-t border-outline-variant flex gap-4">
               <button onClick={handleSaveToApplications} className="flex-1 flex items-center justify-center gap-2 bg-secondary text-on-secondary px-4 py-3 rounded-lg font-bold hover:bg-secondary/90 transition-colors">
                 <BookmarkPlus className="w-5 h-5" /> Save Job
               </button>
               <Link to="/resume" className="flex-1 flex items-center justify-center gap-2 bg-surface-container-high text-on-surface px-4 py-3 rounded-lg font-bold hover:bg-outline-variant transition-colors border border-outline-variant">
                 Tailor Resume
               </Link>
             </div>
          </div>
        ) : (
          <div className="bg-surface-container-low border border-outline-variant border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <Wand2 className="w-16 h-16 text-outline-variant mb-6" />
            <h3 className="text-headline font-bold text-on-surface mb-2">Ready to Match</h3>
            <p className="text-on-surface-variant max-w-sm">Paste a job description on the left and our AI will cross-reference it against your entire profile, experience, and projects.</p>
          </div>
        )}
      </div>
    </div>
  );
}
