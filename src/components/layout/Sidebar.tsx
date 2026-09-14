import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  User, 
  Target,
  Route,
  FileText, 
  Folder, 
  BrainCircuit, 
  Award, 
  Briefcase, 
  BriefcaseBusiness,
  CheckSquare,
  Code,
  MessageSquare,
  Wand2,
  Sparkles,
  Bot,
  Bell,
  Settings
} from "lucide-react";
import { cn } from "../../lib/utils";

const MAIN_NAV = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Target Career", href: "/target-career", icon: Target },
  { name: "Roadmap", href: "/roadmap", icon: Route },
  { name: "Resume", href: "/resume", icon: FileText },
  { name: "Projects", href: "/projects", icon: Folder },
  { name: "Skills", href: "/skills", icon: BrainCircuit },
  { name: "Certifications", href: "/certifications", icon: Award },
  { name: "Experience", href: "/experience", icon: Briefcase },
  { name: "Jobs", href: "/jobs", icon: BriefcaseBusiness },
  { name: "Applications", href: "/applications", icon: CheckSquare },
  { name: "Coding Progress", href: "/coding", icon: Code },
  { name: "Interview Prep", href: "/interview", icon: MessageSquare },
];

const AI_TOOLS = [
  { name: "AI Resume Analyzer", href: "/analyzer", icon: Sparkles },
  { name: "AI Cover Letter", href: "/cover-letter", icon: FileText },
  { name: "AI Job Match", href: "/match", icon: Wand2 },
  { name: "AI Mock Interview", href: "/mock-interview", icon: Bot },
];

export function Sidebar({ mobileOpen, setMobileOpen }: { mobileOpen: boolean, setMobileOpen: (open: boolean) => void }) {
  const location = useLocation();

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-on-background/20 z-40 md:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}
      
      <nav className={cn(
        "bg-surface text-primary border-r border-outline-variant flex flex-col h-full py-4 z-50 transition-transform duration-300",
        "fixed md:static w-[280px] shrink-0 top-0 left-0 bottom-0",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="px-6 mb-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-sm">
            <div className="w-4 h-4 border-2 border-on-primary rotate-45"></div>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-on-background leading-none">CareerForge</h1>
            <span className="text-[11px] text-outline uppercase tracking-widest font-bold mt-1 block">Career OS</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-1 custom-scrollbar">
          {MAIN_NAV.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-body-sm transition-colors duration-150 group",
                  isActive 
                    ? "text-primary font-semibold bg-surface-container-low border border-outline-variant" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5", isActive ? "text-primary" : "group-hover:text-primary")} />
                <span>{item.name}</span>
              </Link>
            )
          })}

          <div className="pt-4 pb-2 px-3 mt-2">
            <span className="text-label text-outline uppercase tracking-widest">AI Tools</span>
          </div>

          {AI_TOOLS.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-body-sm transition-colors duration-150 group",
                  isActive 
                    ? "text-primary font-semibold bg-surface-container-low border border-outline-variant" 
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-transparent"
                )}
              >
                <item.icon className={cn("w-5 h-5 text-surface-tint")} />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>

        <div className="px-4 mt-auto pt-4 border-t border-outline-variant/30 flex flex-col gap-1">
          <Link to="/notifications" onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded text-body-sm transition-colors duration-150 group", location.pathname === '/notifications' ? "text-primary font-semibold bg-surface-container-low border border-outline-variant" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-transparent")}>
            <Bell className={cn("w-5 h-5", location.pathname === '/notifications' ? "text-primary" : "group-hover:text-primary")} />
            <span>Notifications</span>
          </Link>
          <Link to="/settings" onClick={() => setMobileOpen(false)} className={cn("flex items-center gap-3 px-3 py-2.5 rounded text-body-sm transition-colors duration-150 group", location.pathname === '/settings' ? "text-primary font-semibold bg-surface-container-low border border-outline-variant" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low border border-transparent")}>
            <Settings className={cn("w-5 h-5", location.pathname === '/settings' ? "text-primary" : "group-hover:text-primary")} />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
