import React from 'react';
import { Bell } from 'lucide-react';

export function Notifications() {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-display-sm font-bold text-on-background">Notifications</h1>
          <p className="text-on-surface-variant mt-2 text-body">Updates regarding your applications and deadlines.</p>
        </div>
        <button className="text-primary font-bold hover:underline">Mark all as read</button>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl card-shadow divide-y divide-outline-variant text-center py-16">
         <Bell className="w-12 h-12 text-outline-variant mx-auto mb-4" />
         <h3 className="text-headline font-bold text-on-surface">No notifications yet</h3>
         <p className="text-on-surface-variant">We'll let you know when something needs your attention.</p>
      </div>
    </div>
  );
}
