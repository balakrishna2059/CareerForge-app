import React from 'react';
import { CrudPageBuilder, FieldDef } from '../components/CrudPageBuilder';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

const fields: FieldDef[] = [
  { name: 'name', label: 'Certificate Name', type: 'text', required: true },
  { name: 'organization', label: 'Issuing Organization', type: 'text', required: true },
  { name: 'issueDate', label: 'Issue Date', type: 'date', required: true },
  { name: 'expiryDate', label: 'Expiry Date', type: 'date' },
  { name: 'credentialId', label: 'Credential ID', type: 'text' },
  { name: 'credentialUrl', label: 'Credential URL', type: 'url' },
  { name: 'documentUrl', label: 'Certificate File', type: 'file' },
];

export function Certifications() {
  const crud = useFirestoreCrud('certifications', 'issueDate', 'desc');
  return (
    <CrudPageBuilder 
      title="Certifications" 
      subtitle="Track your professional certifications and course completions."
      crud={crud}
      fields={fields}
    />
  );
}
