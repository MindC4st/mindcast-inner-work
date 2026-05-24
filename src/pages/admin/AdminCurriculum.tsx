import React, { useState } from 'react';
import { LESSONS, LESSONS_BY_NUMBER, MOVEMENTS, type MovementId, type Lesson } from '../../data/curriculumData';

function LessonCard({ lesson, onSelect }: { lesson: Lesson; onSelect: (l: Lesson) => void }) {
  return (
    <div
      className="border border-black/10 rounded-xl p-4 cursor-pointer hover:border-black/30 transition-colors bg-white"
      onClick={() => onSelect(lesson)}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-sm text-black/40 font-mono">#{lesson.number}</span>
          <h3 className="font-semibold text-lg leading-tight mt-0.5">{lesson.title}</h3>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
          lesson.status === 'Ready' ? 'bg-green-100 text-green-700' :
          lesson.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {lesson.status}
        </span>
      </div>
      {lesson.themeSummary && (
        <p className="text-sm text-black/60 line-clamp-2">{lesson.themeSummary}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-3 text-xs text-black/40">
        {lesson.teenTrack && <span>🧑 Teen</span>}
        {lesson.kidsTrack && <span>🧒 Kids</span>}
        {lesson.digQuestions && <span>📝 {Object.keys(lesson.digQuestions).length} questions</span>}
        {lesson.externalResources && <span>📚 {lesson.externalResources.length} resources</span>}
        {lesson.audioUrl && <span>🎧 Audio</span>}
        {lesson.slidesUrl && <span>📊 Slides</span>}
      </div>
    </div>
  );
}

function LessonDetail({ lesson, onBack }: { lesson: Lesson; onBack: () => void }) {
  return (
    <div className="max-w-4xl">
      <button
        onClick={onBack}
        className="text-sm text-black/50 hover:text-black mb-6 flex items-center gap-1"
      >
        ← Back to curriculum
      </button>

      <div className="mb-8">
        <span className="text-sm text-black/40 font-mono">Lesson #{lesson.number} · {lesson.movementLabel}</span>
        <h2 className="text-3xl font-bold mt-1">{lesson.title}</h2>
        <span className={`inline-block mt-2 text-xs px-2 py-1 rounded-full font-medium ${
          lesson.status === 'Ready' ? 'bg-green-100 text-green-700' :
          lesson.status === 'Draft' ? 'bg-amber-100 text-amber-700' :
          'bg-gray-100 text-gray-500'
        }`}>
          {lesson.status}
        </span>
      </div>

      {lesson.themeSummary && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Theme Summary</h3>
          <p className="text-black/80 leading-relaxed">{lesson.themeSummary}</p>
        </section>
      )}

      {lesson.adultIdea && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Adult Key Idea</h3>
          <p className="text-black/80 leading-relaxed">{lesson.adultIdea}</p>
        </section>
      )}

      {lesson.digQuestions && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Dig Questions</h3>
          <div className="space-y-3">
            {Object.entries(lesson.digQuestions).map(([key, q]) => (
              q && (
                <div key={key} className="bg-stone-50 border border-black/5 rounded-xl p-4">
                  <span className="text-xs font-mono text-black/30">{key.toUpperCase()}</span>
                  <p className="mt-1 text-black/80">{q}</p>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {lesson.teenTrack && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Teen Track</h3>
          <p className="text-black/70 leading-relaxed whitespace-pre-wrap">{lesson.teenTrack}</p>
        </section>
      )}

      {lesson.kidsTrack && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Kids Track</h3>
          <p className="text-black/70 leading-relaxed">{lesson.kidsTrack}</p>
        </section>
      )}

      {lesson.facilitationNotes && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Facilitation Notes</h3>
          <p className="text-black/70 leading-relaxed">{lesson.facilitationNotes}</p>
        </section>
      )}

      {lesson.edgePrompt && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Edge Prompt</h3>
          <p className="text-black/80 italic leading-relaxed">"{lesson.edgePrompt}"</p>
        </section>
      )}

      {lesson.adultEpisode && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Adult Episode</h3>
          <p className="text-black/70">{lesson.adultEpisode}</p>
        </section>
      )}

      {lesson.externalResources && lesson.externalResources.length > 0 && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Resources</h3>
          <ul className="list-disc list-inside space-y-1 text-black/70">
            {lesson.externalResources.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>
      )}

      {lesson.audioUrl && (
        <section className="mb-8">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-black/40 mb-2">Audio</h3>
          <audio controls src={lesson.audioUrl} className="w-full max-w-md" />
        </section>
      )}
    </div>
  );
}

export default function AdminCurriculum() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMovement, setFilterMovement] = useState<MovementId | 'all'>('all');

  const filtered = LESSONS.filter(l => {
    if (filterMovement !== 'all' && l.movement !== filterMovement) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.title.toLowerCase().includes(q) ||
        l.themeSummary?.toLowerCase().includes(q) ||
        l.adultIdea?.toLowerCase().includes(q) ||
        String(l.number).includes(q)
      );
    }
    return true;
  });

  const lessonsByMovement = MOVEMENTS.map(m => ({
    ...m,
    lessons: filtered.filter(l => l.movement === m.id),
  }));

  if (selectedLesson) {
    return <LessonDetail lesson={selectedLesson} onBack={() => setSelectedLesson(null)} />;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Curriculum</h1>
          <p className="text-black/50 mt-1">{LESSONS.length} lessons across {MOVEMENTS.length} movements</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-black/10 rounded-lg text-sm bg-white w-64"
          />
          <select
            value={filterMovement}
            onChange={e => setFilterMovement(e.target.value as MovementId | 'all')}
            className="px-3 py-2 border border-black/10 rounded-lg text-sm bg-white"
          >
            <option value="all">All movements</option>
            {MOVEMENTS.map(m => (
              <option key={m.id} value={m.id}>{m.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {lessonsByMovement.map(({ id, label, number, lessons }) => (
          lessons.length > 0 && (
            <div key={id}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl font-bold">Movement {number}</span>
                <span className="text-black/40">·</span>
                <span className="text-black/50">{label}</span>
                <span className="text-black/30 text-sm ml-auto">{lessons.length} lessons</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lessons.map(lesson => (
                  <LessonCard key={lesson.number} lesson={lesson} onSelect={setSelectedLesson} />
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
