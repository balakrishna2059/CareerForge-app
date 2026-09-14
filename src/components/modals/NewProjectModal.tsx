import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { X } from 'lucide-react';

export function NewProjectModal({ isOpen, onClose, onSaved }: { isOpen: boolean, onClose: () => void, onSaved: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '', // Equivalent to Project Name
    description: '',
    technologies: '',
    githubUrl: '',
    liveUrl: '',
    startDate: '',
    endDate: '',
    problem: '',
    features: '',
    results: ''
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'projects'), {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save project");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-lg border border-outline-variant flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center shrink-0">
          <h2 className="text-headline-sm font-bold text-on-surface">New Project</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <form id="new-proj-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Project Name *</label>
              <input required type="text" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Description *</label>
              <textarea required rows={2} className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Technologies</label>
              <input type="text" placeholder="e.g. React, Node.js, Firebase" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.technologies} onChange={e => setFormData({...formData, technologies: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-label text-on-surface-variant">GitHub URL</label>
                <input type="url" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.githubUrl} onChange={e => setFormData({...formData, githubUrl: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-on-surface-variant">Live Demo URL</label>
                <input type="url" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.liveUrl} onChange={e => setFormData({...formData, liveUrl: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-label text-on-surface-variant">Start Date</label>
                <input type="month" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-on-surface-variant">End Date</label>
                <input type="month" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Problem Solved</label>
              <textarea rows={2} className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none resize-none" value={formData.problem} onChange={e => setFormData({...formData, problem: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Key Features</label>
              <textarea rows={2} className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none resize-none" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Results / Impact</label>
              <textarea rows={2} className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none resize-none" value={formData.results} onChange={e => setFormData({...formData, results: e.target.value})} />
            </div>
          </form>
        </div>
        <div className="p-4 border-t border-outline-variant flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container rounded transition-colors">Cancel</button>
          <button type="submit" form="new-proj-form" disabled={saving} className="px-4 py-2 text-body-sm font-medium bg-primary text-on-primary hover:bg-primary-container rounded transition-colors shadow-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
