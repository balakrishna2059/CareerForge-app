import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../lib/AuthContext';
import { Calendar as CalendarIcon, Clock, Building, MapPin } from 'lucide-react';

export function Calendar() {
  const { user } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      if (!user) return;
      try {
        const appQ = query(collection(db, "applications"), where("userId", "==", user.uid));
        const appSnap = await getDocs(appQ);
        
        const loadedEvents: any[] = [];
        appSnap.forEach(doc => {
          const app = doc.data();
          if (app.deadline) {
             loadedEvents.push({
                id: doc.id + '_dl',
                title: `${app.company} Deadline`,
                date: app.deadline,
                type: 'Deadline',
                company: app.company
             });
          }
          if (app.status === 'Interview') {
             // Fake interview date for testing since we didn't add interview date yet
             loadedEvents.push({
                id: doc.id + '_int',
                title: `${app.company} Interview`,
                date: app.applicationDate || new Date().toISOString().split('T')[0],
                type: 'Interview',
                company: app.company
             });
          }
        });
        
        loadedEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setEvents(loadedEvents);
      } catch(e) {
         console.error("Failed to load events", e);
      } finally {
         setLoading(false);
      }
    }
    loadEvents();
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please sign in.</div>;

  return (
    <div className="p-4 md:p-6 lg:p-10 max-w-[1440px] mx-auto pb-20 space-y-6">
      <div className="mb-8">
        <h2 className="text-display-sm font-bold text-on-background flex items-center gap-3">
          <CalendarIcon className="w-8 h-8 text-primary" />
          Full Calendar
        </h2>
        <p className="text-body text-on-surface-variant mt-2">Track your upcoming interviews, deadlines, and events.</p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-on-surface-variant">Loading calendar...</div>
      ) : events.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-outline-variant rounded-xl bg-surface">
           <CalendarIcon className="w-12 h-12 text-outline mx-auto mb-4 opacity-50" />
           <p className="text-body text-on-surface-variant">No upcoming events found.</p>
           <p className="text-body-sm text-outline mt-2">Add applications or schedule interviews to see them here.</p>
        </div>
      ) : (
        <div className="grid gap-4">
           {events.map(event => (
             <div key={event.id} className="bg-white border border-outline-variant p-4 rounded-xl flex items-center justify-between shadow-sm hover:border-primary/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${event.type === 'Interview' ? 'bg-secondary/10 text-secondary' : 'bg-surface-tint/10 text-surface-tint'}`}>
                      {event.type === 'Interview' ? <Clock className="w-6 h-6" /> : <CalendarIcon className="w-6 h-6" />}
                   </div>
                   <div>
                      <h3 className="text-body font-bold text-on-surface">{event.title}</h3>
                      <div className="flex gap-4 text-body-sm text-on-surface-variant mt-1">
                         <span className="flex items-center gap-1"><CalendarIcon className="w-4 h-4"/> {event.date}</span>
                         <span className="flex items-center gap-1"><Building className="w-4 h-4"/> {event.company}</span>
                      </div>
                   </div>
                </div>
                <div>
                   <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${event.type === 'Interview' ? 'bg-secondary text-white' : 'bg-surface-tint text-white'}`}>
                     {event.type}
                   </span>
                </div>
             </div>
           ))}
        </div>
      )}
    </div>
  );
}
