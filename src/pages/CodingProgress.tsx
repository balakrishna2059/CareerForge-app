import React from 'react';
import { CrudPageBuilder, FieldDef } from '../components/CrudPageBuilder';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

const fields: FieldDef[] = [
  { name: 'platform', label: 'Platform (e.g. LeetCode, CodeChef)', type: 'text', required: true },
  { name: 'handle', label: 'User Handle / Username', type: 'text', required: true },
  { name: 'easy', label: 'Easy Solved', type: 'number' },
  { name: 'medium', label: 'Medium Solved', type: 'number' },
  { name: 'hard', label: 'Hard Solved', type: 'number' },
  { name: 'streak', label: 'Current Streak (Days)', type: 'number' },
];

export function CodingProgress() {
  const crud = useFirestoreCrud('coding_progress');
  return (
    <CrudPageBuilder 
      title="Coding Progress" 
      subtitle="Track your competitive programming and DSA progress manually."
      crud={crud}
      fields={fields}
    />
  );
}
