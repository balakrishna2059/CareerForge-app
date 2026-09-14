import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Save, X, GripVertical } from 'lucide-react';
import { useFirestoreCrud } from '../hooks/useFirestoreCrud';

export interface FieldDef {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'textarea' | 'url';
  required?: boolean;
}

export function ResumeInlineCrud({ 
  title, 
  crud,
  fields,
  renderItem
}: { 
  title: string, 
  crud: any,
  fields: FieldDef[],
  renderItem: (item: any) => React.ReactNode
}) {
  const { data, loading, add, update, remove } = crud;
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  const handleStartAdd = () => {
    setFormData({});
    setIsAdding(true);
    setEditingId(null);
  };

  const handleStartEdit = (item: any) => {
    setFormData(item);
    setEditingId(item.id);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({});
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      await add(formData);
      setIsAdding(false);
    } else if (editingId) {
      await update(editingId, formData);
      setEditingId(null);
    }
    setFormData({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (loading && !data.length) return <div className="p-2 text-body-sm">Loading {title}...</div>;

  return (
    <div className="flex flex-col gap-2">
      {(isAdding || editingId) ? (
        <form onSubmit={handleSave} className="bg-surface-container-highest border border-outline-variant rounded p-3 text-on-surface">
          <div className="flex flex-col gap-3 mb-3">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-[10px] font-bold text-on-surface-variant uppercase mb-1">{f.label}</label>
                {f.type === 'textarea' ? (
                  <textarea 
                    name={f.name}
                    value={formData[f.name] || ''}
                    onChange={handleChange}
                    required={f.required}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-body-sm focus:border-primary min-h-[60px]"
                  />
                ) : (
                  <input 
                    type={f.type}
                    name={f.name}
                    value={formData[f.name] || ''}
                    onChange={handleChange}
                    required={f.required}
                    className="w-full bg-surface-container-lowest border border-outline-variant rounded px-2 py-1 text-body-sm focus:border-primary"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-end">
            <button type="button" onClick={handleCancel} className="px-2 py-1 text-body-sm text-on-surface-variant hover:bg-surface-variant rounded font-medium">Cancel</button>
            <button type="submit" className="flex items-center gap-1 bg-primary text-on-primary px-3 py-1 rounded text-body-sm font-bold shadow-sm hover:bg-primary/90">
              <Save className="w-3 h-3" /> Save
            </button>
          </div>
        </form>
      ) : (
        <>
          {data.length === 0 ? (
            <div className="text-body-sm text-on-surface-variant p-2 text-center border border-dashed border-outline-variant rounded">No {title.toLowerCase()} added.</div>
          ) : (
            data.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-2 border border-outline-variant rounded bg-surface-container-lowest group hover:border-primary/50">
                <div className="flex-1 min-w-0">
                  {renderItem(item)}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  <button onClick={() => handleStartEdit(item)} className="p-1 text-on-surface-variant hover:text-primary rounded" title="Edit"><Edit2 className="w-3 h-3" /></button>
                  <button onClick={() => remove(item.id)} className="p-1 text-on-surface-variant hover:text-error rounded" title="Delete"><Trash2 className="w-3 h-3" /></button>
                  <GripVertical className="w-3 h-3 text-outline cursor-move" />
                </div>
              </div>
            ))
          )}
          <button onClick={handleStartAdd} className="mt-1 flex items-center justify-center gap-1 border border-dashed border-outline-variant text-on-surface-variant py-1.5 rounded hover:bg-surface-container-high hover:text-on-surface transition-colors text-body-sm font-medium">
            <Plus className="w-3 h-3" /> Add {title}
          </button>
        </>
      )}
    </div>
  );
}
