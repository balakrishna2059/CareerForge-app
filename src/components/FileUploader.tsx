import React, { useState, useEffect } from 'react';
import { UploadCloud, File as FileIcon, ExternalLink } from 'lucide-react';
import config from '../../firebase-applet-config.json';

// Global variables for Google scripts
declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

interface FileUploaderProps {
  name: string;
  onFileSelect: (file: File | null) => void;
  onDriveFileSelect: (driveFile: { name: string; url: string } | null) => void;
  required?: boolean;
  currentFileUrl?: string;
  currentFileName?: string;
  accept?: string;
  onViewFile?: (url: string) => void;
}

let tokenClient: any;

export function FileUploader({
  name,
  onFileSelect,
  onDriveFileSelect,
  required,
  currentFileUrl,
  currentFileName,
  accept = ".pdf,.png,.jpg,.jpeg",
  onViewFile
}: FileUploaderProps) {
  const [pickerInited, setPickerInited] = useState(false);
  const [gisInited, setGisInited] = useState(false);
  const [pendingFileName, setPendingFileName] = useState<string | null>(null);

  useEffect(() => {
    setPendingFileName(null);
  }, [currentFileUrl]);

  useEffect(() => {
    // Load gapi script
    const gapiScript = document.createElement('script');
    gapiScript.src = 'https://apis.google.com/js/api.js';
    gapiScript.onload = () => {
      window.gapi.load('picker', () => setPickerInited(true));
    };
    document.body.appendChild(gapiScript);

    // Load gsi client
    const gsiScript = document.createElement('script');
    gsiScript.src = 'https://accounts.google.com/gsi/client';
    gsiScript.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: (config as any).oAuthClientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.metadata.readonly',
        callback: (response: any) => {
          if (response.error !== undefined) {
             console.error('Error fetching token:', response);
             return;
          }
          createPicker(response.access_token);
        },
      });
      setGisInited(true);
    };
    document.body.appendChild(gsiScript);
  }, []);

  const handleDriveClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent form submission
    if (!pickerInited || !gisInited || !tokenClient) {
      alert('Google Drive Picker is still loading. Please try again in a moment.');
      return;
    }
    tokenClient.requestAccessToken({prompt: ''});
  };

  const createPicker = (token: string) => {
      const view = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS);
      const picker = new window.google.picker.PickerBuilder()
          .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
          .setDeveloperKey(config.apiKey)
          .setAppId(config.projectId)
          .setOAuthToken(token)
          .addView(view)
          .setCallback(pickerCallback)
          .build();
      picker.setVisible(true);
  };
  
  const pickerCallback = (data: any) => {
      if (data.action === window.google.picker.Action.PICKED) {
         const file = data.docs[0];
         onDriveFileSelect({
           name: file.name,
           url: file.url
         });
         onFileSelect(null); // Clear local file if any
         setPendingFileName(file.name);
      }
  };

  const handleLocalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File must be less than 5MB");
        e.target.value = '';
        return;
      }
      onFileSelect(file);
      onDriveFileSelect(null); // Clear Drive file if any
      setPendingFileName(file.name);
    } else {
      onFileSelect(null);
      setPendingFileName(null);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Local File Input */}
        <div className="flex-1 relative">
          <input 
            type="file"
            name={name}
            onChange={handleLocalChange}
            accept={accept}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div className="flex items-center justify-center gap-2 bg-surface-container-low border border-outline-variant border-dashed rounded px-3 py-2.5 text-body-sm text-on-surface hover:bg-surface-container-high transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Upload from Computer</span>
          </div>
        </div>
        
        {/* Google Drive Button */}
        <button
          onClick={handleDriveClick}
          className="flex-1 flex items-center justify-center gap-2 bg-primary-container text-on-primary-container border border-primary/20 rounded px-3 py-2.5 text-body-sm font-medium hover:bg-primary-container/80 transition-colors"
        >
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" 
            alt="Google Drive" 
            className="w-4 h-4"
          />
          Select from Google Drive
        </button>
      </div>

      {pendingFileName && (
        <div className="text-body-sm text-primary flex items-center gap-1 bg-primary-container/20 border border-primary/20 px-3 py-2 rounded">
          <FileIcon className="w-4 h-4" />
          <span className="font-medium mr-1">Selected for upload:</span> 
          <span className="truncate">{pendingFileName}</span>
        </div>
      )}

      {currentFileUrl && !pendingFileName && (
        <div className="text-body-sm text-on-surface-variant flex items-center gap-1 bg-surface-container px-3 py-2 rounded">
          <FileIcon className="w-4 h-4 text-primary" />
          <span className="font-medium mr-1">Current file:</span> 
          {onViewFile ? (
            <button type="button" onClick={(e) => { e.preventDefault(); onViewFile(currentFileUrl); }} className="text-primary hover:underline flex items-center gap-1">
              {currentFileName || 'Document'}
              <ExternalLink className="w-3 h-3" />
            </button>
          ) : (
            <a href={currentFileUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline flex items-center gap-1">
              {currentFileName || 'Document'}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
}
