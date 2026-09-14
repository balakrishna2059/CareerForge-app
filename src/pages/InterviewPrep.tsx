import React from 'react';
import { CrudPageBuilder, FieldDef } from '../components/CrudPageBuilder';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

const fields: FieldDef[] = [
  { name: 'category', label: 'Category (e.g. DSA, System Design, React)', type: 'text', required: true },
  { name: 'topic', label: 'Topic Name', type: 'text', required: true },
  { name: 'status', label: 'Status (e.g. Not Started, In Progress, Mastered)', type: 'text', required: true },
  { name: 'notes', label: 'Preparation Notes', type: 'textarea' },
];

export function InterviewPrep() {
  const crud = useFirestoreCrud('interview_prep');
  return (
    <CrudPageBuilder 
      title="Interview Preparation" 
      subtitle="Organize and track your study progress for different interview topics."
      crud={crud}
      fields={fields}
    />
  );
}
