import React, { useState, useEffect } from "react";
import { Eye, Download, User, ChevronUp, ChevronDown, Phone, Mail, Link as LinkIcon, Briefcase, GraduationCap, Code, BrainCircuit, FileText, Check, Award } from "lucide-react";
import { db } from "../lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "../lib/AuthContext";
import { useFirestoreCrud } from "../hooks/useFirestoreCrud";
import { ResumeInlineCrud } from "../components/ResumeInlineCrud";
import html2pdf from 'html2pdf.js';

export function ResumeBuilder() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  // Design states
  const [activeTab, setActiveTab] = useState<'CONTENT' | 'DESIGN'>('CONTENT');
  const [template, setTemplate] = useState('modern');
  const [fontStyle, setFontStyle] = useState('sans');

  // Crud Hooks
  const expCrud = useFirestoreCrud('experiences', 'startDate', 'desc');
  const eduCrud = useFirestoreCrud('education', 'endYear', 'desc');
  const projCrud = useFirestoreCrud('projects');
  const skillsCrud = useFirestoreCrud('skills');
  const certCrud = useFirestoreCrud('certifications', 'date', 'desc');

  // Layout toggles
  const [openSection, setOpenSection] = useState('personal-info');

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? '' : section);
  };

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const profileSnap = await getDoc(doc(db, "profiles", user.uid));
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setProfile(data);
          if (data.resumeSettings) {
            setTemplate(data.resumeSettings.template || 'modern');
            setFontStyle(data.resumeSettings.fontStyle || 'sans');
          }
        }
      } catch (err) {
        console.error("Error loading profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const saveDesignSettings = async (newTemplate: string, newFont: string) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "profiles", user.uid), {
        resumeSettings: { template: newTemplate, fontStyle: newFont }
      }, { merge: true });
    } catch(err) {
      console.error(err);
    }
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('resume-canvas');
    if (!element) return;
    
    const opt = {
      margin: 0,
      filename: `${profile.fullName || 'Resume'}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  if (!user) return <div className="p-8 text-center">Please sign in to build your resume.</div>;
  if (loading) return <div className="p-8 text-center">Loading resume data...</div>;

  const fontClasses: Record<string, string> = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono'
  };

  return (
    <div className="flex flex-col h-full bg-background relative z-10">
      
      <header className="h-16 px-4 md:px-8 flex items-center justify-between border-b border-outline-variant bg-surface sticky top-0 z-20 shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-headline text-primary font-bold hidden sm:block">Resume Builder</h2>
          <div className="h-4 w-px bg-outline-variant hidden sm:block"></div>
          <span className="text-body-sm text-on-surface-variant flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
            Synced with database
          </span>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={handleDownloadPdf} className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded font-bold hover:bg-primary/90 transition-colors text-body-sm shadow-sm">
            <Download className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
        
        {/* Left Panel: Structured Editor */}
        <aside className="w-full lg:w-[420px] bg-surface flex flex-col border-r border-outline-variant shrink-0 z-10 h-1/2 lg:h-full">
          <div className="flex border-b border-outline-variant shrink-0">
            <button onClick={() => setActiveTab('CONTENT')} className={`flex-1 py-3 text-center border-b-2 text-label uppercase tracking-wider transition-colors ${activeTab === 'CONTENT' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Content</button>
            <button onClick={() => setActiveTab('DESIGN')} className={`flex-1 py-3 text-center border-b-2 text-label uppercase tracking-wider transition-colors ${activeTab === 'DESIGN' ? 'border-primary text-primary font-bold' : 'border-transparent text-on-surface-variant hover:text-on-surface'}`}>Design</button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {activeTab === 'CONTENT' ? (
              <>
                {/* Personal Info */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden shrink-0 flex flex-col">
                  <div 
                    className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant shrink-0"
                    onClick={() => toggleSection('personal-info')}
                  >
                    <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium">
                      <User className="w-[18px] h-[18px] text-on-surface-variant" />
                      Personal Info
                    </div>
                    {openSection === 'personal-info' ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
                  </div>
                  
                  <div className={`bg-surface ${openSection === 'personal-info' ? 'block h-auto overflow-visible' : 'hidden h-0 overflow-hidden'}`}>
                    <div className="p-3 flex flex-col gap-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Full Name</label>
                          <input 
                            type="text" 
                            value={profile.fullName || ''}
                            onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                            onBlur={() => user && setDoc(doc(db, 'profiles', user.uid), { fullName: profile.fullName, userId: user.uid }, { merge: true })}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Email</label>
                          <input 
                            type="email" 
                            value={profile.email || ''}
                            onChange={(e) => setProfile({...profile, email: e.target.value})}
                            onBlur={() => user && setDoc(doc(db, 'profiles', user.uid), { email: profile.email, userId: user.uid }, { merge: true })}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Phone</label>
                          <input 
                            type="text" 
                            value={profile.phone || ''}
                            onChange={(e) => setProfile({...profile, phone: e.target.value})}
                            onBlur={() => user && setDoc(doc(db, 'profiles', user.uid), { phone: profile.phone, userId: user.uid }, { merge: true })}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">LinkedIn URL</label>
                          <input 
                            type="url" 
                            value={profile.linkedin || ''}
                            onChange={(e) => setProfile({...profile, linkedin: e.target.value})}
                            onBlur={() => user && setDoc(doc(db, 'profiles', user.uid), { linkedin: profile.linkedin, userId: user.uid }, { merge: true })}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">GitHub URL</label>
                          <input 
                            type="url" 
                            value={profile.github || ''}
                            onChange={(e) => setProfile({...profile, github: e.target.value})}
                            onBlur={() => user && setDoc(doc(db, 'profiles', user.uid), { github: profile.github, userId: user.uid }, { merge: true })}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-sm focus:border-primary focus:outline-none"
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">Bio</label>
                          <textarea 
                            value={profile.bio || ''}
                            onChange={(e) => setProfile({...profile, bio: e.target.value})}
                            onBlur={() => user && setDoc(doc(db, 'profiles', user.uid), { bio: profile.bio, userId: user.uid }, { merge: true })}
                            className="w-full bg-surface-container-lowest border border-outline-variant rounded px-3 py-2 text-body-sm focus:border-primary focus:outline-none min-h-[60px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Experience */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden shrink-0 flex flex-col">
                  <div className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant shrink-0" onClick={() => toggleSection('experience')}>
                    <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium"><Briefcase className="w-[18px] h-[18px] text-on-surface-variant" /> Experience</div>
                    {openSection === 'experience' ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
                  </div>
                  <div className={`bg-surface ${openSection === 'experience' ? 'block h-auto overflow-visible' : 'hidden h-0 overflow-hidden'}`}>
                    <div className="p-3">
                      <ResumeInlineCrud 
                        title="Experience" 
                        crud={expCrud}
                        fields={[
                          { name: 'position', label: 'Position', type: 'text', required: true },
                          { name: 'company', label: 'Company', type: 'text', required: true },
                          { name: 'startDate', label: 'Start Date', type: 'text', required: true },
                          { name: 'endDate', label: 'End Date', type: 'text' },
                          { name: 'description', label: 'Description', type: 'textarea' }
                        ]}
                        renderItem={(item) => (
                          <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-on-surface">{item.position}</span>
                            <span className="text-label text-on-surface-variant uppercase mt-0.5">{item.company}</span>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Education */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden shrink-0 flex flex-col">
                  <div className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant shrink-0" onClick={() => toggleSection('education')}>
                    <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium"><GraduationCap className="w-[18px] h-[18px] text-on-surface-variant" /> Education</div>
                    {openSection === 'education' ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
                  </div>
                  <div className={`bg-surface ${openSection === 'education' ? 'block h-auto overflow-visible' : 'hidden h-0 overflow-hidden'}`}>
                    <div className="p-3">
                      <ResumeInlineCrud 
                        title="Education" 
                        crud={eduCrud}
                        fields={[
                          { name: 'institution', label: 'Institution', type: 'text', required: true },
                          { name: 'degree', label: 'Degree', type: 'text', required: true },
                          { name: 'department', label: 'Department', type: 'text' },
                          { name: 'startYear', label: 'Start Year', type: 'text', required: true },
                          { name: 'endYear', label: 'End Year', type: 'text', required: true },
                          { name: 'cgpa', label: 'GPA', type: 'text' }
                        ]}
                        renderItem={(item) => (
                          <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-on-surface">{item.degree}</span>
                            <span className="text-label text-on-surface-variant uppercase mt-0.5">{item.institution}</span>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Projects */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden shrink-0 flex flex-col">
                  <div className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant shrink-0" onClick={() => toggleSection('projects')}>
                    <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium"><Code className="w-[18px] h-[18px] text-on-surface-variant" /> Projects</div>
                    {openSection === 'projects' ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
                  </div>
                  <div className={`bg-surface ${openSection === 'projects' ? 'block h-auto overflow-visible' : 'hidden h-0 overflow-hidden'}`}>
                    <div className="p-3">
                      <ResumeInlineCrud 
                        title="Project" 
                        crud={projCrud}
                        fields={[
                          { name: 'title', label: 'Project Title', type: 'text', required: true },
                          { name: 'technologies', label: 'Technologies', type: 'text' },
                          { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
                          { name: 'liveUrl', label: 'Live URL', type: 'url' },
                          { name: 'description', label: 'Description', type: 'textarea' }
                        ]}
                        renderItem={(item) => (
                          <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-on-surface">{item.title}</span>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Skills */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden shrink-0 flex flex-col">
                  <div className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant shrink-0" onClick={() => toggleSection('skills')}>
                    <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium"><BrainCircuit className="w-[18px] h-[18px] text-on-surface-variant" /> Skills</div>
                    {openSection === 'skills' ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
                  </div>
                  <div className={`bg-surface ${openSection === 'skills' ? 'block h-auto overflow-visible' : 'hidden h-0 overflow-hidden'}`}>
                    <div className="p-3">
                      <ResumeInlineCrud 
                        title="Skill" 
                        crud={skillsCrud}
                        fields={[
                          { name: 'name', label: 'Skill Name (e.g. React, Python)', type: 'text', required: true },
                          { name: 'level', label: 'Level (Optional)', type: 'text' }
                        ]}
                        renderItem={(item) => (
                          <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-on-surface">{item.name}</span>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Certifications */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded shadow-sm overflow-hidden mt-3 shrink-0 flex flex-col">
                  <div className="p-3 flex items-center justify-between bg-surface-container-low cursor-pointer border-b border-outline-variant shrink-0" onClick={() => toggleSection('certifications')}>
                    <div className="flex items-center gap-2 text-on-surface text-body-sm font-medium"><Award className="w-[18px] h-[18px] text-on-surface-variant" /> Certifications</div>
                    {openSection === 'certifications' ? <ChevronUp className="w-[18px] h-[18px]" /> : <ChevronDown className="w-[18px] h-[18px]" />}
                  </div>
                  <div className={`bg-surface ${openSection === 'certifications' ? 'block h-auto overflow-visible' : 'hidden h-0 overflow-hidden'}`}>
                    <div className="p-3">
                      <ResumeInlineCrud 
                        title="Certification" 
                        crud={certCrud}
                        fields={[
                          { name: 'name', label: 'Certification Name', type: 'text', required: true },
                          { name: 'issuer', label: 'Issuing Organization', type: 'text', required: true },
                          { name: 'date', label: 'Date Earned', type: 'text', required: true },
                          { name: 'url', label: 'Credential URL', type: 'url' }
                        ]}
                        renderItem={(item) => (
                          <div className="flex flex-col">
                            <span className="text-body-sm font-medium text-on-surface">{item.name}</span>
                            <span className="text-label text-on-surface-variant uppercase mt-0.5">{item.issuer}</span>
                          </div>
                        )}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-3">Template</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: 'modern', name: 'Modern' },
                      { id: 'classic', name: 'Classic (ATS)' },
                      { id: 'minimal', name: 'Minimalist' }
                    ].map(t => (
                      <button 
                        key={t.id} 
                        onClick={() => {
                          setTemplate(t.id);
                          saveDesignSettings(t.id, fontStyle);
                        }}
                        className={`p-3 border rounded text-center transition-colors flex flex-col items-center gap-2 ${template === t.id ? 'border-primary bg-primary-container/20 text-primary' : 'border-outline-variant text-on-surface hover:border-outline'}`}
                      >
                        <div className={`w-full h-12 bg-surface-container rounded ${template === t.id ? 'opacity-100' : 'opacity-50'}`}></div>
                        <span className="text-body-sm font-medium">{t.name}</span>
                        {template === t.id && <Check className="w-4 h-4 absolute top-2 right-2 text-primary" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-3">Typography</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sans', name: 'Sans', class: 'font-sans' },
                      { id: 'serif', name: 'Serif', class: 'font-serif' },
                      { id: 'mono', name: 'Mono', class: 'font-mono' }
                    ].map(f => (
                      <button 
                        key={f.id} 
                        onClick={() => {
                          setFontStyle(f.id);
                          saveDesignSettings(template, f.id);
                        }}
                        className={`p-2 border rounded text-center transition-colors ${f.class} ${fontStyle === f.id ? 'border-primary bg-primary-container/20 text-primary font-bold' : 'border-outline-variant text-on-surface hover:border-outline'}`}
                      >
                        {f.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel: Resume Canvas Wrapper */}
        <section className="flex-1 bg-surface-container-low overflow-y-auto p-4 lg:p-8 flex justify-center relative custom-scrollbar h-1/2 lg:h-full print:p-0 print:bg-white">
          <div className="absolute inset-0 pointer-events-none opacity-50 print:hidden" style={{ backgroundImage: 'radial-gradient(var(--color-outline-variant) 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          
          <article 
            id="resume-canvas" 
            className={`bg-white w-full max-w-[850px] min-h-[1100px] document-shadow border border-outline-variant relative z-10 p-10 md:p-14 lg:p-16 flex flex-col text-on-surface shrink-0 print:border-none print:shadow-none print:m-0 print:w-[100%] print:min-h-0 ${fontClasses[fontStyle] || 'font-sans'}`}
            style={{ color: '#1a1a1a' }}
          >
            {/* Header Templates */}
            {template === 'classic' ? (
              <header className="pb-4 mb-6 text-center border-b border-gray-300">
                <h1 className="text-[28pt] font-bold tracking-tight mb-2 uppercase">{profile.fullName || "Your Name"}</h1>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 text-[10pt] text-gray-700">
                  {profile.email && <span>{profile.email}</span>}
                  {profile.email && profile.phone && <span>|</span>}
                  {profile.phone && <span>{profile.phone}</span>}
                  {profile.linkedin && <span>|</span>}
                  {profile.linkedin && <span>{profile.linkedin.replace(/^https?:\/\//, '')}</span>}
                  {profile.github && <span>|</span>}
                  {profile.github && <span>{profile.github.replace(/^https?:\/\//, '')}</span>}
                </div>
              </header>
            ) : template === 'minimal' ? (
              <header className="pb-6 mb-6 text-left flex justify-between items-end border-b-2 border-gray-900">
                <div>
                  <h1 className="text-[32pt] font-black tracking-tighter mb-1">{profile.fullName || "Your Name"}</h1>
                  <p className="text-[12pt] text-gray-600">{profile.bio ? profile.bio.slice(0, 100) + '...' : ''}</p>
                </div>
                <div className="flex flex-col items-end text-[9pt] text-gray-700 gap-1">
                  {profile.email && <span>{profile.email}</span>}
                  {profile.phone && <span>{profile.phone}</span>}
                  {profile.linkedin && <span>{profile.linkedin.replace(/^https?:\/\//, '')}</span>}
                </div>
              </header>
            ) : (
              // Modern Default
              <header className="border-b-2 border-blue-600 pb-4 mb-6 text-center">
                <h1 className="text-[36px] font-bold text-gray-900 tracking-tight mb-2">{profile.fullName || "Your Name"}</h1>
                <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-[13px] text-gray-600">
                  {profile.email && <span className="flex items-center gap-1"><Mail className="w-[12px] h-[12px]" /> {profile.email}</span>}
                  {profile.phone && <span className="flex items-center gap-1"><Phone className="w-[12px] h-[12px]" /> {profile.phone}</span>}
                  {profile.linkedin && <span className="flex items-center gap-1"><LinkIcon className="w-[12px] h-[12px]" /> {profile.linkedin.replace(/^https?:\/\//, '')}</span>}
                  {profile.github && <span className="flex items-center gap-1"><LinkIcon className="w-[12px] h-[12px]" /> {profile.github.replace(/^https?:\/\//, '')}</span>}
                </div>
              </header>
            )}

            <div className="flex flex-col gap-5">
              
              {/* Experience */}
              {expCrud.data.length > 0 && (
                <section>
                  <h2 className={`text-[12pt] font-bold mb-3 ${template === 'modern' ? 'text-blue-700 uppercase tracking-widest border-b border-gray-200 pb-1' : template === 'classic' ? 'uppercase border-b border-gray-300 pb-1 tracking-widest' : 'border-b-2 border-gray-900 pb-1'}`}>Experience</h2>
                  {expCrud.data.map((exp: any, i: number) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className="text-[11pt] font-bold text-gray-900">{exp.position}</h3>
                        <span className="text-[10pt] text-gray-600 font-medium whitespace-nowrap ml-4">{exp.startDate} – {exp.endDate || 'Present'}</span>
                      </div>
                      <div className="text-[10pt] font-medium text-gray-700 mb-1">{exp.company}</div>
                      <div className="text-[9.5pt] leading-[1.5] text-gray-800 ml-3 whitespace-pre-wrap list-disc" style={{ display: 'list-item' }}>
                        {exp.description}
                      </div>
                    </div>
                  ))}
                </section>
              )}
              
              {/* Education */}
              {eduCrud.data.length > 0 && (
                <section>
                  <h2 className={`text-[12pt] font-bold mb-3 ${template === 'modern' ? 'text-blue-700 uppercase tracking-widest border-b border-gray-200 pb-1' : template === 'classic' ? 'uppercase border-b border-gray-300 pb-1 tracking-widest' : 'border-b-2 border-gray-900 pb-1'}`}>Education</h2>
                  {eduCrud.data.map((edu: any, i: number) => (
                    <div key={i} className="mb-2 last:mb-0 flex justify-between items-start">
                      <div>
                        <h3 className="text-[11pt] font-bold text-gray-900">{edu.institution}</h3>
                        <div className="text-[10pt] text-gray-800">{edu.degree} {edu.department ? `in ${edu.department}` : ''} {edu.cgpa ? `• GPA: ${edu.cgpa}` : ''}</div>
                      </div>
                      <span className="text-[10pt] text-gray-600 font-medium whitespace-nowrap ml-4">{edu.startYear} – {edu.endYear}</span>
                    </div>
                  ))}
                </section>
              )}

              {/* Projects */}
              {projCrud.data.length > 0 && (
                <section>
                  <h2 className={`text-[12pt] font-bold mb-3 ${template === 'modern' ? 'text-blue-700 uppercase tracking-widest border-b border-gray-200 pb-1' : template === 'classic' ? 'uppercase border-b border-gray-300 pb-1 tracking-widest' : 'border-b-2 border-gray-900 pb-1'}`}>Projects</h2>
                  {projCrud.data.map((proj: any, i: number) => (
                    <div key={i} className="mb-3 last:mb-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <h3 className="text-[11pt] font-bold text-gray-900">
                          {proj.title}
                          {proj.technologies && <span className="font-normal italic text-gray-600 ml-2">| {proj.technologies}</span>}
                        </h3>
                      </div>
                      <div className="text-[9.5pt] leading-[1.5] text-gray-800 ml-3 whitespace-pre-wrap list-disc" style={{ display: 'list-item' }}>
                        {proj.description}
                      </div>
                    </div>
                  ))}
                </section>
              )}
              
              {/* Skills */}
              {skillsCrud.data.length > 0 && (
                <section>
                  <h2 className={`text-[12pt] font-bold mb-3 ${template === 'modern' ? 'text-blue-700 uppercase tracking-widest border-b border-gray-200 pb-1' : template === 'classic' ? 'uppercase border-b border-gray-300 pb-1 tracking-widest' : 'border-b-2 border-gray-900 pb-1'}`}>Skills</h2>
                  <div className="text-[10pt] text-gray-800 leading-relaxed">
                     <span className="font-bold">Technical Skills: </span>
                     {skillsCrud.data.map((s: any) => s.name).join(', ')}
                  </div>
                </section>
              )}

              {/* Certifications */}
              {certCrud.data.length > 0 && (
                <section>
                  <h2 className={`text-[12pt] font-bold mb-3 ${template === 'modern' ? 'text-blue-700 uppercase tracking-widest border-b border-gray-200 pb-1' : template === 'classic' ? 'uppercase border-b border-gray-300 pb-1 tracking-widest' : 'border-b-2 border-gray-900 pb-1'}`}>Certifications</h2>
                  {certCrud.data.map((cert: any, i: number) => (
                    <div key={i} className="mb-2 last:mb-0 flex justify-between items-start">
                      <div>
                        <h3 className="text-[11pt] font-bold text-gray-900">{cert.name}</h3>
                        <div className="text-[10pt] text-gray-800">{cert.issuer}</div>
                      </div>
                      <span className="text-[10pt] text-gray-600 font-medium whitespace-nowrap ml-4">{cert.date}</span>
                    </div>
                  ))}
                </section>
              )}

            </div>
          </article>
        </section>
      </div>
    </div>
  );
}
