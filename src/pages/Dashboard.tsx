import React, { useEffect, useState } from "react";
import { Download, Plus, MoreHorizontal, Edit, BarChart2, Crosshair, Mic, PlusSquare, Calendar, Building, Bot, Timer, Route, PlayCircle } from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { getFirstName } from "../lib/utils";
import { NewApplicationModal } from "../components/modals/NewApplicationModal";
import { NewProjectModal } from "../components/modals/NewProjectModal";

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    projects: 0,
    skills: 0,
    applications: 0,
    recentApps: [] as any[],
    funnel: {
      saved: 0,
      applied: 0,
      assessment: 0,
      interview: 0,
      selected: 0,
    }
  });
  
  const [targetRole, setTargetRole] = useState<any>(null);
  const [nextAction, setNextAction] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  
  const [showAppModal, setShowAppModal] = useState(false);
  const [showProjModal, setShowProjModal] = useState(false);

  const loadStats = async () => {
    if (!user) return;
    try {
      const projQ = query(collection(db, "projects"), where("userId", "==", user.uid));
      const projSnap = await getDocs(projQ);
      
      const skillQ = query(collection(db, "skills"), where("userId", "==", user.uid));
      const skillSnap = await getDocs(skillQ);
      
      const appQ = query(collection(db, "applications"), where("userId", "==", user.uid));
      const appSnap = await getDocs(appQ);
      
      const trSnap = await getDoc(doc(db, "target_careers", user.uid));
      if (trSnap.exists()) {
         setTargetRole(trSnap.data());
      }
      
      const profSnap = await getDoc(doc(db, "profiles", user.uid));
      if (profSnap.exists()) {
         setProfile(profSnap.data());
      }
      
      const roadmapSnap = await getDoc(doc(db, "roadmaps", user.uid));
      if (roadmapSnap.exists() && roadmapSnap.data().steps) {
         const incomplete = roadmapSnap.data().steps.find((s: any) => !s.completed);
         if (incomplete) setNextAction(incomplete);
      }
      
      const apps = appSnap.docs.map(d => ({id: d.id, ...(d.data() as any)}));
      
      const funnel = {
        saved: apps.filter(a => a.status === 'Saved').length,
        applied: apps.filter(a => a.status === 'Applied').length,
        assessment: apps.filter(a => a.status === 'Assessment').length,
        interview: apps.filter(a => a.status === 'Interview').length,
        selected: apps.filter(a => a.status === 'Selected').length,
      };

      setStats({
        projects: projSnap.size,
        skills: skillSnap.size,
        applications: appSnap.size,
        recentApps: apps.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).slice(0, 5),
        funnel
      });
    } catch(e) {
      console.error("Failed to load dashboard stats", e);
    }
  };

  useEffect(() => {
    loadStats();
  }, [user]);

  // Calculate readiness dynamically
  let calculatedScore = 0;
  if (profile?.fullName) calculatedScore += 10;
  if (stats.projects > 0) calculatedScore += Math.min(25, stats.projects * 8);
  if (stats.skills > 0) calculatedScore += Math.min(20, stats.skills * 2);
  if (stats.applications > 0) calculatedScore += Math.min(25, stats.applications * 5);
  // Add base logic for readiness
  if (calculatedScore === 0) calculatedScore = 5; // Base minimum
  
  const readinessScore = targetRole?.lastAnalysis?.readinessScore || Math.min(100, calculatedScore);

  const data = [
    { name: 'M', apps: 3, code: 4 },
    { name: 'T', apps: 4, code: 2 },
    { name: 'W', apps: 6, code: 5 },
    { name: 'T', apps: 4, code: 7 },
    { name: 'F', apps: 8, code: 6 },
    { name: 'S', apps: 2, code: 3 },
    { name: 'S', apps: 1, code: 1 },
  ];
  
  const handleExport = () => {
     const report = `CAREERFORGE EXPORT REPORT
Name: ${profile?.fullName || 'User'}
Email: ${profile?.email || ''}
Target Role: ${targetRole?.title || 'Not set'}

Readiness Score: ${readinessScore}/100

Stats:
- Projects: ${stats.projects}
- Skills: ${stats.skills}
- Applications: ${stats.applications}

Funnel:
- Saved: ${stats.funnel.saved}
- Applied: ${stats.funnel.applied}
- Assessment: ${stats.funnel.assessment}
- Interview: ${stats.funnel.interview}
- Selected: ${stats.funnel.selected}

Exported on: ${new Date().toLocaleString()}
`;
     const blob = new Blob([report], { type: "text/plain" });
     const url = URL.createObjectURL(blob);
     const a = document.createElement('a');
     a.href = url;
     a.download = 'careerforge_report.txt';
     a.click();
     URL.revokeObjectURL(url);
  };
  
  const maxFunnel = Math.max(1, stats.funnel.saved, stats.funnel.applied, stats.funnel.assessment, stats.funnel.interview, stats.funnel.selected);

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-[1440px] mx-auto pb-20 space-y-6">
      <NewApplicationModal isOpen={showAppModal} onClose={() => setShowAppModal(false)} onSaved={loadStats} />
      <NewProjectModal isOpen={showProjModal} onClose={() => setShowProjModal(false)} onSaved={loadStats} />
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
        <div>
          <h2 className="text-display-sm md:text-display-lg text-on-background">Good morning, {getFirstName(user, profile)}.</h2>
          <p className="text-body text-on-surface-variant mt-2">Your placement journey at a glance.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={handleExport} className="px-4 py-2 bg-white border border-outline-variant rounded-lg text-body-sm font-medium text-on-surface hover:bg-surface-container-low transition-colors card-shadow flex items-center gap-2">
            <Download className="w-[18px] h-[18px]" /> Export Report
          </button>
          <button onClick={() => setShowAppModal(true)} className="px-4 py-2 bg-primary text-on-primary rounded-lg text-body-sm font-medium hover:bg-primary-container transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-[18px] h-[18px]" /> New Application
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Career Readiness Card */}
          <div className="bg-white rounded-xl border border-outline-variant p-6 card-shadow relative overflow-hidden flex flex-col md:flex-row items-center gap-8">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex-1 text-center md:text-left z-10 w-full">
              <h3 className="text-headline text-on-surface mb-2">Career Readiness Score</h3>
              <p className="text-body text-on-surface-variant mb-6">
                {calculatedScore < 20 ? "Complete your profile to calculate your Career Readiness." : "You're on track for placement season. Keep building experience."}
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                {[
                  { label: "Resume", score: profile ? 90 : 10, color: "bg-primary" },
                  { label: "Skills", score: Math.min(100, stats.skills * 10), color: "bg-surface-tint" },
                  { label: "Projects", score: Math.min(100, stats.projects * 20), color: "bg-primary" },
                  { label: "Exp", score: Math.min(100, stats.applications * 10), color: "bg-error" },
                  { label: "Prep", score: 30, color: "bg-primary" },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col gap-1">
                    <span className="text-label text-outline uppercase">{item.label}</span>
                    <div className="flex items-end gap-1">
                      <span className={`text-data ${item.color === 'bg-error' ? 'text-error' : 'text-on-surface'}`}>{item.score}</span>
                      <div className="w-full bg-surface-variant h-1 rounded-full mb-1 overflow-hidden">
                        <div className={`${item.color} h-1 rounded-full`} style={{ width: `${item.score}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center z-10">
              <svg className="w-full h-full transform rotate-180" viewBox="0 0 100 100">
                <path d="M 10,50 a 40,40 0 1,1 80,0" fill="none" stroke="var(--color-surface-container-low)" strokeLinecap="round" strokeWidth="8"></path>
                <path d="M 10,50 a 40,40 0 1,1 80,0" fill="none" stroke="var(--color-primary)" strokeDasharray="125" strokeDashoffset={125 - (readinessScore / 100) * 125} strokeLinecap="round" strokeWidth="8" className="transition-all duration-500 ease-out"></path>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pb-4">
                <span className="text-[32px] font-bold text-primary font-mono leading-none">{readinessScore}</span>
                <span className="text-label text-outline">/100</span>
              </div>
            </div>
          </div>
          
          {/* Next Best Action */}
          {nextAction && (
            <div className="bg-secondary-container rounded-xl border border-secondary p-6 card-shadow relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
               <div className="flex-1">
                 <h3 className="text-label text-secondary uppercase tracking-widest font-bold mb-2 flex items-center gap-2">
                   <PlayCircle className="w-4 h-4" /> Your Next Best Action
                 </h3>
                 <h2 className="text-display-sm font-bold text-on-secondary-container mb-2">{nextAction.title}</h2>
                 <p className="text-body text-on-secondary-container mb-4">{nextAction.description}</p>
                 <Link to="/roadmap" className="inline-block bg-secondary text-on-secondary px-6 py-3 rounded font-bold shadow-sm hover:bg-secondary/90 transition-colors">
                   Start Task ({nextAction.estimatedHours}h)
                 </Link>
               </div>
               <div className="hidden md:block w-32 h-32 opacity-20 shrink-0">
                 <Route className="w-full h-full text-secondary" />
               </div>
            </div>
          )}

          {/* Data Viz Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Funnel */}
            <div className="bg-white rounded-xl border border-outline-variant p-6 card-shadow flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-label text-outline uppercase tracking-widest">Application Funnel</h3>
                <button className="text-on-surface-variant hover:text-primary"><MoreHorizontal className="w-[18px] h-[18px]" /></button>
              </div>
              <div className="flex-1 flex flex-col gap-3 justify-center">
                {[
                  { label: "Saved", value: stats.funnel.saved, bg: "bg-primary/10", text: "text-on-surface", valText: "text-primary" },
                  { label: "Applied", value: stats.funnel.applied, bg: "bg-primary/20", text: "text-on-surface", valText: "text-primary" },
                  { label: "Assessment", value: stats.funnel.assessment, bg: "bg-surface-tint/40", text: "text-on-surface", valText: "text-on-surface" },
                  { label: "Interview", value: stats.funnel.interview, bg: "bg-surface-tint/60", text: "text-white", valText: "text-white" },
                  { label: "Selected", value: stats.funnel.selected, bg: "bg-primary", text: "text-white", valText: "text-white" },
                ].map((item) => {
                  const w = Math.max(15, (item.value / maxFunnel) * 100);
                  return (
                    <div onClick={() => navigate('/applications')} key={item.label} className={`relative h-10 w-full flex items-center group cursor-pointer`} style={{ width: `${w}%` }}>
                      <div className={`absolute left-0 w-full h-full ${item.bg} rounded-r-full transition-colors hover:brightness-95`}></div>
                      <div className="relative z-10 w-full flex justify-between px-4 items-center">
                        <span className={`text-body-sm font-medium ${item.text}`}>{item.label}</span>
                        <span className={`text-data ${item.valText}`}>{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Weekly Activity */}
            <div className="bg-white rounded-xl border border-outline-variant p-6 card-shadow flex flex-col h-80">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-label text-outline uppercase tracking-widest">Weekly Activity</h3>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-label text-on-surface-variant"><div className="w-2 h-2 rounded-full bg-tertiary-fixed-dim"></div> Apps</span>
                  <span className="flex items-center gap-1 text-label text-on-surface-variant"><div className="w-2 h-2 rounded-full bg-outline-variant"></div> Code</span>
                </div>
              </div>
              <div className="flex-1 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }} barGap={2} barCategoryGap="20%">
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'var(--color-outline)' }} dy={10} />
                    <Tooltip cursor={{fill: 'var(--color-surface-container-low)'}} contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-outline-variant)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} />
                    <Bar dataKey="code" stackId="a" fill="var(--color-outline-variant)" radius={[0, 0, 0, 0]} opacity={0.5} />
                    <Bar dataKey="apps" stackId="a" fill="var(--color-tertiary-fixed-dim)" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Recent Applications Table */}
          <div className="bg-white rounded-xl border border-outline-variant overflow-hidden card-shadow">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h3 className="text-body font-semibold text-on-surface">Recent Applications</h3>
              <Link to="/applications" className="text-body-sm text-primary hover:underline font-medium">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-body-sm">
                <thead className="bg-surface-container-low text-label text-outline uppercase">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Company</th>
                    <th className="px-6 py-3 font-semibold">Role</th>
                    <th className="px-6 py-3 font-semibold">Stage</th>
                    <th className="px-6 py-3 font-semibold text-right">Next Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {stats.recentApps.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-on-surface-variant">
                         No applications yet. <button onClick={() => setShowAppModal(true)} className="text-primary hover:underline ml-1">+ Add Your First Application</button>
                      </td>
                    </tr>
                  ) : stats.recentApps.map((app, i) => (
                    <tr key={i} onClick={() => navigate('/applications')} className="hover:bg-surface-bright/50 transition-colors cursor-pointer">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center border border-outline-variant shrink-0">
                          <span className="font-bold text-on-surface">{app.company ? app.company.charAt(0).toUpperCase() : '?'}</span>
                        </div>
                        <span className="font-medium text-on-surface">{app.company}</span>
                      </td>
                      <td className="px-6 py-4 text-on-surface-variant">{app.role}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium 
                          ${app.status === 'Applied' ? 'bg-primary/10 text-primary' : 
                            app.status === 'Interview' ? 'bg-secondary-fixed text-on-secondary-fixed' : 
                            app.status === 'Assessment' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 
                            'bg-surface-container-high text-on-surface'}`}>{app.status || 'Saved'}</span>
                      </td>
                      <td className="px-6 py-4 text-right text-on-surface-variant">Follow up</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-outline-variant p-6 card-shadow">
            <h3 className="text-label text-outline uppercase tracking-widest mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => navigate('/resume')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-surface-bright border border-surface-variant hover:border-primary/30 hover:bg-surface-container-low transition-all group">
                <Edit className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
                <span className="text-body-sm text-on-surface font-medium text-center leading-tight">Build<br/>Resume</span>
              </button>
              <button onClick={() => navigate('/analyzer')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-surface-bright border border-surface-variant hover:border-primary/30 hover:bg-surface-container-low transition-all group">
                <BarChart2 className="w-6 h-6 text-on-surface-variant group-hover:text-surface-tint transition-colors" />
                <span className="text-body-sm text-on-surface font-medium text-center leading-tight">Analyze<br/>Resume</span>
              </button>
              <button onClick={() => navigate('/applications')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-surface-bright border border-surface-variant hover:border-primary/30 hover:bg-surface-container-low transition-all group">
                <Crosshair className="w-6 h-6 text-on-surface-variant group-hover:text-primary transition-colors" />
                <span className="text-body-sm text-on-surface font-medium text-center leading-tight">Track<br/>App</span>
              </button>
              <button onClick={() => navigate('/mock-interview')} className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-surface-bright border border-surface-variant hover:border-primary/30 hover:bg-surface-container-low transition-all group">
                <Mic className="w-6 h-6 text-on-surface-variant group-hover:text-tertiary-container transition-colors" />
                <span className="text-body-sm text-on-surface font-medium text-center leading-tight">Practice<br/>Interview</span>
              </button>
              <button onClick={() => setShowProjModal(true)} className="col-span-2 flex flex-row items-center justify-center gap-2 p-3 rounded-lg bg-surface-bright border border-surface-variant hover:border-primary/30 hover:bg-surface-container-low transition-all group">
                <PlusSquare className="w-5 h-5 text-on-surface-variant group-hover:text-primary transition-colors" />
                <span className="text-body-sm text-on-surface font-medium">Add New Project</span>
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-outline-variant p-6 card-shadow flex-1">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-label text-outline uppercase tracking-widest">Upcoming</h3>
              <button className="text-on-surface-variant hover:text-primary"><Calendar className="w-[18px] h-[18px]" /></button>
            </div>
            
            <div className="relative border-l-2 border-surface-variant ml-3 space-y-6 pb-4">
              
              {stats.recentApps.filter(a => a.status === 'Interview' || a.deadline).length === 0 ? (
                 <div className="text-body-sm text-on-surface-variant pl-4">No upcoming events scheduled.</div>
              ) : (
                stats.recentApps.filter(a => a.status === 'Interview' || a.deadline).map((app, i) => (
                  <div key={i} className="relative pl-6">
                    <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-2 flex items-center justify-center
                      ${app.status === 'Interview' ? 'border-secondary' : 'border-surface-tint'}`}>
                      {app.status === 'Interview' && <div className="w-1.5 h-1.5 bg-secondary rounded-full"></div>}
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-label mb-1 ${app.status === 'Interview' ? 'text-secondary' : 'text-surface-tint'}`}>
                        {app.deadline || 'Upcoming'}
                      </span>
                      <span className="text-body-sm font-semibold text-on-surface">
                        {app.status === 'Interview' ? 'Interview' : 'Deadline'}
                      </span>
                      <span className="text-body-sm text-on-surface-variant flex items-center gap-1 mt-1">
                        <Building className="w-[14px] h-[14px]" /> {app.company}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button onClick={() => navigate('/calendar')} className="w-full mt-4 py-2 border border-outline-variant rounded-lg text-body-sm text-on-surface-variant hover:bg-surface-container-low transition-colors font-medium">
              View Full Calendar
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
