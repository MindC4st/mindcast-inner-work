import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LESSONS, LESSONS_BY_NUMBER, MOVEMENTS } from '../../data/curriculumData';
import type { Lesson, DigQuestions } from '../../data/curriculumData';

// Simple JSON-based save (in-memory only for now)
// In production, this would save to Airtable or a database

function TextArea({ label, value, onChange, rows = 4 }: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-black/40 mb-1.5">{label}</label>
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm font-mono bg-white focus:outline-none focus:border-black/30"
      />
    </div>
  );
}

function Input({ label, value, onChange }: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-black/40 mb-1.5">{label}</label>
      <input
        type="text"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm bg-white focus:outline-none focus:border-black/30"
      />
    </div>
  );
}

export default function AdminLessonEditor() {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const navigate = useNavigate();
  const num = parseInt(lessonNumber || '', 10);
  const lesson = LESSONS_BY_NUMBER.get(num);

  const [editData, setEditData] = useState<Lesson | null>(lesson ? { ...lesson } : null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!lesson || !editData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-bold mb-2">Lesson not found</h2>
        <p className="text-black/50">No lesson with number {lessonNumber}</p>
      </div>
    );
  }

  const updateField = (field: string, value: string | string[] | null) => {
    setEditData(prev => prev ? { ...prev, [field]: value } : prev);
  };

  const updateDigQuestion = (key: string, value: string) => {
    setEditData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        digQuestions: {
          ...(prev.digQuestions || {}),
          [key]: value,
        },
      };
    });
  };

  const handleSave = () => {
    setSaving(true);
    // For now: just simulate saving. In production, write to Airtable or backend.
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 500);
  };

  return (
    <div className="max-w-4xl">
      <button
        onClick={() => navigate('/admin/curriculum')}
        className="text-sm text-black/50 hover:text-black mb-6 flex items-center gap-1"
      >
        ← Back to curriculum
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <span className="text-sm text-black/40 font-mono">
            Lesson #{lesson.number} · {lesson.movementLabel} — Editing
          </span>
          <h2 className="text-2xl font-bold mt-1">{lesson.title}</h2>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-green-600 text-sm font-medium">Saved ✓</span>}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-black/80 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <TextArea label="Theme Summary" value={editData.themeSummary} onChange={v => updateField('themeSummary', v)} />
          <TextArea label="Adult Key Idea" value={editData.adultIdea} onChange={v => updateField('adultIdea', v)} />
          <TextArea label="Facilitation Notes" value={editData.facilitationNotes} onChange={v => updateField('facilitationNotes', v)} rows={6} />
          <TextArea label="Edge Prompt" value={editData.edgePrompt} onChange={v => updateField('edgePrompt', v)} rows={2} />
        </div>
        <div className="space-y-4">
          <Input label="Adult Episode" value={editData.adultEpisode} onChange={v => updateField('adultEpisode', v)} />
          <TextArea label="Teen Track" value={editData.teenTrack} onChange={v => updateField('teenTrack', v)} rows={5} />
          <TextArea label="Kids Track" value={editData.kidsTrack} onChange={v => updateField('kidsTrack', v)} rows={3} />

          {editData.digQuestions && Object.entries(editData.digQuestions).map(([key, q]) => (
            <TextArea
              key={key}
              label={`Dig Question ${key.replace('q', '')}`}
              value={q}
              onChange={v => updateDigQuestion(key, v)}
              rows={3}
            />
          ))}

          <div className="mb-4">
            <label className="block text-xs font-semibold uppercase tracking-wider text-black/40 mb-1.5">
              Resources ({editData.externalResources?.length || 0})
            </label>
            <textarea
              value={(editData.externalResources || []).join('\n')}
              onChange={e => updateField('externalResources', e.target.value.split('\n').filter(Boolean))}
              rows={4}
              className="w-full px-3 py-2 border border-black/10 rounded-lg text-sm font-mono bg-white focus:outline-none focus:border-black/30"
              placeholder="One resource per line"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
