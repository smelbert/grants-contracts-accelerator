import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

export default function MatchingActivity({ activity }) {
  const [selected, setSelected] = useState({ term: null, definition: null });
  const [matched, setMatched] = useState(new Set());
  const [incorrect, setIncorrect] = useState(null);
  const [shuffledDefs, setShuffledDefs] = useState([]);

  const items = activity.items || [];

  useEffect(() => {
    const defs = items.map(item => ({
      id: item.id,
      text: item.answer || item.definition
    }));
    setShuffledDefs(defs.sort(() => Math.random() - 0.5));
  }, [activity]);

  const handleTermClick = (item) => {
    if (matched.has(item.id)) return;
    
    setIncorrect(null);
    const newSelected = { ...selected, term: item };
    setSelected(newSelected);

    if (newSelected.term && newSelected.definition) {
      if (newSelected.term.id === newSelected.definition.id) {
        setMatched(new Set([...matched, item.id]));
        setSelected({ term: null, definition: null });
      } else {
        setIncorrect({ term: newSelected.term.id, def: newSelected.definition.id });
        setTimeout(() => {
          setIncorrect(null);
          setSelected({ term: null, definition: null });
        }, 1000);
      }
    }
  };

  const handleDefClick = (def) => {
    if (matched.has(def.id)) return;
    
    setIncorrect(null);
    const newSelected = { ...selected, definition: def };
    setSelected(newSelected);

    if (newSelected.term && newSelected.definition) {
      if (newSelected.term.id === newSelected.definition.id) {
        setMatched(new Set([...matched, def.id]));
        setSelected({ term: null, definition: null });
      } else {
        setIncorrect({ term: newSelected.term.id, def: newSelected.definition.id });
        setTimeout(() => {
          setIncorrect(null);
          setSelected({ term: null, definition: null });
        }, 1000);
      }
    }
  };

  const handleReset = () => {
    setMatched(new Set());
    setSelected({ term: null, definition: null });
    setIncorrect(null);
    setShuffledDefs(shuffledDefs.sort(() => Math.random() - 0.5));
  };

  const allMatched = matched.size === items.length && items.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Matched: {matched.size} / {items.length}
        </p>
        <Button variant="outline" size="sm" onClick={handleReset}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>

      {allMatched && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-4 text-center"
        >
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
          <p className="text-lg font-semibold text-emerald-900">Perfect! You matched them all!</p>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Terms Column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 mb-4">Terms</h3>
          {items.map((item) => {
            const isMatched = matched.has(item.id);
            const isSelected = selected.term?.id === item.id;
            const isIncorrect = incorrect?.term === item.id;

            return (
              <motion.div
                key={item.id}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
              >
                <Card
                  onClick={() => handleTermClick(item)}
                  className={`cursor-pointer transition-all ${
                    isMatched ? 'bg-emerald-50 border-emerald-400 opacity-60' :
                    isSelected ? 'bg-blue-50 border-blue-400 border-2' :
                    isIncorrect ? 'bg-red-50 border-red-400 border-2' :
                    'hover:border-slate-400'
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="font-medium text-slate-900">
                      {item.question || item.term}
                    </span>
                    {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Definitions Column */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900 mb-4">Definitions</h3>
          {shuffledDefs.map((def) => {
            const isMatched = matched.has(def.id);
            const isSelected = selected.definition?.id === def.id;
            const isIncorrect = incorrect?.def === def.id;

            return (
              <motion.div
                key={def.id}
                whileHover={!isMatched ? { scale: 1.02 } : {}}
                whileTap={!isMatched ? { scale: 0.98 } : {}}
              >
                <Card
                  onClick={() => handleDefClick(def)}
                  className={`cursor-pointer transition-all ${
                    isMatched ? 'bg-emerald-50 border-emerald-400 opacity-60' :
                    isSelected ? 'bg-blue-50 border-blue-400 border-2' :
                    isIncorrect ? 'bg-red-50 border-red-400 border-2' :
                    'hover:border-slate-400'
                  }`}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-slate-700">{def.text}</span>
                    {isMatched && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                    {isIncorrect && <XCircle className="w-5 h-5 text-red-600" />}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}