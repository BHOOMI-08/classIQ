import React, { useState } from 'react';
import { RotateCw, BookOpen, ChevronLeft, ChevronRight, Check } from 'lucide-react';

export default function Flashcard({ cards = [], onBookmark }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());

  if (!cards || cards.length === 0) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400">
        No flashcards generated yet. Select a topic and generate.
      </div>
    );
  }

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const toggleBookmark = (id) => {
    const nextSet = new Set(bookmarkedIds);
    if (nextSet.has(id)) nextSet.delete(id);
    else nextSet.add(id);
    setBookmarkedIds(nextSet);
    if (onBookmark) onBookmark(id);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* 3D Flip Card Container */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="w-full min-h-[220px] bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition shadow-2xl relative overflow-hidden"
      >
        <div className="flex items-center justify-between text-[10px] text-slate-400">
          <span className="font-bold text-indigo-400 uppercase tracking-wider">
            Flashcard {currentIndex + 1} of {cards.length}
          </span>
          <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">
            {isFlipped ? 'BACK (ANSWER)' : 'FRONT (QUESTION)'}
          </span>
        </div>

        <div className="py-6 text-center space-y-2">
          <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-snug">
            {isFlipped ? currentCard.back : currentCard.front}
          </h3>
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <RotateCw className="w-3 h-3 text-indigo-400" /> Click card to flip
          </p>
        </div>

        {currentCard.citation && (
          <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1 text-indigo-300">
              <BookOpen className="w-3 h-3" /> Citation: {currentCard.citation}
            </span>
          </div>
        )}
      </div>

      {/* Card Nav Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition flex items-center gap-1 text-xs font-bold"
        >
          <ChevronLeft className="w-4 h-4" /> Previous
        </button>

        <button
          onClick={() => toggleBookmark(currentCard.id || currentIndex)}
          className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
            bookmarkedIds.has(currentCard.id || currentIndex)
              ? 'bg-amber-950 text-amber-300 border-amber-800'
              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
          }`}
        >
          {bookmarkedIds.has(currentCard.id || currentIndex) ? '★ Bookmarked' : '☆ Bookmark'}
        </button>

        <button
          onClick={handleNext}
          className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition flex items-center gap-1 text-xs font-bold"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
