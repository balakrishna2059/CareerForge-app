import React from 'react';
import { CrudPageBuilder, FieldDef } from '../components/CrudPageBuilder';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

const fields: FieldDef[] = [
  { name: 'position', label: 'Job Title / Position', type: 'text', required: true },
  { name: 'company', label: 'Company', type: 'text', required: true },
  { name: 'startDate', label: 'Start Date', type: 'date', required: true },
  { name: 'endDate', label: 'End Date (Leave blank if present)', type: 'date' },
  { name: 'technologies', label: 'Technologies Used', type: 'text' },
  { name: 'documentUrl', label: 'Supporting Document', type: 'file' },
  { name: 'description', label: 'Responsibilities and Impact', type: 'textarea', required: true },
];

export function Experience() {
  const crud = useFirestoreCrud('experiences', 'startDate', 'desc');
  return (
    <CrudPageBuilder 
      title="Experience" 
      subtitle="Record your professional work history and internships."
      crud={crud}
      fields={fields}
    />
  );
}
