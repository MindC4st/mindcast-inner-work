import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LESSONS, MOVEMENTS, type Lesson } from '../data/curriculumData';

function LessonCard({ lesson }: { lesson: Lesson }) {
  return (
    <Link
      to={`/curriculum/${lesson.number}`}
      className="block border border-black/10 rounded-xl p-4 hover:border-black/30 transition-colors bg-white"
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs text-black/40 font-mono">Lesson {lesson.number}</span>
          <h3 className="font-semibold text-base leading-tight mt-0.5">{lesson.title}</h3>
        </div>
        <span className="text-sm text-black/30 shrink-0 ml-2">→</span>
      </div>
      {lesson.themeSummary && (
        <p className="text-sm text-black/60 line-clamp-2">{lesson.themeSummary}</p>
      )}
      <div className="flex flex-wrap gap-2 mt-3 text-xs text-black/40">
        {lesson.digQuestions && <span>📝 {Object.keys(lesson.digQuestions).length} reflection questions</span>}
        {lesson.externalResources && lesson.externalResources.length > 0 && (
          <span>📚 {lesson.externalResources.length} resources</span>
        )}
      </div>
    </Link>
  );
}

export default function Curriculum() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">Curriculum</h1>
        <p className="text-black/60 mt-3 text-lg leading-relaxed max-w-2xl">
          The Inner Workings program is organised into four movements, each building
          on the last. Work through them in order, or explore what calls to you.
        </p>
      </div>

      <div className="space-y-12">
        {MOVEMENTS.map(({ id, label, number, description }) => (
          <div key={id}>
            <div className="flex items-baseline gap-3 mb-6">
              <span className="text-sm font-semibold uppercase tracking-wider text-black/40">
                Movement {number}
              </span>
              <span className="text-xl font-semibold text-black/70">
                {label.replace(/^[IV]+ — /, '')}
              </span>
              <span className="text-xs text-black/30 ml-auto">
                {LESSONS.filter(l => l.movement === id).length} lessons
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LESSONS.filter(l => l.movement === id).map(lesson => (
                <LessonCard key={lesson.number} lesson={lesson} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
