import React, { useState, useEffect, useRef } from "react";
import { Search, Bell, Moon, Menu, LogOut, LogIn, X } from "lucide-react";
import { cn, getFirstName } from "../../lib/utils";
import { useAuth } from "../../lib/AuthContext";
import { signInWithGoogle, logOut, db } from "../../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

type SearchResult = {
  id: string;
  type: 'RESOURCE' | 'JOB' | 'INTERNSHIP';
  title: string;
  subtitle: string;
  url: string;
  meta: string;
};

export function Topbar({ setMobileOpen }: { setMobileOpen: (open: boolean) => void }) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [displayName, setDisplayName] = useState("User");
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      getDoc(doc(db, "profiles", user.uid)).then(d => {
        if (d.exists() && d.data().fullName) {
          setDisplayName(getFirstName(user, d.data()));
        } else {
          setDisplayName(getFirstName(user));
        }
      }).catch(() => {
        setDisplayName(getFirstName(user));
      });
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
         executeSearch(searchQuery.trim());
      } else {
         setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const executeSearch = async (query: string) => {
    setIsSearching(true);
    try {
      const results: SearchResult[] = [];

      try {
        const remotiveRes = await fetch(`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(query)}&limit=8`);
        if (remotiveRes.ok) {
          const remotiveData = await remotiveRes.json();
          if (remotiveData && remotiveData.jobs) {
            remotiveData.jobs.slice(0, 5).forEach((item: any) => {
              const isIntern = item.title.toLowerCase().includes('intern');
              results.push({
                id: `job-${item.id}`,
                type: isIntern ? 'INTERNSHIP' : 'JOB',
                title: item.title,
                subtitle: item.company_name,
                url: item.url,
                meta: item.candidate_required_location || 'Remote'
              });
            });
          }
        }
      } catch (e) {
        console.error("Job search error", e);
      }

      try {
        const devToRes = await fetch(`https://dev.to/api/articles?q=${encodeURIComponent(query)}&per_page=4`);
        if (devToRes.ok) {
          const devToData = await devToRes.json();
          if (Array.isArray(devToData)) {
            devToData.forEach((item: any) => {
              results.push({
                id: `res-${item.id}`,
                type: 'RESOURCE',
                title: item.title,
                subtitle: item.user?.name || 'Dev.to',
                url: item.url,
                meta: item.tag_list?.slice(0, 2).join(', ') || 'Article'
              });
            });
          }
        }
      } catch (e) {
        console.error("Resource search error", e);
      }

      setSearchResults(results.sort((a, b) => a.title.length - b.title.length));
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="bg-surface/80 backdrop-blur-md border-b border-outline-variant h-16 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shrink-0">
      <div className="flex items-center gap-4 flex-1">
        <button 
          className="md:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary rounded-md"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="w-5 h-5" />
        </button>
        
        <div className="relative hidden sm:block w-full max-w-sm" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setShowResults(true); }}
            onFocus={() => setShowResults(true)}
            placeholder="Search resources, jobs..." 
            className="w-full bg-surface-container-low border border-outline-variant rounded-md pl-10 pr-10 py-2 text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all placeholder:text-outline text-on-surface"
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(""); setShowResults(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          
          {showResults && searchQuery.trim().length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-outline-variant rounded-xl shadow-lg max-h-[400px] overflow-y-auto z-50 flex flex-col custom-scrollbar">
              {isSearching ? (
                <div className="p-6 text-center flex flex-col items-center justify-center text-on-surface-variant">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-body-sm font-medium">Searching live jobs & resources...</span>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="p-6 text-center flex flex-col items-center justify-center text-on-surface-variant">
                  <Search className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-body-sm font-medium">No results found for "{searchQuery}"</span>
                  <span className="text-[11px] mt-1 opacity-75">Try different keywords like 'React' or 'Python'</span>
                </div>
              ) : (
                <div className="flex flex-col py-2">
                  {searchResults.map(res => (
                    <a key={res.id} href={res.url} target="_blank" rel="noopener noreferrer" className="flex flex-col px-4 py-3 hover:bg-surface-container transition-colors border-b border-outline-variant/50 last:border-0" onClick={() => setShowResults(false)}>
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className="font-bold text-body-sm text-on-surface line-clamp-1">{res.title}</span>
                        <span className={cn(
                          "text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm shrink-0 tracking-wider",
                          res.type === 'JOB' ? 'bg-blue-100 text-blue-700' :
                          res.type === 'INTERNSHIP' ? 'bg-purple-100 text-purple-700' :
                          'bg-green-100 text-green-700'
                        )}>
                          {res.type}
                        </span>
                      </div>
                      <span className="text-[11px] text-on-surface-variant font-medium line-clamp-1">
                        {res.subtitle} <span className="opacity-50 mx-1">•</span> {res.meta}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-variant/50 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <button className="p-2 text-on-surface-variant hover:text-primary rounded-full hover:bg-surface-variant/50 transition-colors">
          <Moon className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-3 pl-4 md:pl-6 border-l border-outline-variant ml-2">
          {user ? (
            <>
              <div className="text-right hidden sm:block">
                <p className="text-body-sm font-bold text-on-surface">{displayName}</p>
                <p className="text-label text-on-surface-variant uppercase">Pro Member</p>
              </div>
              <div className="w-10 h-10 rounded-full overflow-hidden border border-outline-variant shrink-0 cursor-pointer">
                <img 
                  src={user.photoURL || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&q=80"} 
                  alt="User profile" 
                  className="w-full h-full object-cover"
                />
              </div>
              <button 
                onClick={logOut}
                className="p-2 text-on-surface-variant hover:text-error rounded-full hover:bg-error-container/50 transition-colors ml-1"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-md text-body-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
