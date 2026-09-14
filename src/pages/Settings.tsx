import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Palette, Shield } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { logOut } from '../lib/firebase';

export function Settings() {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');
  
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="mb-8">
        <h1 className="text-display-sm font-bold text-on-background">Settings</h1>
        <p className="text-on-surface-variant mt-2 text-body">Manage your application preferences and account security.</p>
      </div>

      <div className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow space-y-8">
        <div>
          <h2 className="flex items-center gap-2 text-headline font-bold text-on-background mb-4">
            <Palette className="w-5 h-5" /> Appearance
          </h2>
          <div className="flex gap-4">
            <button onClick={() => setTheme('light')} className={`px-4 py-2 border rounded font-bold ${theme === 'light' ? 'border-primary text-primary bg-primary-container' : 'border-outline-variant text-on-surface-variant'}`}>Light Mode</button>
            <button onClick={() => setTheme('dark')} className={`px-4 py-2 border rounded font-bold ${theme === 'dark' ? 'border-primary text-primary bg-primary-container' : 'border-outline-variant text-on-surface-variant'}`}>Dark Mode</button>
          </div>
        </div>

        <hr className="border-outline-variant" />

        <div>
          <h2 className="flex items-center gap-2 text-headline font-bold text-on-background mb-4">
            <Bell className="w-5 h-5" /> Notifications
          </h2>
          <label className="flex items-center gap-3">
            <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-outline" defaultChecked />
            <span className="text-body font-medium text-on-surface">Email notifications for upcoming interviews</span>
          </label>
        </div>

        <hr className="border-outline-variant" />

        <div>
          <h2 className="flex items-center gap-2 text-headline font-bold text-on-background mb-4">
            <Shield className="w-5 h-5" /> Account Action
          </h2>
          {user ? (
            <div>
              <p className="text-body text-on-surface-variant mb-4">Signed in as <span className="font-bold text-on-surface">{user.email}</span></p>
              <button onClick={logOut} className="bg-error text-on-error px-4 py-2 rounded font-bold hover:bg-error/90 transition-colors">Log Out</button>
            </div>
          ) : (
             <p className="text-body text-on-surface-variant">Not currently signed in.</p>
          )}
        </div>
      </div>
    </div>
  );
}
