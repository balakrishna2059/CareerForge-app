import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, ExternalLink, Loader2 } from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { FileUploader } from './FileUploader';
import { uploadFileToFirestore, getFileFromFirestore } from '../lib/fileUpload';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'url' | 'file';
  required?: boolean;
}

export function CrudPageBuilder({ 
  title, 
  subtitle, 
  crud, 
  fields 
}: { 
  title: string, 
  subtitle: string, 
  crud: any, 
  fields: FieldDef[] 
}) {
  const { user } = useAuth();
  const { data, loading, add, update, remove } = crud;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  const [filesToUpload, setFilesToUpload] = useState<Record<string, File>>({});
  const [uploading, setUploading] = useState(false);

  const handleStartAdd = () => {
    setFormData({});
    setFilesToUpload({});
    setIsAdding(true);
    setEditingId(null);
  };

  const handleStartEdit = (item: any) => {
    setFormData(item);
    setFilesToUpload({});
    setEditingId(item.id);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
    setFilesToUpload({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setUploading(true);
    
    try {
      let finalFormData = { ...formData };
      
      // Upload files first
      for (const fieldName of Object.keys(filesToUpload)) {
        const file = filesToUpload[fieldName];
        const downloadUrl = await uploadFileToFirestore(user.uid, file, `${title.toLowerCase()}s`);
        finalFormData[fieldName] = downloadUrl;
        finalFormData[`${fieldName}Name`] = file.name;
      }

      // Remove undefineds just in case
      Object.keys(finalFormData).forEach(key => finalFormData[key] === undefined && delete finalFormData[key]);

      if (isAdding) {
        await add(finalFormData);
        setIsAdding(false);
      } else if (editingId) {
        await update(editingId, finalFormData);
        setEditingId(null);
      }
      setFormData({});
      setFilesToUpload({});
    } catch (err) {
      console.error("Error saving:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File must be less than 5MB");
        e.target.value = '';
        return;
      }
      setFilesToUpload(prev => ({ ...prev, [e.target.name]: file }));
    }
  };

  const handleViewFile = async (url: string) => {
    if (!url) return;
    if (url.startsWith('firestore://')) {
      try {
        const fileData = await getFileFromFirestore(url);
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
      window.open(url, '_blank');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col h-full overflow-y-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-display-sm font-bold text-on-background">{title}</h1>
          <p className="text-on-surface-variant mt-2 text-body">{subtitle}</p>
        </div>
        {!isAdding && !editingId && (
          <button 
            onClick={handleStartAdd}
            className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded text-body-sm font-bold shadow-sm hover:bg-primary/90"
          >
            <Plus className="w-4 h-4" />
            Add New
          </button>
        )}
      </div>

      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="bg-surface border border-outline-variant rounded-xl p-6 mb-8 card-shadow">
          <h2 className="text-headline font-bold text-on-background mb-4">
            {isAdding ? `Add ${title}` : `Edit ${title}`}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {fields.map(f => (
              <div key={f.name} className={f.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="block text-label font-bold text-on-surface-variant mb-1 uppercase tracking-wider">{f.label}</label>
                
                {f.type === 'textarea' ? (
                  <textarea 
                    name={f.name}
                    value={formData[f.name] || ''}
                    onChange={handleChange}
                    required={f.required}
                    className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-body text-on-surface focus:outline-none focus:border-primary min-h-[100px]"
                  />
                ) : f.type === 'file' ? (
                  <FileUploader
                    name={f.name}
                    required={f.required && !formData[f.name]}
                    currentFileUrl={formData[f.name]}
                    currentFileName={formData[`${f.name}Name`]}
                    onViewFile={handleViewFile}
                    onFileSelect={(file) => {
                      if (file) {
                        setFilesToUpload(prev => ({ ...prev, [f.name]: file }));
                      } else {
                        setFilesToUpload(prev => {
                          const next = { ...prev };
                          delete next[f.name];
                          return next;
                        });
                      }
                    }}
                    onDriveFileSelect={(driveFile) => {
                      if (driveFile) {
                        setFormData((prev: any) => ({
                          ...prev,
                          [f.name]: driveFile.url,
                          [`${f.name}Name`]: driveFile.name
                        }));
                        setFilesToUpload(prev => {
                          const next = { ...prev };
                          delete next[f.name];
                          return next;
                        });
                      }
                    }}
                  />
                ) : (
                  <input 
                    type={f.type}
                    name={f.name}
                    value={formData[f.name] || ''}
                    onChange={handleChange}
                    required={f.required}
                    className="w-full bg-surface-container-low border border-outline-variant rounded px-3 py-2 text-body text-on-surface focus:outline-none focus:border-primary"
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="flex gap-3 justify-end">
            <button 
              type="button" 
              onClick={handleCancel}
              disabled={uploading}
              className="px-4 py-2 text-on-surface-variant hover:bg-surface-variant/30 rounded font-bold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={uploading}
              className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 rounded font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {uploading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      )}

      {loading && !data.length ? (
        <div className="text-center py-12 text-on-surface-variant">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {data.length === 0 && !isAdding ? (
            <div className="text-center py-12 bg-surface border border-outline-variant rounded-xl text-on-surface-variant">
              No entries found. Add one to get started!
            </div>
          ) : (
            data.map((item: any) => (
              <div key={item.id} className="bg-surface border border-outline-variant rounded-xl p-6 card-shadow flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <h3 className="text-headline font-bold text-on-background">
                    {item[fields[0].name]}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 mt-2 text-body-sm text-on-surface-variant">
                    {fields.slice(1).map(f => {
                      if (!item[f.name] || f.type === 'textarea' || f.type === 'file') return null;
                      return (
                        <div key={f.name}>
                          <span className="font-bold mr-2 text-outline">{f.label}:</span>
                          <span>{item[f.name]}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {fields.find(f => f.type === 'textarea') && item[fields.find(f => f.type === 'textarea')!.name] && (
                    <p className="mt-4 text-body-sm text-on-surface whitespace-pre-wrap">
                      {item[fields.find(f => f.type === 'textarea')!.name]}
                    </p>
                  )}
                  
                  {fields.map(f => {
                     if (f.type === 'file' && item[f.name]) {
                        return (
                           <div key={f.name} className="mt-4 border-t border-outline-variant pt-3">
                              <span className="font-bold mr-2 text-outline text-body-sm block mb-1">{f.label}:</span>
                              <button onClick={() => handleViewFile(item[f.name])} className="inline-flex items-center gap-1.5 text-primary bg-primary-container/30 hover:bg-primary-container px-3 py-1.5 rounded-lg text-body-sm font-medium transition-colors">
                                 <ExternalLink className="w-4 h-4" />
                                 {item[`${f.name}Name`] || 'View Document'}
                              </button>
                           </div>
                        );
                     }
                     return null;
                  })}
                  
                </div>
                
                <div className="flex gap-2 shrink-0">
                  {itemToDelete === item.id ? (
                    <div className="flex items-center gap-2 bg-error-container/50 px-3 py-1 rounded-lg border border-error/20">
                      <span className="text-body-sm text-on-surface-variant font-medium">Delete?</span>
                      <button 
                        onClick={() => {
                          remove(item.id);
                          setItemToDelete(null);
                        }}
                        className="text-error hover:text-error/80 font-bold text-body-sm"
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => setItemToDelete(null)}
                        className="text-on-surface hover:text-on-surface-variant text-body-sm"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <>
                      <button 
                        onClick={() => handleStartEdit(item)}
                        className="p-2 text-on-surface-variant hover:text-primary bg-surface-container-low hover:bg-primary-container rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setItemToDelete(item.id)}
                        className="p-2 text-on-surface-variant hover:text-error bg-surface-container-low hover:bg-error-container rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
