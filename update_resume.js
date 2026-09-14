const fs = require('fs');

const content = `import React, { useState, useEffect } from "react";
import { Eye, Download, User, ChevronUp, ChevronDown, Plus, GripVertical, Phone, Mail, Link as LinkIcon, Briefcase, GraduationCap } from "lucide-react";
import { db } from "../lib/firebase";
import { doc, getDoc, collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";

export function ResumeBuilder() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<any>({});
  const [experiences, setExperiences] = useState<any[]>([]);
  const [education, setEducation] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Layout toggles
  const [showPersonalInfo, setShowPersonalInfo] = useState(true);
  const [showExperience, setShowExperience] = useState(true);
  const [showEducation, setShowEducation] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        // Load Profile
        const profileSnap = await getDoc(doc(db, "profiles", user.uid));
        if (profileSnap.exists()) {
          setProfile(profileSnap.data());
        }

        // Load Experiences
        const expQ = query(collection(db, "experiences"), where("userId", "==", user.uid));
        const expSnap = await getDocs(expQ);
        const exps = expSnap.docs.map(d => d.data());
        // Sort manually since complex index might be missing
        exps.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setExperiences(exps);

        // Load Education
        const eduQ = query(collection(db, "education"), where("userId", "==", user.uid));
        const eduSnap = await getDocs(eduQ);
        const edus = eduSnap.docs.map(d => d.data());
        edus.sort((a, b) => Number(b.endYear) - Number(a.endYear));
        setEducation(edus);
        
      } catch (err) {
        console.error("Error loading resume data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please sign in to build your resume.</div>;
  if (loading) return <div className="p-8 text-center">Loading resume data...</div>;

  return (
    <div className="flex flex-col h-full bg-background relative z-10">
      
      <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-outline-variant bg-surface sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-headline text-primary font-bold hidden sm:block">Resume Builder</h2>
          <div className="h-4 w-px bg-outline-variant hidden sm:block"></div>
          <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></span>
            Synced with your database
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded text-on-surface-variant hover:bg-surface-variant/50 transition-colors text-body-sm font-medium border border-outline-variant">
            <Eye className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Preview</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded bg-primary text-on-primary hover:bg-primary-container transition-colors text-body-sm font-medium shadow-sm border-t border-white/20" onClick={() => window.print()}>
            <Download className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Print / PDF</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        
        {/* Left Panel: Structured Editor */}
        <aside className="w-full lg:w-[380px] bg-surface flex flex-col border-r border-outline-variant shrink-0 z-10 h-1/2 lg:h-full">
          <div className="flex border-b border-outline-variant shrink-0">
            <button className="flex-1 py-3 text-center border-b-2 border-primary text-primary text-label uppercase tracking-wider">Content</button>
            <button className="flex-1 py-3 text-center border-b-2 border-transparent text-on-surface-variant hover:text-on-surface text-label uppercase tracking-wider">Design</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            
            {/* Personal Info */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden group">
              <div 
                className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant"
                onClick={() => setShowPersonalInfo(!showPersonalInfo)}
              >
                <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium">
                  <User className="w-[18px] h-[18px] text-on-surface-variant" />
                  Personal Info
                </div>
                {showPersonalInfo ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
              </div>
              
              {showPersonalInfo && (
                <div className="p-4 flex flex-col gap-4">
                  <div>
                    <label className="text-label text-on-surface-variant block mb-1">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.fullName || ""}
                      onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                      className="w-full bg-surface border border-outline-variant rounded p-2 text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition-all" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-label text-on-surface-variant block mb-1">Email</label>
                      <input 
                        type="text" 
                        value={profile.email || ""}
                        onChange={(e) => setProfile({...profile, email: e.target.value})}
                        className="w-full bg-surface border border-outline-variant rounded p-2 text-body-sm text-on-surface outline-none focus:border-primary" 
                      />
                    </div>
                    <div>
                      <label className="text-label text-on-surface-variant block mb-1">Phone</label>
                      <input 
                        type="text" 
                        value={profile.phone || ""}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                        className="w-full bg-surface border border-outline-variant rounded p-2 text-body-sm text-on-surface outline-none focus:border-primary" 
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Experience */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden">
              <div 
                className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant"
                onClick={() => setShowExperience(!showExperience)}
              >
                <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium">
                  <Briefcase className="w-[18px] h-[18px] text-on-surface-variant" />
                  Experience
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-primary hover:bg-primary/10 rounded p-1" onClick={(e) => e.stopPropagation()}>
                    <Plus className="w-[16px] h-[16px]" />
                  </button>
                  {showExperience ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
                </div>
              </div>
              
              {showExperience && (
                <div className="p-3 flex flex-col gap-2 bg-surface">
                  {experiences.length === 0 ? (
                    <div className="text-body-sm text-on-surface-variant p-2 text-center border border-dashed border-outline-variant rounded">No experience added yet.</div>
                  ) : (
                    experiences.map((exp, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border border-outline-variant rounded bg-surface-container-lowest cursor-move hover:border-primary/50">
                        <div className="flex flex-col">
                          <span className="text-body-sm font-medium text-on-surface">{exp.position}</span>
                          <span className="text-label text-on-surface-variant uppercase mt-0.5">{exp.company}</span>
                        </div>
                        <GripVertical className="w-[16px] h-[16px] text-outline" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Education */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden">
              <div 
                className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant"
                onClick={() => setShowEducation(!showEducation)}
              >
                <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium">
                  <GraduationCap className="w-[18px] h-[18px] text-on-surface-variant" />
                  Education
                </div>
                <div className="flex items-center gap-2">
                  <button className="text-primary hover:bg-primary/10 rounded p-1" onClick={(e) => e.stopPropagation()}>
                    <Plus className="w-[16px] h-[16px]" />
                  </button>
                  {showEducation ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
                </div>
              </div>
              
              {showEducation && (
                <div className="p-3 flex flex-col gap-2 bg-surface">
                  {education.length === 0 ? (
                    <div className="text-body-sm text-on-surface-variant p-2 text-center border border-dashed border-outline-variant rounded">No education added yet.</div>
                  ) : (
                    education.map((edu, i) => (
                      <div key={i} className="flex items-center justify-between p-2 border border-outline-variant rounded bg-surface-container-lowest cursor-move hover:border-primary/50">
                        <div className="flex flex-col">
                          <span className="text-body-sm font-medium text-on-surface">{edu.degree}</span>
                          <span className="text-label text-on-surface-variant uppercase mt-0.5">{edu.institution}</span>
                        </div>
                        <GripVertical className="w-[16px] h-[16px] text-outline" />
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

          </div>
        </aside>

        {/* Right Panel: Resume Canvas Wrapper */}
        <section className="flex-1 bg-surface-container-low overflow-y-auto p-4 lg:p-8 flex justify-center relative custom-scrollbar h-1/2 lg:h-full">
          <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: 'radial-gradient(var(--color-outline-variant) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <article className="bg-surface-container-lowest w-full max-w-[850px] min-h-[1100px] document-shadow border border-outline-variant relative z-10 p-8 md:p-12 lg:p-[48px] flex flex-col text-on-surface shrink-0">
            
            <header className="border-b-2 border-primary pb-4 mb-6 text-center">
              <h1 className="text-[36px] font-bold text-on-surface tracking-tight mb-2">{profile.fullName || "Your Name"}</h1>
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[13px] text-on-surface-variant">
                {profile.email && <span className="flex items-center gap-1"><Mail className="w-[14px] h-[14px]" /> {profile.email}</span>}
                {profile.email && profile.phone && <span className="hidden md:inline">•</span>}
                {profile.phone && <span className="flex items-center gap-1"><Phone className="w-[14px] h-[14px]" /> {profile.phone}</span>}
                
                {profile.linkedin && <span className="hidden md:inline">•</span>}
                {profile.linkedin && <span className="flex items-center gap-1"><LinkIcon className="w-[14px] h-[14px]" /> {profile.linkedin.replace(/^https?:\\/\\//, '')}</span>}
                
                {profile.github && <span className="hidden md:inline">•</span>}
                {profile.github && <span className="flex items-center gap-1"><LinkIcon className="w-[14px] h-[14px]" /> {profile.github.replace(/^https?:\\/\\//, '')}</span>}
              </div>
            </header>

            <div className="flex flex-col gap-6">
              
              {/* Education */}
              {education.length > 0 && (
                <section>
                  <h2 className="text-[14px] text-primary uppercase font-bold tracking-widest border-b border-outline-variant pb-1 mb-3">Education</h2>
                  {education.map((edu, i) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-[15px] font-semibold">{edu.institution}</h3>
                        <span className="text-[13px] text-on-surface-variant">{edu.startYear} - {edu.endYear}</span>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-[14px] italic text-on-surface-variant">{edu.degree} {edu.department ? \`in \${edu.department}\` : ''}</span>
                        {edu.cgpa && <span className="text-[13px] font-medium">GPA: {edu.cgpa}</span>}
                      </div>
                      {edu.description && (
                        <p className="text-[13px] mt-1 text-on-surface">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </section>
              )}

              {/* Experience */}
              {experiences.length > 0 && (
                <section>
                  <h2 className="text-[14px] text-primary uppercase font-bold tracking-widest border-b border-outline-variant pb-1 mb-3">Experience</h2>
                  {experiences.map((exp, i) => (
                    <div key={i} className="mb-4 last:mb-0">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="text-[15px] font-semibold">{exp.position}</h3>
                        <span className="text-[13px] text-on-surface-variant">{exp.startDate} - {exp.endDate || 'Present'}</span>
                      </div>
                      <div className="text-[14px] font-medium text-on-surface-variant mb-2">{exp.company}</div>
                      <div className="text-[13px] leading-relaxed flex flex-col gap-1 text-on-surface ml-1 whitespace-pre-wrap">
                        {exp.description}
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Projects placeholder (could be fetched as well) */}
              {/* Skills placeholder */}
            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/pages/ResumeBuilder.tsx', content);
