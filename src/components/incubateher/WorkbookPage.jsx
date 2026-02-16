import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Lightbulb, Target, CheckSquare, AlertCircle, TrendingUp } from 'lucide-react';
import PersonalizedGuidance from './PersonalizedGuidance';

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

export default function WorkbookPage({ page, responses, onResponseChange, assessmentResults, customContent = null }) {
  // Use custom content if available, otherwise use default
  // For content field, prefer customContent over default to ensure admin edits show
  const displayPage = customContent 
    ? { 
        ...page, 
        title: customContent.title || page.title,
        subtitle: customContent.subtitle || page.subtitle,
        content: customContent.content || page.content,
        video_url: customContent.video_url || page.video_url,
        video_description: customContent.video_description || page.video_description,
        takeaways: customContent.takeaways || page.takeaways,
        action_items: customContent.action_items || page.action_items
      }
    : page;
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
    <div className="bg-white shadow-2xl mx-auto overflow-visible" style={{ width: '816px' }}>
      {/* Professional Header with Full Branding */}
      <div className="bg-gradient-to-b from-slate-200 via-[#143A50] to-[#1E4F58] px-8 py-3 border-b-4 border-[#E5C089]">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-lg p-2 shadow-md">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/54239c095_image.png" 
                alt="Columbus Urban League - IncubateHer" 
                className="h-12"
              />
            </div>
            <div className="h-12 w-px bg-white/30" />
            <div className="bg-white rounded-lg p-2 shadow-md">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69718907de4a3924f5e6155c/f1267a80a_EISLogotransparent.png" 
                alt="EIS Logo" 
                className="h-10"
              />
            </div>
          </div>
          <PageTypeBadge type={page.type} />
        </div>
        <div className="border-t border-white/20 pt-2">
          <h2 className="text-xl font-bold text-white mb-0.5">{displayPage.title}</h2>
          {displayPage.subtitle && (
            <p className="text-[#E5C089] text-xs font-medium">{displayPage.subtitle}</p>
          )}
        </div>
      </div>

      {/* Content Area with Full-Page Layout */}
      <div className="px-8 py-4 space-y-4">

        {/* Personalized Guidance Based on Assessment */}
        <PersonalizedGuidance 
          assessmentResults={assessmentResults}
          currentSection={page.section}
        />

        {/* Key Takeaways Callout */}
        {displayPage.takeaways && (
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-[#143A50]" />
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-2 border-blue-300 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-blue-900">Key Takeaways</h3>
              </div>
              <ul className="space-y-2 text-sm text-blue-900 ml-13">
                {displayPage.takeaways.map((takeaway, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>{takeaway}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Action Items Callout */}
        {(displayPage.actionItems || displayPage.action_items) && (
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-[#E5C089]" />
            <div className="bg-gradient-to-br from-amber-50 to-amber-100/50 border-2 border-amber-300 rounded-xl p-4 shadow-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-amber-600 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-amber-900">Action Items</h3>
              </div>
              <ul className="space-y-2 text-sm text-amber-900 ml-13">
                {(displayPage.actionItems || displayPage.action_items || []).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-amber-600 font-bold mt-0.5">→</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Video Content with Enhanced Callout */}
        {displayPage.video_url && (
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-[#AC1A5B]" />
            <div className="bg-gradient-to-br from-[#E5C089]/10 to-[#E5C089]/5 rounded-xl p-4 border-2 border-[#E5C089] shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#AC1A5B] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[#143A50]">📹 Watch & Learn</h3>
              </div>
              <div className="aspect-video rounded-lg overflow-hidden bg-slate-900 shadow-xl border-2 border-slate-300">
                {getVideoEmbedUrl(displayPage.video_url)?.startsWith('http') ? (
                  <iframe
                    src={getVideoEmbedUrl(displayPage.video_url)}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={displayPage.video_url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
              {displayPage.video_description && (
                <p className="text-sm text-slate-700 mt-4 italic">{displayPage.video_description}</p>
              )}
            </div>
          </div>
        )}

        {/* Page Content with Educational Styling */}
        {displayPage.content && (
          <div className="bg-white rounded-xl p-4 border-2 border-slate-200 shadow-sm">
            <div 
              className="prose prose-slate max-w-none 
                prose-headings:text-[#143A50] prose-headings:font-bold prose-headings:mb-4
                prose-h3:text-xl prose-h3:mt-6 prose-h3:border-b-2 prose-h3:border-[#E5C089] prose-h3:pb-2
                prose-a:text-[#AC1A5B] prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
                prose-strong:text-[#143A50] prose-strong:font-bold
                prose-ul:space-y-2 prose-ul:my-4
                prose-li:text-slate-700 prose-li:leading-relaxed
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-4
                prose-table:border-collapse prose-table:w-full
                prose-th:bg-[#143A50] prose-th:text-white prose-th:p-3 prose-th:text-left prose-th:font-semibold
                prose-td:border prose-td:border-slate-300 prose-td:p-3
                prose-blockquote:border-l-4 prose-blockquote:border-[#E5C089] prose-blockquote:bg-[#E5C089]/5 prose-blockquote:pl-4 prose-blockquote:py-2"
              dangerouslySetInnerHTML={{ __html: displayPage.content }}
            />
          </div>
        )}

        {/* Interactive Fields with Educational Callout */}
        {page.fields && page.fields.length > 0 && (
          <div className="relative">
            <div className="absolute -left-4 top-0 w-1 h-full bg-[#AC1A5B]" />
            <div className="bg-gradient-to-br from-[#E5C089]/10 to-[#E5C089]/5 border-2 border-[#E5C089] rounded-xl p-4 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#143A50] flex items-center justify-center">
                  <CheckSquare className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-lg font-bold text-[#143A50]">Fill In Your Responses</h3>
              </div>
              <p className="text-xs text-slate-600 italic mb-4 pl-11">
                Complete each field below. Your responses are automatically saved as you type.
              </p>
              <div className={page.id === 'toolkit_checklist' ? 'grid grid-cols-3 gap-3' : 'space-y-4'}>
                {page.fields.map((field) => {
                  const fieldValue = responses?.[field.id] || '';

                  switch (field.type) {
                case 'textarea':
                  return (
                    <div key={field.id} className="bg-white rounded-lg p-3 border border-slate-300">
                      <Label className="text-sm mb-1.5 block font-semibold text-[#143A50]">
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
                    <div key={field.id} className="bg-white rounded-lg p-3 border border-slate-300">
                      <Label className="text-sm mb-1.5 block font-semibold text-[#143A50]">
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
                    <div key={field.id} className="bg-white rounded-lg p-3 border border-slate-300">
                      <Label className="text-sm mb-2 block font-semibold text-[#143A50]">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                      )}
                      <RadioGroup value={fieldValue} onValueChange={(val) => handleFieldChange(field.id, val)}>
                        {field.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2 mb-2 p-1.5 hover:bg-slate-50 rounded">
                            <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                            <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer flex-1 text-sm">
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
          </div>
        )}
      </div>

      {/* Professional Footer with Page Info */}
      <div className="bg-gradient-to-r from-[#143A50] to-[#1E4F58] px-8 py-2 border-t-4 border-[#E5C089] mt-auto">
        <div className="flex items-center justify-between text-sm">
          <div className="text-white/90">
            <span className="font-bold text-white">IncubateHer</span>
            <span className="text-white/60 mx-2">|</span>
            <span className="text-[#E5C089]">Funding Readiness: Preparing for Grants & Contracts</span>
          </div>
          <div className="text-white/60 text-xs">
            Funded by Columbus Urban League | Delivered by Elbert Innovative Solutions
          </div>
        </div>
      </div>
    </div>
  );
}