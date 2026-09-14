import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Briefcase, ExternalLink, Loader2, Clock, CalendarDays, Filter, Bookmark, Check } from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';

interface ApiJob {
  job_id: string;
  job_apply_link: string;
  job_title: string;
  employer_name: string;
  employer_logo: string;
  job_employment_type: string;
  job_posted_at_datetime_utc: string;
  job_city: string;
  job_state: string;
  job_country: string;
  job_is_remote: boolean;
  job_description: string;
}

export function Jobs() {
  const { user } = useAuth();
  const [displayedJobs, setDisplayedJobs] = useState<ApiJob[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(new Set());
  const [savingId, setSavingId] = useState<string | null>(null);

  const handleSaveJob = async (job: ApiJob) => {
    if (!user) {
      alert("Please log in to save jobs");
      return;
    }
    setSavingId(job.job_id);
    try {
      await addDoc(collection(db, "applications"), {
        userId: user.uid,
        company: job.employer_name,
        role: job.job_title,
        status: "Saved",
        applicationDate: new Date().toISOString().split("T")[0],
        url: job.job_apply_link,
        location: formatLocation(job),
        description: stripHtml(job.job_description),
        createdAt: serverTimestamp()
      });
      setSavedJobIds(prev => {
        const next = new Set(prev);
        next.add(job.job_id);
        return next;
      });
    } catch (e) {
      console.error("Error saving job", e);
      alert("Failed to save job");
    } finally {
      setSavingId(null);
    }
  };
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Initial fetch
  useEffect(() => {
    // Initial fetch for top tech companies
    fetchJobs('Google OR Amazon OR Microsoft OR Flipkart OR Tata OR Wipro OR Zoho', '', 1, true);
  }, []);

  const handleQuickFilter = (company: string) => {
    setSearchQuery(company);
    setSearchLocation('');
    setHasSearched(true);
    setDisplayedJobs([]);
    setPage(1);
    setHasMore(false);
    fetchJobs(company, '', 1, true);
  };

  const fetchJobs = async (queryStr: string, locationStr: string, pageNum: number, isNewSearch: boolean = false) => {
    setLoading(true);
    
    try {
      const q = queryStr || '';
      const loc = locationStr || '';
      
      const response = await fetch(`/api/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&page=${pageNum}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      
      const data = await response.json();
      const fetchedJobs: ApiJob[] = data.data || [];

      if (isNewSearch) {
        setDisplayedJobs(fetchedJobs);
      } else {
        setDisplayedJobs(prev => [...prev, ...fetchedJobs]);
      }
      
      // Assume we have more if we got a full page of 10 items (JSearch default)
      setHasMore(fetchedJobs.length > 0);
      setPage(pageNum);
    } catch (error) {
      console.error("Error fetching jobs from external API", error);
      if (isNewSearch) setDisplayedJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setHasSearched(true);
    setDisplayedJobs([]);
    setPage(1);
    setHasMore(false);
    fetchJobs(searchQuery, searchLocation, 1, true);
  };
  
  const handleLoadMore = () => {
    fetchJobs(searchQuery, searchLocation, page + 1, false);
  };
  
  // Helpers
  const stripHtml = (html: string) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const formatLocation = (job: ApiJob) => {
    if (job.job_is_remote) return 'Remote';
    const parts = [job.job_city, job.job_state, job.job_country].filter(Boolean);
    return parts.join(', ') || 'Global';
  };

  const timeAgo = (dateParam: string) => {
    if (!dateParam) return 'Recently';
    const date = new Date(dateParam);
    const today = new Date();
    const seconds = Math.round((today.getTime() - date.getTime()) / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days === 1) return 'Yesterday';
    if (days < 14) return `${days} days ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col h-full overflow-y-auto custom-scrollbar">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-display-sm font-bold text-on-background">Live Job Board</h1>
          <p className="text-on-surface-variant mt-2 text-body">Search millions of real open roles updated daily across the globe.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="bg-surface border border-outline-variant rounded-xl p-3 mb-8 flex flex-col md:flex-row gap-3 shadow-sm">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search roles, companies, or skills (e.g. React Developer, Internship)..." 
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
          />
        </div>
        <div className="md:w-1/3 relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
          <input 
            type="text" 
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            placeholder="Location (e.g. Remote, UK)..." 
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg pl-10 pr-4 py-3 text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all text-on-surface"
          />
        </div>
        <button type="submit" disabled={loading} className="bg-primary text-on-primary px-8 py-3 rounded-lg font-bold disabled:opacity-70 flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
          {loading && displayedJobs.length === 0 ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mb-8">
        <span className="text-body-sm text-on-surface-variant font-medium py-1.5 mr-2">Top Companies:</span>
        {['Google', 'Amazon', 'Microsoft', 'Flipkart', 'Tata', 'Wipro', 'Zoho'].map(company => (
          <button
            key={company}
            onClick={() => handleQuickFilter(company)}
            disabled={loading}
            className="px-4 py-1.5 rounded-full border border-outline-variant bg-surface text-body-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            {company}
          </button>
        ))}
      </div>

      {loading && displayedJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface border border-outline-variant rounded-xl shadow-sm mb-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <h3 className="text-title-lg font-bold text-on-background mb-2">Connecting to global network...</h3>
          <p className="text-on-surface-variant text-body-lg">Searching live job openings...</p>
        </div>
      ) : displayedJobs.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-outline-variant rounded-xl shadow-sm">
          <Filter className="w-12 h-12 text-outline mx-auto mb-4" />
          <h3 className="text-headline font-bold text-on-background mb-2">No recent openings found</h3>
          <p className="text-on-surface-variant max-w-md mx-auto">
            {hasSearched 
              ? "We couldn't find active listings matching your specific criteria. Try broadening your search terms or clearing the location filter." 
              : "Currently waiting for live jobs to load. Run a search to get started."}
          </p>
        </div>
      ) : (
        <div className="pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {displayedJobs.map((job) => (
              <div key={job.job_id} className="bg-surface border border-outline-variant rounded-xl p-6 hover:shadow-md transition-shadow flex flex-col group">
                <div className="flex gap-4 items-start mb-4">
                  <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant overflow-hidden p-1">
                    {job.employer_logo ? (
                      <img src={job.employer_logo} alt={job.employer_name} className="w-full h-full object-contain" />
                    ) : (
                      <Briefcase className="w-6 h-6 text-outline" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-background text-title-md line-clamp-1 group-hover:text-primary transition-colors" title={job.job_title}>
                      {job.job_title}
                    </h3>
                    <p className="text-on-surface-variant font-medium text-body-sm line-clamp-1">
                      {job.employer_name}
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-y-2 gap-x-4 mb-4">
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-label font-medium bg-surface-container-low px-2 py-1 rounded">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px]">{formatLocation(job)}</span>
                  </div>
                  {job.job_employment_type && (
                    <div className="flex items-center gap-1.5 text-on-surface-variant text-label font-medium bg-surface-container-low px-2 py-1 rounded capitalize">
                      <Briefcase className="w-3.5 h-3.5" />
                      {job.job_employment_type.replace(/_/g, ' ').toLowerCase()}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-on-surface-variant text-label font-medium bg-surface-container-low px-2 py-1 rounded">
                    <Clock className="w-3.5 h-3.5" />
                    Posted {timeAgo(job.job_posted_at_datetime_utc)}
                  </div>
                </div>

                <p className="text-on-surface-variant text-body-sm line-clamp-3 mb-6 flex-1">
                  {stripHtml(job.job_description)}
                </p>
                
                <div className="pt-4 border-t border-outline-variant flex items-center justify-between mt-auto">
                  <div className="flex gap-2 w-full justify-between items-center">
                    <button
                      onClick={() => handleSaveJob(job)}
                      disabled={savedJobIds.has(job.job_id) || savingId === job.job_id}
                      className={`px-4 py-2 rounded-lg font-bold text-body-sm transition-colors flex items-center justify-center gap-2 border ${
                        savedJobIds.has(job.job_id) 
                          ? 'border-primary/30 bg-primary/10 text-primary' 
                          : 'border-outline-variant bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}
                    >
                      {savingId === job.job_id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : savedJobIds.has(job.job_id) ? (
                        <>
                          <Check className="w-4 h-4" />
                          Saved
                        </>
                      ) : (
                        <>
                          <Bookmark className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <a 
                      href={job.job_apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-primary text-on-primary px-5 py-2 rounded-lg font-bold text-body-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                    >
                      Apply Now
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {hasMore && (
            <div className="text-center">
              <button 
                onClick={handleLoadMore}
                disabled={loading}
                className="bg-surface-container border border-outline-variant text-on-surface px-8 py-3 rounded-lg font-bold hover:bg-surface-container-high transition-colors inline-flex items-center gap-2 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Load More Results'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

