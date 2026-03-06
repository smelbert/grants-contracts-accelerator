import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Trash2, GripVertical, Plus, Type, FileText, AlertCircle,
  List, Quote, BarChart3, Image as ImageIcon, ChevronDown
} from 'lucide-react';

const SECTION_TYPES = {
  title: { label: 'Title', icon: Type, color: 'blue' },
  heading: { label: 'Heading', icon: Type, color: 'blue' },
  body: { label: 'Body Text', icon: FileText, color: 'slate' },
  callout: { label: 'Callout / Alert', icon: AlertCircle, color: 'amber' },
  list: { label: 'List', icon: List, color: 'green' },
  quote: { label: 'Quote', icon: Quote, color: 'purple' },
  table: { label: 'Table', icon: BarChart3, color: 'indigo' },
  image: { label: 'Image', icon: ImageIcon, color: 'pink' },
  custom: { label: 'Custom', icon: FileText, color: 'slate' }
};

export default function TemplateSectionBuilder({ sections, onChange }) {
  const [showAddMenu, setShowAddMenu] = useState(false);

  const addSection = (type) => {
    const newSection = {
      id: `section-${Date.now()}`,
      type,
      title: SECTION_TYPES[type].label,
      content: '',
      ...(type === 'list' && { items: ['Item 1', 'Item 2'] }),
      ...(type === 'table' && { rows: [['Column 1', 'Column 2']] })
    };
    onChange([...sections, newSection]);
    setShowAddMenu(false);
  };

  const removeSection = (id) => {
    onChange(sections.filter(s => s.id !== id));
  };

  const updateSection = (id, updates) => {
    onChange(sections.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const reordered = Array.from(sections);
    const [removed] = reordered.splice(source.index, 1);
    reordered.splice(destination.index, 0, removed);
    onChange(reordered);
  };

  return (
    <div className="space-y-4">
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`space-y-3 p-4 rounded-lg border-2 border-dashed transition-colors ${
                snapshot.isDraggingOver
                  ? 'bg-blue-50 border-blue-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              {sections.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-sm">
                  No sections yet. Add your first section below.
                </p>
              ) : (
                sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`transition-all ${
                          snapshot.isDragging
                            ? 'shadow-lg ring-2 ring-blue-500'
                            : 'shadow-sm'
                        }`}
                      >
                        <SectionCard
                          section={section}
                          dragHandleProps={provided.dragHandleProps}
                          onUpdate={(updates) => updateSection(section.id, updates)}
                          onRemove={() => removeSection(section.id)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Add Section Menu */}
      <div className="relative">
        <Button
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>

        {showAddMenu && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg grid grid-cols-2 gap-2 p-3 z-10">
            {Object.entries(SECTION_TYPES).map(([key, config]) => {
              const Icon = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => addSection(key)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-700`}
                >
                  <Icon className={`w-4 h-4 text-${config.color}-600`} />
                  {config.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ section, dragHandleProps, onUpdate, onRemove }) {
  const config = SECTION_TYPES[section.type];
  const Icon = config.icon;
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="border border-slate-200">
      <CardHeader className="pb-3 flex flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <button
            {...dragHandleProps}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-slate-400" />
          </button>
          <Icon className={`w-4 h-4 text-${config.color}-600`} />
          <span className="text-sm font-medium text-slate-700">{config.label}</span>
          <span className="text-xs text-slate-500">({section.type})</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-slate-100 rounded transition-colors"
          >
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded ? '' : '-rotate-90'}`} />
          </button>
          <button
            onClick={onRemove}
            className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </CardHeader>

      {expanded && (
        <CardContent className="space-y-4 pt-0">
          {/* Section Title */}
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">
              Section Title / Label
            </label>
            <Input
              value={section.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder={`e.g., ${config.label}`}
              className="text-sm"
            />
          </div>

          {/* Content based on type */}
          {section.type === 'title' && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Title Text
              </label>
              <Input
                value={section.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter title"
                className="text-sm font-bold"
              />
            </div>
          )}

          {section.type === 'heading' && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Heading Text
              </label>
              <Input
                value={section.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter heading"
                className="text-sm font-semibold"
              />
              <div className="mt-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Level
                </label>
                <select
                  value={section.level || 'h2'}
                  onChange={(e) => onUpdate({ level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="h1">H1 (Large)</option>
                  <option value="h2">H2 (Medium)</option>
                  <option value="h3">H3 (Small)</option>
                </select>
              </div>
            </div>
          )}

          {(section.type === 'body' || section.type === 'custom') && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Content
              </label>
              <Textarea
                value={section.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter content"
                rows={3}
                className="text-sm"
              />
            </div>
          )}

          {section.type === 'callout' && (
            <>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Callout Content
                </label>
                <Textarea
                  value={section.content || ''}
                  onChange={(e) => onUpdate({ content: e.target.value })}
                  placeholder="Enter callout text"
                  rows={2}
                  className="text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Type
                </label>
                <select
                  value={section.calloutType || 'info'}
                  onChange={(e) => onUpdate({ calloutType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="info">Info</option>
                  <option value="warning">Warning</option>
                  <option value="success">Success</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </>
          )}

          {section.type === 'list' && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                List Items (one per line)
              </label>
              <Textarea
                value={(section.items || []).join('\n')}
                onChange={(e) =>
                  onUpdate({
                    items: e.target.value
                      .split('\n')
                      .map((item) => item.trim())
                      .filter(Boolean)
                  })
                }
                placeholder="Item 1&#10;Item 2&#10;Item 3"
                rows={3}
                className="text-sm"
              />
              <div className="mt-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  List Type
                </label>
                <select
                  value={section.listType || 'bullet'}
                  onChange={(e) => onUpdate({ listType: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                >
                  <option value="bullet">Bullet Points</option>
                  <option value="numbered">Numbered</option>
                  <option value="checkbox">Checkboxes</option>
                </select>
              </div>
            </div>
          )}

          {section.type === 'quote' && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Quote Text
              </label>
              <Textarea
                value={section.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Enter quote"
                rows={2}
                className="text-sm italic"
              />
              <div className="mt-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Attribution (optional)
                </label>
                <Input
                  value={section.attribution || ''}
                  onChange={(e) => onUpdate({ attribution: e.target.value })}
                  placeholder="Author name"
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {section.type === 'image' && (
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">
                Image URL
              </label>
              <Input
                value={section.content || ''}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="text-sm"
              />
              <div className="mt-2">
                <label className="text-xs font-medium text-slate-600 mb-1 block">
                  Alt Text
                </label>
                <Input
                  value={section.altText || ''}
                  onChange={(e) => onUpdate({ altText: e.target.value })}
                  placeholder="Description for accessibility"
                  className="text-sm"
                />
              </div>
            </div>
          )}

          {section.type === 'table' && (
            <div className="text-xs text-slate-600 p-3 bg-slate-50 rounded-lg">
              <p className="mb-2 font-medium">Table editing in table preview below</p>
              <p>Configure basic table structure and edit content directly in preview.</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}