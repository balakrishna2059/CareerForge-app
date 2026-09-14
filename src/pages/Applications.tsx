import React from 'react';
import { CrudPageBuilder, FieldDef } from '../components/CrudPageBuilder';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

const fields: FieldDef[] = [
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'role', label: 'Job Title', type: 'text', required: true },
  { name: 'status', label: 'Status (Saved, Applied, Assessment, Interview, Selected, Rejected)', type: 'text', required: true },
  { name: 'applicationDate', label: 'Applied Date', type: 'date', required: true },
  { name: 'deadline', label: 'Deadline', type: 'date' },
  { name: 'url', label: 'Job Posting URL', type: 'url' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'description', label: 'Job Description', type: 'textarea' },
  { name: 'notes', label: 'Notes & Follow-ups', type: 'textarea' },
];

export function Applications() {
  const crud = useFirestoreCrud('applications', 'applicationDate', 'desc');

  return (
    <CrudPageBuilder 
      title="Application Tracker" 
      subtitle="Manage your active job applications and interview pipeline."
      crud={crud}
      fields={fields}
    />
  );
}
