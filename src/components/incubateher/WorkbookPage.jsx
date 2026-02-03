import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Lightbulb, Target, CheckSquare } from 'lucide-react';

const PageTypeIcon = ({ type }) => {
  const icons = {
    worksheet: <FileText className="w-5 h-5 text-green-600" />,
    handout: <FileText className="w-5 h-5 text-blue-600" />,
    tips: <Lightbulb className="w-5 h-5 text-purple-600" />,
    consultation: <Target className="w-5 h-5 text-amber-600" />
  };
  return icons[type] || null;
};

const PageTypeBadge = ({ type }) => {
  const badges = {
    worksheet: { bg: 'bg-green-100', text: 'text-green-800', label: '📝 Worksheet' },
    handout: { bg: 'bg-blue-100', text: 'text-blue-800', label: '📄 Handout' },
    tips: { bg: 'bg-purple-100', text: 'text-purple-800', label: '💡 Tips-Only' },
    consultation: { bg: 'bg-amber-100', text: 'text-amber-800', label: '🎯 Consultation Tool' }
  };
  const badge = badges[type] || badges.handout;
  return (
    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
      {badge.label}
    </span>
  );
};

export default function WorkbookPage({ page, responses, onResponseChange }) {
  const handleFieldChange = (fieldId, value) => {
    onResponseChange(page.id, fieldId, value);
  };

  const getVideoEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }
    
    // Direct video URL
    return url;
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Professional Header with Branding */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <img 
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
              alt="EIS Logo" 
              className="h-10 bg-white rounded px-2 py-1"
            />
            <div className="h-8 w-px bg-white/30" />
            <img 
              src="https://columbusfoundation.org/getmedia/41f05a72-5e52-4f0c-920b-6ed7b1a7e25f/ColumbusUrbanLeague-min.jpg" 
              alt="CUL Logo" 
              className="h-10 bg-white rounded px-2 py-1"
            />
          </div>
          <PageTypeBadge type={page.type} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">{page.title}</h2>
          {page.subtitle && (
            <p className="text-[#E5C089] text-sm">{page.subtitle}</p>
          )}
        </div>
      </div>

      {/* Content Area with Professional Spacing */}
      <div className="px-8 py-6 space-y-6">

        {/* Video Content */}
        {page.video_url && (
          <div className="bg-slate-50 rounded-lg p-6 border-2 border-[#E5C089]">
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 shadow-lg">
              {getVideoEmbedUrl(page.video_url)?.startsWith('http') ? (
                <iframe
                  src={getVideoEmbedUrl(page.video_url)}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  src={page.video_url}
                  controls
                  className="w-full h-full"
                />
              )}
            </div>
            {page.video_description && (
              <p className="text-sm text-slate-600 mt-4">{page.video_description}</p>
            )}
          </div>
        )}

        {/* Page Content */}
        {page.content && (
          <div className="bg-white border border-slate-200 rounded-lg p-6">
            <div 
              className="prose prose-slate max-w-none prose-headings:text-[#143A50] prose-a:text-[#AC1A5B] prose-strong:text-[#143A50]"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </div>
        )}

        {/* Interactive Fields */}
        {page.fields && page.fields.length > 0 && (
          <div className="bg-[#E5C089]/10 border-2 border-[#E5C089] rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b-2 border-[#E5C089]">
              <CheckSquare className="w-6 h-6 text-[#143A50]" />
              <h3 className="text-xl font-bold text-[#143A50]">Your Responses</h3>
            </div>
            <div className="space-y-6">
            {page.fields.map((field) => {
              const fieldValue = responses?.[field.id] || '';

              switch (field.type) {
                case 'textarea':
                  return (
                    <div key={field.id} className="bg-white rounded-lg p-4 border border-slate-300">
                      <Label className="text-base mb-2 block font-semibold text-[#143A50]">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                      )}
                      <Textarea
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows || 4}
                        className="w-full border-2 border-slate-300 focus:border-[#E5C089] focus:ring-2 focus:ring-[#E5C089]/20"
                      />
                    </div>
                  );

                case 'input':
                  return (
                    <div key={field.id} className="bg-white rounded-lg p-4 border border-slate-300">
                      <Label className="text-base mb-2 block font-semibold text-[#143A50]">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                      )}
                      <Input
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full border-2 border-slate-300 focus:border-[#E5C089] focus:ring-2 focus:ring-[#E5C089]/20"
                      />
                    </div>
                  );

                case 'radio':
                  return (
                    <div key={field.id} className="bg-white rounded-lg p-4 border border-slate-300">
                      <Label className="text-base mb-3 block font-semibold text-[#143A50]">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                      )}
                      <RadioGroup value={fieldValue} onValueChange={(val) => handleFieldChange(field.id, val)}>
                        {field.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-3 mb-3 p-2 hover:bg-slate-50 rounded">
                            <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                            <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer flex-1">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  );

                case 'checkbox':
                  return (
                    <div key={field.id} className="bg-white rounded-lg p-4 border border-slate-300">
                      <Label className="text-base mb-3 block font-semibold text-[#143A50]">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                      )}
                      <div className="space-y-2">
                        {field.options.map((option) => {
                          const isChecked = Array.isArray(fieldValue) && fieldValue.includes(option.value);
                          return (
                            <div key={option.value} className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded">
                              <Checkbox
                                id={`${field.id}-${option.value}`}
                                checked={isChecked}
                                onCheckedChange={(checked) => {
                                  const currentValues = Array.isArray(fieldValue) ? fieldValue : [];
                                  const newValues = checked
                                    ? [...currentValues, option.value]
                                    : currentValues.filter(v => v !== option.value);
                                  handleFieldChange(field.id, newValues);
                                }}
                              />
                              <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer flex-1">
                                {option.label}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );

                case 'table':
                  return (
                    <div key={field.id} className="bg-white rounded-lg p-4 border border-slate-300">
                      <Label className="text-base mb-3 block font-semibold text-[#143A50]">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-[#143A50]">
                              {field.columns.map((col) => (
                                <th key={col.id} className="border border-slate-300 p-3 text-left font-semibold text-sm text-white">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {Array.from({ length: field.rows || 3 }).map((_, rowIdx) => {
                              const rowData = (Array.isArray(fieldValue) ? fieldValue[rowIdx] : {}) || {};
                              return (
                                <tr key={rowIdx} className="hover:bg-slate-50">
                                  {field.columns.map((col) => (
                                    <td key={col.id} className="border border-slate-300 p-2">
                                      <Input
                                        value={rowData[col.id] || ''}
                                        onChange={(e) => {
                                          const newRows = Array.isArray(fieldValue) ? [...fieldValue] : [];
                                          newRows[rowIdx] = { ...rowData, [col.id]: e.target.value };
                                          handleFieldChange(field.id, newRows);
                                        }}
                                        className="w-full border-slate-300 focus:border-[#E5C089]"
                                      />
                                    </td>
                                  ))}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );

                default:
                  return null;
              }
            })}
            </div>
          </div>
        )}
      </div>

      {/* Professional Footer */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] px-8 py-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/80">
            <span className="font-semibold text-white">IncubateHer</span> | Funding Readiness: Preparing for Grants & Contracts
          </div>
          <div className="text-white/60 text-xs">
            Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions
          </div>
        </div>
      </div>
    </div>
  );
}