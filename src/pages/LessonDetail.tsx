import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { LESSONS_BY_NUMBER, LESSONS, MOVEMENTS, type Lesson } from '../data/curriculumData';

function LessonNav({ currentNumber }: { currentNumber: number }) {
  const prev = LESSONS.find(l => l.number === currentNumber - 1);
  const next = LESSONS.find(l => l.number === currentNumber + 1);

  return (
    <div className="flex items-center justify-between mt-12 pt-8 border-t border-black/10">
      <div>
        {prev && (
          <Link
            to={`/curriculum/${prev.number}`}
            className="text-sm text-black/50 hover:text-black transition-colors flex items-center gap-1"
          >
            ← {prev.title}
          </Link>
        )}
      </div>
      <div className="text-right">
        {next && (
          <Link
            to={`/curriculum/${next.number}`}
            className="text-sm text-black/50 hover:text-black transition-colors flex items-center gap-1 justify-end"
          >
            {next.title} →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function LessonDetail() {
  const { lessonNumber } = useParams<{ lessonNumber: string }>();
  const num = parseInt(lessonNumber || '', 10);
  const lesson = LESSONS_BY_NUMBER.get(num);

  if (!lesson) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Lesson not found</h1>
        <p className="text-black/50 mb-6">There's no lesson with that number.</p>
        <Link to="/curriculum" className="text-sm text-black/60 hover:text-black underline">
          ← Back to curriculum
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link
        to="/curriculum"
        className="text-sm text-black/50 hover:text-black transition-colors inline-flex items-center gap-1 mb-8"
      >
        ← Back to curriculum
      </Link>

      <div className="mb-8">
        <span className="text-sm text-black/40 font-mono">
          Lesson {lesson.number} · {lesson.movementLabel}
        </span>
        <h1 className="text-3xl font-bold mt-1">{lesson.title}</h1>
      </div>

      {lesson.themeSummary && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-3">Overview</h2>
          <p className="text-black/80 leading-relaxed text-lg">{lesson.themeSummary}</p>
        </section>
      )}

      {lesson.adultIdea && (
        <section className="mb-10 bg-stone-50 border border-black/5 rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-3">Key Idea</h2>
          <p className="text-black/80 leading-relaxed italic">{lesson.adultIdea}</p>
        </section>
      )}

      {lesson.digQuestions && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-3">Dig Questions</h2>
          <div className="space-y-4">
            {Object.entries(lesson.digQuestions).map(([key, q]) => (
              q && (
                <div key={key} className="border border-black/10 rounded-xl p-5">
                  <span className="text-xs font-mono text-black/30">QUESTION {key.replace('q', '')}</span>
                  <p className="mt-2 text-black/80 leading-relaxed">{q}</p>
                </div>
              )
            ))}
          </div>
        </section>
      )}

      {lesson.edgePrompt && (
        <section className="mb-10 bg-black text-white rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-white/50 mb-3">Edge Prompt</h2>
          <p className="text-white/90 leading-relaxed italic text-lg">"{lesson.edgePrompt}"</p>
        </section>
      )}

      {lesson.facilitationNotes && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-3">Facilitator Notes</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <p className="text-amber-900/80 leading-relaxed">{lesson.facilitationNotes}</p>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {lesson.teenTrack && (
          <section className="border border-black/10 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-2">Teen Track</h3>
            <p className="text-black/70 text-sm leading-relaxed whitespace-pre-wrap">{lesson.teenTrack}</p>
          </section>
        )}

        {lesson.kidsTrack && (
          <section className="border border-black/10 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-2">Kids Track</h3>
            <p className="text-black/70 text-sm leading-relaxed">{lesson.kidsTrack}</p>
          </section>
        )}

        {lesson.adultEpisode && (
          <section className="border border-black/10 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-2">Recommended Episode</h3>
            <p className="text-black/70 text-sm">{lesson.adultEpisode}</p>
          </section>
        )}
      </div>

      {lesson.externalResources && lesson.externalResources.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-black/40 mb-3">Resources</h2>
          <ul className="space-y-1">
            {lesson.externalResources.map((r, i) => (
              <li key={i} className="text-black/70 text-sm flex items-start gap-2">
                <span className="text-black/30 mt-0.5">•</span>
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}

      <LessonNav currentNumber={lesson.number} />
    </div>
  );
}
