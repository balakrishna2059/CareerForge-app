import React from 'react';
import { CrudPageBuilder, FieldDef } from '../components/CrudPageBuilder';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

const fields: FieldDef[] = [
  { name: 'title', label: 'Project Name', type: 'text', required: true },
  { name: 'technologies', label: 'Technologies Used', type: 'text', required: true },
  { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
  { name: 'liveUrl', label: 'Live Demo URL', type: 'url' },
  { name: 'startDate', label: 'Start Date', type: 'date' },
  { name: 'endDate', label: 'End Date', type: 'date' },
  { name: 'description', label: 'Description', type: 'textarea', required: true },
  { name: 'problem', label: 'Problem Solved', type: 'textarea' },
  { name: 'features', label: 'Key Features', type: 'textarea' },
  { name: 'results', label: 'Results / Impact', type: 'textarea' },
  { name: 'documentUrl', label: 'Project Files / Documentation', type: 'file' },
];

export function Projects() {
  const crud = useFirestoreCrud('projects', 'createdAt', 'desc');

  return (
    <CrudPageBuilder 
      title="Projects" 
      subtitle="Showcase your portfolio and personal projects."
      crud={crud}
      fields={fields}
    />
  );
}
