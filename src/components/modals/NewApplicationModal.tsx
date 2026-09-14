import React, { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../lib/AuthContext';
import { X } from 'lucide-react';

export function NewApplicationModal({ isOpen, onClose, onSaved }: { isOpen: boolean, onClose: () => void, onSaved: () => void }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    company: '',
    role: '', // Equivalent to Job Title
    description: '',
    url: '',
    location: '',
    applicationDate: new Date().toISOString().split('T')[0],
    status: 'Applied', // Statuses: Saved, Applied, Assessment, Interview, Selected, Rejected
    notes: ''
  });
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, 'applications'), {
        ...formData,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
      onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save application");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 flex items-center justify-center z-50 p-4">
      <div className="bg-surface w-full max-w-lg rounded-xl shadow-lg border border-outline-variant flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-outline-variant flex justify-between items-center shrink-0">
          <h2 className="text-headline-sm font-bold text-on-surface">New Application</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full text-on-surface-variant"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1 custom-scrollbar">
          <form id="new-app-form" onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-label text-on-surface-variant">Company *</label>
                <input required type="text" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-on-surface-variant">Job Title *</label>
                <input required type="text" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-label text-on-surface-variant">Status</label>
                <select className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                  <option value="Saved">Saved</option>
                  <option value="Applied">Applied</option>
                  <option value="Assessment">Assessment</option>
                  <option value="Interview">Interview</option>
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-label text-on-surface-variant">Location</label>
                <input type="text" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Application Date</label>
              <input type="date" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.applicationDate} onChange={e => setFormData({...formData, applicationDate: e.target.value})} />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Job URL</label>
              <input type="url" className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none" value={formData.url} onChange={e => setFormData({...formData, url: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Job Description</label>
              <textarea rows={3} className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none resize-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-label text-on-surface-variant">Notes</label>
              <textarea rows={2} className="px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded focus:border-primary outline-none resize-none" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} />
            </div>
          </form>
        </div>
        <div className="p-4 border-t border-outline-variant flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container rounded transition-colors">Cancel</button>
          <button type="submit" form="new-app-form" disabled={saving} className="px-4 py-2 text-body-sm font-medium bg-primary text-on-primary hover:bg-primary-container rounded transition-colors shadow-sm disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  );
}
