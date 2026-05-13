import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Lightbulb, X, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Renders document text with highlighted comment markers and a selection toolbar.
 * Calls onAddComment({ highlighted_text, highlight_start, highlight_end, comment_type })
 */
export default function InlineCommentHighlighter({ content, comments = [], canComment = false, onAddComment, readOnly = false }) {
  const containerRef = useRef(null);
  const [selection, setSelection] = useState(null); // { text, start, end, x, y }
  const [pendingComment, setPendingComment] = useState(null); // { type: 'highlight'|'suggestion', text, start, end }
  const [commentText, setCommentText] = useState('');
  const [suggestedText, setSuggestedText] = useState('');

  const handleMouseUp = useCallback(() => {
    if (!canComment || !containerRef.current) return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) { setSelection(null); return; }
    const selectedText = sel.toString().trim();
    if (!selectedText) { setSelection(null); return; }

    // Calculate character offsets relative to the text content
    const range = sel.getRangeAt(0);
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(containerRef.current);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();
    setSelection({
      text: selectedText,
      start,
      end,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top - 44,
    });
  }, [canComment]);

  const openCommentForm = (type) => {
    if (!selection) return;
    setPendingComment({ type, text: selection.text, start: selection.start, end: selection.end });
    if (type === 'suggestion') setSuggestedText(selection.text);
    setCommentText('');
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const submitComment = () => {
    if (!pendingComment) return;
    onAddComment?.({
      comment_type: pendingComment.type === 'suggestion' ? 'suggestion' : 'highlight',
      highlighted_text: pendingComment.text,
      highlight_start: pendingComment.start,
      highlight_end: pendingComment.end,
      comment_text: commentText,
      suggested_replacement: pendingComment.type === 'suggestion' ? suggestedText : undefined,
    });
    setPendingComment(null);
    setCommentText('');
    setSuggestedText('');
  };

  // Build a list of highlight ranges from comments
  const highlights = comments.filter(c => c.highlighted_text && c.highlight_start != null && !c.is_resolved);

  // Render text with overlapping highlight spans
  const renderHighlightedText = () => {
    if (!highlights.length) return <span>{content}</span>;

    // Build sorted list of start/end positions
    const events = [];
    highlights.forEach((c, idx) => {
      events.push({ pos: c.highlight_start, type: 'start', idx });
      events.push({ pos: c.highlight_end, type: 'end', idx });
    });
    events.sort((a, b) => a.pos - b.pos || (a.type === 'end' ? -1 : 1));

    const segments = [];
    let cursor = 0;
    const active = new Set();

    events.forEach(ev => {
      if (ev.pos > cursor) {
        const chunk = content.slice(cursor, ev.pos);
        const isHighlighted = active.size > 0;
        const isSuggestion = [...active].some(i => highlights[i]?.comment_type === 'suggestion');
        segments.push(
          <span key={`seg-${cursor}`} className={cn(
            isHighlighted && 'rounded px-0.5',
            isSuggestion ? 'bg-amber-200 border-b-2 border-amber-500' : isHighlighted ? 'bg-yellow-200 border-b-2 border-yellow-500' : ''
          )}>{chunk}</span>
        );
        cursor = ev.pos;
      }
      if (ev.type === 'start') active.add(ev.idx);
      else active.delete(ev.idx);
    });

    if (cursor < content.length) {
      segments.push(<span key={`seg-end`}>{content.slice(cursor)}</span>);
    }
    return segments;
  };

  return (
    <div className="relative">
      {/* Text display */}
      <div
        ref={containerRef}
        className={cn('text-sm text-slate-700 whitespace-pre-wrap leading-relaxed p-4 bg-slate-50 rounded-lg border border-slate-200 select-text', canComment && 'cursor-text')}
        onMouseUp={handleMouseUp}
      >
        {renderHighlightedText()}
      </div>

      {/* Selection toolbar */}
      {selection && canComment && (
        <div
          className="absolute z-20 flex gap-1.5 bg-slate-900 rounded-lg shadow-xl px-2 py-1.5 pointer-events-auto"
          style={{ left: Math.max(0, selection.x - 80), top: selection.y }}
        >
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-white hover:bg-slate-700 text-xs gap-1 px-2"
            onClick={() => openCommentForm('highlight')}
          >
            <MessageSquare className="w-3 h-3" /> Comment
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-amber-300 hover:bg-slate-700 text-xs gap-1 px-2"
            onClick={() => openCommentForm('suggestion')}
          >
            <Lightbulb className="w-3 h-3" /> Suggest Edit
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-slate-400 hover:bg-slate-700 px-1.5"
            onClick={() => { setSelection(null); window.getSelection()?.removeAllRanges(); }}
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      )}

      {/* Comment / Suggestion form */}
      {pendingComment && (
        <div className="mt-3 border border-slate-300 rounded-xl bg-white shadow-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <Badge className={cn('text-xs', pendingComment.type === 'suggestion' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700')}>
                {pendingComment.type === 'suggestion' ? '✏️ Suggest Edit' : '💬 Comment'}
              </Badge>
              <p className="text-xs text-slate-500 mt-1.5 italic">"{pendingComment.text.slice(0, 80)}{pendingComment.text.length > 80 ? '...' : ''}"</p>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setPendingComment(null)}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {pendingComment.type === 'suggestion' && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">Suggested replacement text</label>
              <Textarea
                value={suggestedText}
                onChange={e => setSuggestedText(e.target.value)}
                className="text-sm min-h-[60px] border-amber-300 focus:ring-amber-400"
                placeholder="Type your suggested replacement..."
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-600">{pendingComment.type === 'suggestion' ? 'Reason / context (optional)' : 'Your comment'}</label>
            <Textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              className="text-sm min-h-[60px]"
              placeholder={pendingComment.type === 'suggestion' ? 'Explain why this change improves the document...' : 'Add your comment...'}
              autoFocus
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setPendingComment(null)}>Cancel</Button>
            <Button
              size="sm"
              className={cn(pendingComment.type === 'suggestion' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-[#143A50] hover:bg-[#1E4F58]', 'gap-1.5')}
              disabled={pendingComment.type !== 'suggestion' && !commentText.trim()}
              onClick={submitComment}
            >
              <Check className="w-3.5 h-3.5" />
              {pendingComment.type === 'suggestion' ? 'Submit Suggestion' : 'Post Comment'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}