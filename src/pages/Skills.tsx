import React from 'react';
import { CrudPageBuilder, FieldDef } from '../components/CrudPageBuilder';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

const fields: FieldDef[] = [
  { name: 'name', label: 'Skill Name', type: 'text', required: true },
  { name: 'category', label: 'Category (e.g. Frontend, Backend, Tools)', type: 'text', required: true },
  { name: 'proficiency', label: 'Proficiency (e.g. 1-100 or Beginner/Advanced)', type: 'text' },
];

export function Skills() {
  const crud = useFirestoreCrud('skills');
  return (
    <CrudPageBuilder 
      title="Skills" 
      subtitle="Manage your technical and soft skills inventory."
      crud={crud}
      fields={fields}
    />
  );
}
