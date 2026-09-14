import { Upload, FileText, Award, ArrowUp, CheckCircle, Lightbulb, Search, Edit } from "lucide-react";

export function ResumeAnalyzer() {
  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Page Header */}
      <div className="px-6 py-8 border-b border-outline-variant bg-surface sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-display-sm md:text-display-lg text-on-background">AI Resume Analyzer</h2>
          <p className="text-body text-on-surface-variant mt-2 max-w-2xl">Turn your resume into a stronger placement profile with data-driven insights.</p>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 p-6 md:p-10 overflow-hidden">
        <div className="max-w-[1440px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Resume Preview */}
          <div className="lg:col-span-5 h-full flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <span className="text-label text-on-surface-variant flex items-center gap-2">
                <FileText className="w-4 h-4" /> alex_resume_v4.pdf
              </span>
              <button className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                <Upload className="w-4 h-4" /> Upload New
              </button>
            </div>
            <div className="flex-1 bg-surface-container p-6 overflow-y-auto custom-scrollbar flex justify-center">
              {/* Mock Resume Document */}
              <div className="bg-white w-full max-w-[500px] min-h-[700px] shadow-sm p-8 text-on-background flex-shrink-0">
                <div className="border-b-2 border-primary pb-4 mb-6">
                  <h3 className="text-2xl font-bold uppercase tracking-wider text-primary">Alex Chen</h3>
                  <p className="text-sm text-on-surface-variant mt-1">Full Stack Developer | Cloud Infrastructure | Seattle, WA</p>
                </div>
                
                <div className="mb-6 relative">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-widest mb-2 flex items-center gap-2">
                    Skills
                  </h4>
                  <div className="absolute -left-6 top-1 bottom-1 w-1 bg-tertiary-fixed-dim/50 rounded-full"></div>
                  <p className="text-sm text-on-surface-variant leading-relaxed">
                    <strong>Languages:</strong> JavaScript, Python, Java, SQL<br/>
                    <strong>Frameworks:</strong> React, Node.js, Express, Django<br/>
                    <strong>Tools:</strong> Git, Docker, AWS (EC2, S3), CI/CD pipelines
                  </p>
                </div>

                <div className="mb-6 relative">
                  <h4 className="text-xs font-bold uppercase text-primary tracking-widest mb-2 flex items-center gap-2">
                    Experience
                  </h4>
                  <div className="absolute -left-6 top-1 bottom-1 w-1 bg-primary/20 rounded-full"></div>
                  <div className="mb-4">
                    <div className="flex justify-between items-baseline">
                      <h5 className="text-sm font-bold text-on-background">Software Engineer Intern</h5>
                      <span className="text-xs text-on-surface-variant">TechCorp Inc. | Summer 2023</span>
                    </div>
                    <ul className="list-disc list-inside text-sm text-on-surface-variant mt-2 space-y-1">
                      <li>Developed a microservice using Node.js, reducing API latency by 15%.</li>
                      <li>Collaborated with QA to implement automated testing, achieving 90% coverage.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI Insights Dashboard */}
          <div className="lg:col-span-7 h-full flex flex-col gap-6 overflow-y-auto pb-6 custom-scrollbar pr-2">
            
            {/* Top Metrics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary"></div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-label text-on-surface-variant">OVERALL SCORE</span>
                  <Award className="text-primary w-5 h-5" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-display-sm text-primary">82</span>
                  <span className="text-body-sm text-on-surface-variant">/100</span>
                </div>
              </div>
              
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                <span className="text-label text-on-surface-variant block mb-2">ATS COMPATIBILITY</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-4 border-tertiary-fixed-dim flex items-center justify-center">
                    <span className="text-data text-on-background">84</span>
                  </div>
                  <span className="text-xs text-on-tertiary-container font-medium flex items-center"><ArrowUp className="w-3.5 h-3.5" /> Good</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                <span className="text-label text-on-surface-variant block mb-2">KEYWORD STRENGTH</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-4 border-secondary-container flex items-center justify-center">
                    <span className="text-data text-on-background">78</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-medium">Fair</span>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm">
                <span className="text-label text-on-surface-variant block mb-2">IMPACT</span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-4 border-tertiary-fixed-dim flex items-center justify-center">
                    <span className="text-data text-on-background">86</span>
                  </div>
                  <span className="text-xs text-on-tertiary-container font-medium flex items-center"><ArrowUp className="w-3.5 h-3.5" /> Strong</span>
                </div>
              </div>
            </div>

            {/* AI Insights Bento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
              {/* Left Column (Strengths & Recs) */}
              <div className="flex flex-col gap-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex-1">
                  <h3 className="text-label text-on-surface-variant flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
                    <CheckCircle className="text-tertiary-fixed-dim w-[18px] h-[18px]" /> AI STRENGTHS
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 bg-surface p-3 rounded-lg border border-surface-variant">
                      <CheckCircle className="text-tertiary w-[18px] h-[18px] shrink-0 mt-0.5" />
                      <span className="text-body-sm text-on-background">Clear project hierarchy and readable formatting.</span>
                    </li>
                    <li className="flex items-start gap-3 bg-surface p-3 rounded-lg border border-surface-variant">
                      <CheckCircle className="text-tertiary w-[18px] h-[18px] shrink-0 mt-0.5" />
                      <span className="text-body-sm text-on-background">Strong technical stack mapping to target roles.</span>
                    </li>
                    <li className="flex items-start gap-3 bg-surface p-3 rounded-lg border border-surface-variant">
                      <CheckCircle className="text-tertiary w-[18px] h-[18px] shrink-0 mt-0.5" />
                      <span className="text-body-sm text-on-background">Effective use of quantitative achievements.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex-1">
                  <h3 className="text-label text-on-surface-variant flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
                    <Lightbulb className="text-secondary w-[18px] h-[18px]" /> RECOMMENDATIONS
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3 bg-secondary-fixed/30 p-3 rounded-lg border border-secondary-fixed-dim/50">
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-secondary flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-0.5 bg-secondary"></div><div className="w-0.5 h-2 bg-secondary absolute"></div></div>
                      <span className="text-body-sm text-on-background">Add more Cloud infrastructure metrics to your internship bullet points.</span>
                    </li>
                    <li className="flex items-start gap-3 bg-secondary-fixed/30 p-3 rounded-lg border border-secondary-fixed-dim/50">
                      <div className="w-5 h-5 rounded-full bg-white border-2 border-secondary flex items-center justify-center shrink-0 mt-0.5"><div className="w-2 h-0.5 bg-secondary"></div><div className="w-0.5 h-2 bg-secondary absolute"></div></div>
                      <span className="text-body-sm text-on-background">Strengthen your 'About' summary with specific industry goals.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column (Keywords & CTA) */}
              <div className="flex flex-col gap-6">
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-sm flex-1">
                  <h3 className="text-label text-on-surface-variant flex items-center gap-2 mb-4 border-b border-outline-variant pb-2">
                    <Search className="text-error w-[18px] h-[18px]" /> MISSING KEYWORDS
                  </h3>
                  <p className="text-body-sm text-on-surface-variant mb-4">Based on current job market trends for 'Full Stack Developer', consider integrating these terms if applicable:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Kubernetes', 'Terraform', 'GraphQL', 'System Design'].map((kw) => (
                      <span key={kw} className="px-3 py-1 bg-surface-variant text-on-surface-variant text-data text-xs rounded-full border border-outline-variant">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-primary text-on-primary rounded-xl p-6 shadow-md relative overflow-hidden">
                  <div className="absolute -right-8 -top-8 opacity-10">
                    <Edit className="w-32 h-32" />
                  </div>
                  <div className="relative z-10">
                    <h3 className="text-headline mb-2 font-bold">Ready to Upgrade?</h3>
                    <p className="text-body-sm text-primary-fixed-dim mb-6">Let our AI re-write specific bullet points to maximize impact and ATS score.</p>
                    <button className="w-full bg-white text-primary font-medium py-3 rounded-lg hover:bg-surface-container-low transition-colors shadow-sm border-t border-white/50 flex justify-center items-center gap-2">
                      <Edit className="w-[18px] h-[18px]" /> Optimize Resume
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
