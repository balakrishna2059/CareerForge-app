import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { Loader2 } from "lucide-react";

// Lazy loaded pages for smooth loading performance
const Dashboard = React.lazy(() => import("./pages/Dashboard").then(m => ({ default: m.Dashboard })));
const ResumeAnalyzer = React.lazy(() => import("./pages/ResumeAnalyzer").then(m => ({ default: m.ResumeAnalyzer })));
const ResumeBuilder = React.lazy(() => import("./pages/ResumeBuilder").then(m => ({ default: m.ResumeBuilder })));
const Jobs = React.lazy(() => import("./pages/Jobs").then(m => ({ default: m.Jobs })));
const TargetCareer = React.lazy(() => import("./pages/TargetCareer").then(m => ({ default: m.TargetCareer })));
const Roadmap = React.lazy(() => import("./pages/Roadmap").then(m => ({ default: m.Roadmap })));
const Profile = React.lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));
const Education = React.lazy(() => import("./pages/Education").then(m => ({ default: m.Education })));
const Skills = React.lazy(() => import("./pages/Skills").then(m => ({ default: m.Skills })));
const Projects = React.lazy(() => import("./pages/Projects").then(m => ({ default: m.Projects })));
const Certifications = React.lazy(() => import("./pages/Certifications").then(m => ({ default: m.Certifications })));
const Experience = React.lazy(() => import("./pages/Experience").then(m => ({ default: m.Experience })));
const Applications = React.lazy(() => import("./pages/Applications").then(m => ({ default: m.Applications })));
const CodingProgress = React.lazy(() => import("./pages/CodingProgress").then(m => ({ default: m.CodingProgress })));
const InterviewPrep = React.lazy(() => import("./pages/InterviewPrep").then(m => ({ default: m.InterviewPrep })));
const Settings = React.lazy(() => import("./pages/Settings").then(m => ({ default: m.Settings })));
const Notifications = React.lazy(() => import("./pages/Notifications").then(m => ({ default: m.Notifications })));
const JobMatch = React.lazy(() => import("./pages/JobMatch").then(m => ({ default: m.JobMatch })));
const CoverLetter = React.lazy(() => import("./pages/CoverLetter").then(m => ({ default: m.CoverLetter })));
const MockInterview = React.lazy(() => import("./pages/MockInterview").then(m => ({ default: m.MockInterview })));
const Calendar = React.lazy(() => import("./pages/Calendar").then(m => ({ default: m.Calendar })));

function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="analyzer" element={<ResumeAnalyzer />} />
            <Route path="resume" element={<ResumeBuilder />} />
            <Route path="jobs" element={<Jobs />} />
            <Route path="target-career" element={<TargetCareer />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="calendar" element={<Calendar />} />
            
            <Route path="profile" element={<Profile />} />
            <Route path="projects" element={<Projects />} />
            <Route path="skills" element={<Skills />} />
            <Route path="certifications" element={<Certifications />} />
            <Route path="education" element={<Education />} />
            <Route path="experience" element={<Experience />} />
            <Route path="applications" element={<Applications />} />
            <Route path="coding" element={<CodingProgress />} />
            <Route path="interview" element={<InterviewPrep />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
            
            {/* AI Features left for next phase */}
            <Route path="match" element={<JobMatch />} />
            <Route path="cover-letter" element={<CoverLetter />} />
            <Route path="mock-interview" element={<MockInterview />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
