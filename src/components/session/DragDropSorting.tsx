import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Check, X, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface DragDropSortingProps {
  instruction: string;
  cards: string[];
  columns: { id: string; label: string; correct: string[] }[];
  storageKey: string;
  onSave: (value: Record<string, string[]>) => void;
  initialValue?: Record<string, string[]>;
}

const DragDropSorting = ({ instruction, cards, columns, storageKey, onSave, initialValue }: DragDropSortingProps) => {
  const [pool, setPool] = useState<string[]>(cards);
  const [zones, setZones] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    columns.forEach((c) => (init[c.id] = []));
    return init;
  });
  const [checked, setChecked] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (initialValue) {
      const usedCards = new Set<string>();
      const restored: Record<string, string[]> = {};
      columns.forEach((c) => {
        restored[c.id] = initialValue[c.id] || [];
        (initialValue[c.id] || []).forEach((card) => usedCards.add(card));
      });
      setZones(restored);
      setPool(cards.filter((c) => !usedCards.has(c)));
    }
  }, []);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;
    const srcId = source.droppableId;
    const dstId = destination.droppableId;
    if (srcId === dstId) return;

    const card = srcId === "pool"
      ? pool[source.index]
      : zones[srcId][source.index];

    // Remove from source
    if (srcId === "pool") {
      setPool((prev) => prev.filter((_, i) => i !== source.index));
    } else {
      setZones((prev) => ({ ...prev, [srcId]: prev[srcId].filter((_, i) => i !== source.index) }));
    }

    // Add to destination
    if (dstId === "pool") {
      setPool((prev) => [...prev.slice(0, destination.index), card, ...prev.slice(destination.index)]);
    } else {
      setZones((prev) => {
        const updated = { ...prev, [dstId]: [...prev[dstId].slice(0, destination.index), card, ...prev[dstId].slice(destination.index)] };
        onSave(updated);
        return updated;
      });
    }
    setChecked(false);
  };

  const checkAnswers = () => {
    const r: Record<string, boolean> = {};
    columns.forEach((col) => {
      zones[col.id].forEach((card) => {
        r[card] = col.correct.includes(card);
      });
    });
    setResults(r);
    setChecked(true);
  };

  const reset = () => {
    setPool(cards);
    const init: Record<string, string[]> = {};
    columns.forEach((c) => (init[c.id] = []));
    setZones(init);
    setChecked(false);
    setResults({});
    onSave(init);
  };

  return (
    <div className="mb-4">
      <p className="text-silver/70 text-xs tracking-[0.2em] mb-6 uppercase">{instruction}</p>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* Card pool */}
        <Droppable droppableId="pool" direction="horizontal">
          {(provided) => (
            <div ref={provided.innerRef} {...provided.droppableProps} className="flex flex-wrap gap-3 mb-8 min-h-[50px] p-4 border-2 border-dashed border-silver/20">
              {pool.map((card, i) => (
                <Draggable key={card} draggableId={card} index={i}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-primary border-2 border-silver/30 px-4 py-2 text-xs tracking-widest text-silver cursor-grab ${snapshot.isDragging ? "opacity-80 rotate-2" : ""}`}>
                      {card}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              {pool.length === 0 && <span className="text-silver/20 text-xs">All cards placed</span>}
            </div>
          )}
        </Droppable>

        {/* Category zones */}
        <div className={`grid gap-6 ${columns.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3"}`}>
          {columns.map((col) => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided, snapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className={`border-2 p-4 min-h-[150px] transition-colors ${snapshot.isDraggingOver ? "border-silver bg-silver/10" : "border-silver/20"}`}>
                  <h4 className="font-display text-lg tracking-widest text-silver text-center mb-4 pb-3 border-b border-silver/10">{col.label}</h4>
                  <div className="space-y-2">
                    {zones[col.id].map((card, i) => (
                      <Draggable key={card} draggableId={card} index={i}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`px-4 py-2 text-xs tracking-widest cursor-grab flex items-center justify-between transition-transform ${
                              checked && results[card] === false ? "animate-[shake_0.3s_ease-in-out]" : ""
                            } ${
                              checked
                                ? results[card]
                                  ? "bg-green-900/30 border-2 border-green-500/50 text-green-300"
                                  : "bg-red-900/30 border-2 border-red-500/50 text-red-300"
                                : "bg-silver/10 border-2 border-silver/20 text-silver"
                            }`}
                          >
                            {card}
                            {checked && (results[card] ? <Check size={14} /> : <X size={14} />)}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <div className="flex gap-3 mt-6">
        <button onClick={checkAnswers} className="btn-filled text-xs py-3 px-6">CHECK MY ANSWERS</button>
        <button onClick={reset} className="btn-outlined text-xs py-3 px-6 flex items-center gap-2"><RotateCcw size={12} /> RESET</button>
      </div>
    </div>
  );
};

export default DragDropSorting;
