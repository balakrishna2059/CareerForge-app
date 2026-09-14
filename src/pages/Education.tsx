import React from 'react';
import { CrudPageBuilder, FieldDef } from '../components/CrudPageBuilder';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

const fields: FieldDef[] = [
  { name: 'institution', label: 'Institution / University', type: 'text', required: true },
  { name: 'degree', label: 'Degree', type: 'text', required: true },
  { name: 'department', label: 'Department / Major', type: 'text', required: true },
  { name: 'startYear', label: 'Start Year', type: 'text', required: true },
  { name: 'endYear', label: 'End Year (or Expected)', type: 'text', required: true },
  { name: 'cgpa', label: 'CGPA / Grade', type: 'text', required: true },
  { name: 'description', label: 'Description & Achievements', type: 'textarea' },
];

export function Education() {
  const crud = useFirestoreCrud('education', 'endYear', 'desc');
  return (
    <CrudPageBuilder 
      title="Education" 
      subtitle="Track your academic history, degrees, and university achievements."
      crud={crud}
      fields={fields}
    />
  );
}
