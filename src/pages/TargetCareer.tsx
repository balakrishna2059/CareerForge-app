import React, { useState, useEffect } from 'react';
import { Save, Target, TrendingUp, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { useNavigate } from 'react-router-dom';

export function TargetCareer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [generating, setGenerating] = useState(false);
  
  const [formData, setFormData] = useState({
    roleTitle: '',
    experienceLevel: 'Entry Level',
    locations: '',
    targetCompanies: '',
    techStack: ''
  });

  const [gapAnalysis, setGapAnalysis] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'target_careers', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as any);
          if (docSnap.data().lastAnalysis) {
             setGapAnalysis(docSnap.data().lastAnalysis);
          }
        }
      } catch (error) {
        console.error("Error loading target career", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'target_careers', user.uid), {
        ...formData,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      alert('Target career saved!');
    } catch (error) {
      console.error(error);
      alert('Error saving target career');
    } finally {
      setSaving(false);
    }
  };

  const handleRunAnalysis = async () => {
    if (!user) return;
    setAnalyzing(true);
    try {
      // Fetch full profile data for context
      const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
      const skillsSnap = await getDocs(query(collection(db, 'skills'), where("userId", "==", user.uid)));
      const expSnap = await getDocs(query(collection(db, 'experiences'), where("userId", "==", user.uid)));
      
      const profileData = {
        profile: profileSnap.data() || {},
        skills: skillsSnap.docs.map(d => d.data().name),
        experience: expSnap.docs.map(d => d.data())
      };

      const res = await fetch("/api/analyze-career-gap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: formData.roleTitle + ' - ' + formData.techStack,
          profileData
        })
      });

      if (!res.ok) throw new Error("Failed to analyze");
      const analysis = await res.json();
      
      setGapAnalysis(analysis);
      
      // Save analysis to DB
      await setDoc(doc(db, 'target_careers', user.uid), {
        lastAnalysis: analysis,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
    } catch (error) {
      console.error(error);
      alert('Error running AI analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const generateRoadmap = async () => {
    if (!user || !gapAnalysis) return;
    setGenerating(true);
    try {
      const res = await fetch("/api/generate-roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetRole: formData.roleTitle,
          gapAnalysis
        })
      });

      if (!res.ok) throw new Error("Failed to generate roadmap");
      const roadmapData = await res.json();
      
      // Save to roadmap DB
      await setDoc(doc(db, 'roadmaps', user.uid), {
        steps: roadmapData.steps,
        userId: user.uid,
        updatedAt: new Date().toISOString()
      });
      navigate('/roadmap');
    } catch(err) {
      console.error(err);
      alert('Failed to generate roadmap');
    } finally {
      setGenerating(false);
    }
  };

  if (!user) return <div className="p-8 text-center">Please sign in.</div>;
  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-display-sm font-bold text-on-background">Target Career</h1>
        <p className="text-on-surface-variant mt-2 text-body">Define your goals to get personalized AI gap analysis and roadmaps.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <form onSubmit={handleSave} className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase">Target Role Title</label>
              <input type="text" name="roleTitle" value={formData.roleTitle} onChange={handleChange} placeholder="e.g. Full Stack Developer" className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase">Experience Level</label>
              <select name="experienceLevel" value={formData.experienceLevel} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2">
                <option>Entry Level</option>
                <option>Junior</option>
                <option>Mid-Level</option>
                <option>Senior</option>
              </select>
            </div>
            <div>
              <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase">Preferred Tech Stack</label>
              <input type="text" name="techStack" value={formData.techStack} onChange={handleChange} placeholder="e.g. React, Node.js, PostgreSQL" className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" required />
            </div>
            <div>
              <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase">Target Companies (Optional)</label>
              <input type="text" name="targetCompanies" value={formData.targetCompanies} onChange={handleChange} placeholder="e.g. Google, Stripe, Startups" className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" />
            </div>
            <div>
              <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase">Locations (Optional)</label>
              <input type="text" name="locations" value={formData.locations} onChange={handleChange} placeholder="e.g. Remote, San Francisco, London" className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" />
            </div>
          </div>
          
          <div className="mt-8 flex justify-end">
            <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded font-bold shadow-sm hover:bg-primary/90 transition-colors">
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Goals'}
            </button>
          </div>
        </form>

        <div className="space-y-6">
          <div className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow text-center">
            <Target className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-headline font-bold mb-2">AI Career Assessment</h2>
            <p className="text-on-surface-variant mb-6 text-body">Analyze your profile against your target role to find skill gaps.</p>
            <button onClick={handleRunAnalysis} disabled={analyzing || !formData.roleTitle} className="w-full justify-center flex items-center gap-2 bg-primary-container text-primary px-6 py-3 rounded font-bold hover:bg-primary-container/80 transition-colors disabled:opacity-50">
              {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
              {analyzing ? 'Analyzing...' : 'Run Gap Analysis'}
            </button>
          </div>

          {gapAnalysis && (
            <div className="bg-surface border border-outline-variant rounded-xl p-6 card-shadow space-y-6 animate-in fade-in slide-in-from-bottom-4">
               <div>
                  <h3 className="font-bold text-headline mb-4">Analysis Results</h3>
                  <div className="flex items-center justify-between bg-surface-container-low p-4 rounded mb-4">
                    <span className="font-bold text-on-surface-variant">Readiness Score</span>
                    <span className="text-display-sm font-black text-primary">{gapAnalysis.readinessScore}%</span>
                  </div>
               </div>
               
               <div>
                 <h4 className="font-bold text-on-background flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4 text-error" /> Top Skill Gaps</h4>
                 <div className="space-y-3">
                   {gapAnalysis.skillsMissing?.slice(0, 4).map((gap: any, i: number) => (
                     <div key={i} className="bg-error-container/30 p-3 rounded">
                       <div className="font-bold text-error flex justify-between">
                         {gap.skill} 
                         <span className="text-[10px] uppercase tracking-wider bg-error/10 px-2 py-1 rounded">{gap.priority}</span>
                       </div>
                       <div className="text-body-sm text-on-surface-variant mt-1">{gap.reason}</div>
                     </div>
                   ))}
                 </div>
               </div>
               
               <button onClick={generateRoadmap} disabled={generating || analyzing} className="w-full justify-center flex items-center gap-2 bg-secondary text-on-secondary px-6 py-3 rounded font-bold hover:bg-secondary/90 transition-colors mt-4">
                 {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />} 
                 {generating ? 'Generating Roadmap...' : 'Generate Action Roadmap'}
               </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
