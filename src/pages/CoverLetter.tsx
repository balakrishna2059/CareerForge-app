import React, { useState } from 'react';
import { FileText, Loader2, Copy, CheckCircle2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

export function CoverLetter() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    companyName: '',
    roleTitle: '',
    jobDescription: ''
  });
  const [generating, setGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    if (!user) return;
    setGenerating(true);
    try {
      const profileSnap = await getDoc(doc(db, 'profiles', user.uid));
      const skillsSnap = await getDocs(query(collection(db, 'skills'), where("userId", "==", user.uid)));
      const expSnap = await getDocs(query(collection(db, 'experiences'), where("userId", "==", user.uid)));
      
      const profileData = {
        profile: profileSnap.data() || {},
        skills: skillsSnap.docs.map(d => d.data().name),
        experience: expSnap.docs.map(d => d.data())
      };

      const res = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileData
        })
      });

      if (!res.ok) throw new Error("Failed to generate");
      const data = await res.json();
      setCoverLetter(data.coverLetter);

      // Save to history
      await addDoc(collection(db, "cover_letters"), {
        userId: user.uid,
        companyName: formData.companyName,
        roleTitle: formData.roleTitle,
        content: data.coverLetter,
        createdAt: new Date().toISOString()
      });

    } catch (error) {
      console.error(error);
      alert('Error generating cover letter.');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!user) return <div className="p-8 text-center">Please sign in.</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-display-sm font-bold text-on-background">AI Cover Letter Builder</h1>
        <p className="text-on-surface-variant mt-2 text-body">Generate a highly tailored cover letter based on your actual profile and the target job description.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow flex flex-col space-y-6">
           <div>
             <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Company Name</label>
             <input type="text" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-body text-on-surface focus:outline-none focus:border-primary" />
           </div>
           <div>
             <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Role Title</label>
             <input type="text" value={formData.roleTitle} onChange={e => setFormData({...formData, roleTitle: e.target.value})} className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-3 text-body text-on-surface focus:outline-none focus:border-primary" />
           </div>
           <div className="flex-1 flex flex-col">
             <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Job Description</label>
             <textarea 
               value={formData.jobDescription}
               onChange={e => setFormData({...formData, jobDescription: e.target.value})}
               className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-4 text-body text-on-surface focus:outline-none focus:border-primary flex-1 min-h-[200px]"
               placeholder="Paste the job description..."
             />
           </div>
           <button 
             onClick={generate} 
             disabled={generating || !formData.companyName || !formData.roleTitle} 
             className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary px-6 py-4 rounded-xl font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50 text-headline"
           >
             {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <FileText className="w-6 h-6" />}
             {generating ? 'Drafting...' : 'Generate Cover Letter'}
           </button>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow relative min-h-[400px]">
          {coverLetter ? (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4 pb-4 border-b border-outline-variant">
                <h3 className="font-bold text-on-background">Generated Draft</h3>
                <button onClick={copyToClipboard} className="flex items-center gap-2 px-3 py-1.5 bg-surface-container-high rounded-md text-on-surface text-body-sm font-medium hover:bg-outline-variant transition-colors">
                  {copied ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <textarea 
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                className="w-full h-full flex-1 bg-transparent resize-none focus:outline-none text-body text-on-surface"
              />
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
               <FileText className="w-16 h-16 text-outline-variant mb-4" />
               <p className="text-body font-medium">Your generated cover letter will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
