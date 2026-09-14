import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, CheckCircle, FileText, ExternalLink } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../lib/AuthContext';
import { FileUploader } from '../components/FileUploader';
import { uploadFileToFirestore, getFileFromFirestore } from '../lib/fileUpload';

export function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [driveFile, setDriveFile] = useState<{name: string, url: string} | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    github: '',
    linkedin: '',
    portfolio: '',
    bio: '',
    resumeUrl: '',
    resumeFileName: ''
  });

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setFormData(prev => ({ ...prev, ...docSnap.data() }));
          setIsEditing(false);
        } else {
          setFormData(prev => ({ ...prev, fullName: user.displayName || '', email: user.email || '' }));
          setIsEditing(true);
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setUploadError(null);
    setSuccessMsg(null);
    
    console.log(`[PROFILE SAVE START] User UID: ${user.uid}`);
    console.log(`[PROFILE SAVE TARGET] Collection: profiles, Document: ${user.uid}`);
    
    let finalResumeUrl = formData.resumeUrl || '';
    let finalResumeFileName = formData.resumeFileName || '';
    let uploadSuccess = true;
    let fileUploadError = null;

    // Handle resume upload first (separately)
    if (driveFile) {
      finalResumeUrl = driveFile.url;
      finalResumeFileName = driveFile.name;
    } else if (selectedFile) {
      console.log(`[RESUME UPLOAD START] Starting upload for ${selectedFile.name}`);
      try {
        finalResumeUrl = await uploadFileToFirestore(user.uid, selectedFile, 'resumes');
        finalResumeFileName = selectedFile.name;
        console.log(`[RESUME UPLOAD SUCCESS]`);
      } catch (uploadErr: any) {
        console.error("[RESUME UPLOAD FAILURE] Actual error:", uploadErr);
        uploadSuccess = false;
        fileUploadError = uploadErr?.message || "Failed to upload resume. Profile data will still be saved.";
      }
    }

    const payload = {
      fullName: formData.fullName || '',
      email: formData.email || '',
      phone: formData.phone || '',
      location: formData.location || '',
      github: formData.github || '',
      linkedin: formData.linkedin || '',
      portfolio: formData.portfolio || '',
      bio: formData.bio || '',
      resumeUrl: finalResumeUrl,
      resumeFileName: finalResumeFileName,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };
    
    Object.keys(payload).forEach(key => (payload as any)[key] === undefined && delete (payload as any)[key]);

    console.log(`[DB WRITE START] Attempting to setDoc...`);
    try {
      await setDoc(doc(db, 'profiles', user.uid), payload, { merge: true });
      console.log(`[DB WRITE SUCCESS] Profile data saved for ${user.uid}`);
      
      if (!uploadSuccess) {
        setUploadError(fileUploadError);
        setSuccessMsg("Profile data saved, but resume upload failed.");
      } else {
        setSuccessMsg("Profile saved successfully!");
      }
      
      setFormData(prev => ({ ...prev, resumeUrl: finalResumeUrl, resumeFileName: finalResumeFileName }));
      setSelectedFile(null);
      setDriveFile(null);
      setIsEditing(false);
      
      setTimeout(() => { setSuccessMsg(null); setUploadError(null); }, 5000);
    } catch (error: any) {
      console.error("[DB WRITE FAILURE] Error saving profile:", error);
      console.error("[DB WRITE FAILURE CODE]", error.code);
      console.error("[DB WRITE FAILURE MESSAGE]", error.message);
      
      let errorMsg = error.message || "Failed to save profile.";
      if (error.code === 'unavailable') {
        errorMsg = "Database connection unavailable. Please check your network or Firebase configuration.";
      } else if (error.code === 'permission-denied') {
        errorMsg = "Permission denied. You don't have access to save this profile.";
      }
      setUploadError(`Save failed: ${errorMsg}`);
    } finally {
      setSaving(false);
      console.log(`[PROFILE SAVE END] Loading state reset to false.`);
    }
  };

  const handleViewResume = async (eOrUrl?: React.MouseEvent | string) => {
    if (eOrUrl && typeof eOrUrl !== 'string' && 'preventDefault' in eOrUrl) {
      eOrUrl.preventDefault();
    }
    if (!formData.resumeUrl) return;
    
    if (formData.resumeUrl.startsWith('firestore://')) {
      try {
        const fileData = await getFileFromFirestore(formData.resumeUrl);
        if (fileData) {
          const newWindow = window.open();
          if (newWindow) {
            newWindow.document.write(`<iframe src="${fileData.dataUrl}" width="100%" height="100%" style="border:none;"></iframe>`);
          }
        } else {
          alert('Failed to load file data from database.');
        }
      } catch (err) {
        console.error(err);
        alert('Error viewing file.');
      }
    } else {
      window.open(formData.resumeUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isEditing) {
    return (
      <div className="p-8 max-w-4xl mx-auto flex flex-col h-full overflow-y-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-display-sm font-bold text-on-background">Profile</h1>
            <p className="text-on-surface-variant mt-2 text-body">Your personal information and online presence.</p>
          </div>
          <button 
            onClick={() => setIsEditing(true)} 
            className="bg-primary text-on-primary px-4 py-2 rounded font-bold hover:bg-primary/90 transition-colors"
          >
            Edit Profile
          </button>
        </div>

        <div className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
            <div>
              <p className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Full Name</p>
              <p className="text-body font-medium text-on-surface">{formData.fullName || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Email</p>
              <p className="text-body font-medium text-on-surface">{formData.email || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Phone</p>
              <p className="text-body font-medium text-on-surface">{formData.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Location</p>
              <p className="text-body font-medium text-on-surface">{formData.location || 'Not provided'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Short Bio</p>
              <p className="text-body text-on-surface whitespace-pre-wrap">{formData.bio || 'No bio provided'}</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-outline-variant grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <p className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">GitHub</p>
              {formData.github ? <a href={formData.github} target="_blank" rel="noreferrer" className="text-primary hover:underline text-body font-medium truncate block">{formData.github}</a> : <p className="text-body text-on-surface-variant mt-1">No GitHub link</p>}
            </div>
            <div>
              <p className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">LinkedIn</p>
              {formData.linkedin ? <a href={formData.linkedin} target="_blank" rel="noreferrer" className="text-primary hover:underline text-body font-medium truncate block">{formData.linkedin}</a> : <p className="text-body text-on-surface-variant mt-1">No LinkedIn link</p>}
            </div>
            <div>
              <p className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-1">Portfolio</p>
              {formData.portfolio ? <a href={formData.portfolio} target="_blank" rel="noreferrer" className="text-primary hover:underline text-body font-medium truncate block">{formData.portfolio}</a> : <p className="text-body text-on-surface-variant mt-1">No Portfolio link</p>}
            </div>
          </div>
          
          <div className="pt-6 border-t border-outline-variant">
            <h3 className="text-label font-bold text-on-surface-variant uppercase tracking-wider mb-4">Uploaded Resume</h3>
            {formData.resumeUrl ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg bg-surface-container-lowest max-w-full overflow-hidden">
                  <FileText className="w-6 h-6 text-tertiary shrink-0" />
                  <span className="font-medium text-body truncate" title={formData.resumeFileName}>{formData.resumeFileName}</span>
                </div>
                <button onClick={handleViewResume} className="px-4 py-2 bg-secondary-container text-on-secondary-container font-bold rounded hover:bg-secondary-container/80 transition-colors shrink-0">
                  View Resume
                </button>
              </div>
            ) : (
              <p className="text-body text-on-surface-variant">No resume uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-display-sm font-bold text-on-background">Edit Profile</h1>
          <p className="text-on-surface-variant mt-2 text-body">Update your personal information and online presence.</p>
        </div>
        <button 
          onClick={() => setIsEditing(false)} 
          className="text-on-surface-variant hover:text-on-surface font-medium"
        >
          Cancel
        </button>
      </div>

      <form onSubmit={handleSave} className="bg-surface border border-outline-variant rounded-xl p-8 card-shadow">
        {uploadError && (
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg flex items-center gap-2 border border-error/20">
            <AlertCircle className="w-5 h-5 text-error" />
            <span className="font-medium text-body-sm">{uploadError}</span>
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-4 bg-primary-container text-on-primary-container rounded-lg flex items-center gap-2 border border-primary/20">
            <CheckCircle className="w-5 h-5 text-primary" />
            <span className="font-medium text-body-sm">{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Full Name</label>
            <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Email Address</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" required />
          </div>
          <div>
            <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Phone</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Location</label>
            <input type="text" name="location" value={formData.location} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">GitHub Profile URL</label>
            <input type="url" name="github" value={formData.github} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">LinkedIn Profile URL</label>
            <input type="url" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Personal Portfolio URL</label>
            <input type="url" name="portfolio" value={formData.portfolio} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">Short Professional Bio</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2 min-h-[100px]" />
          </div>
        </div>

        {/* Resume Upload Section */}
        <div className="mb-8 p-6 bg-surface-container-lowest border border-outline-variant rounded-xl">
          <label className="block text-label font-bold text-on-surface-variant mb-4 uppercase tracking-wider">Resume / CV</label>
          
          <FileUploader
            name="resume"
            currentFileUrl={formData.resumeUrl}
            currentFileName={formData.resumeFileName}
            onFileSelect={setSelectedFile}
            onDriveFileSelect={setDriveFile}
            accept=".pdf,.doc,.docx,image/*"
            onViewFile={handleViewResume}
          />
          
          <p className="text-body-sm text-on-surface-variant mt-3">Upload your latest resume (PDF, Word, or Image). Maximum size 5MB.</p>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
