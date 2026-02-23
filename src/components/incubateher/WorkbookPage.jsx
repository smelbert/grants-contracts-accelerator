import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Lightbulb, Target, CheckSquare, AlertCircle, TrendingUp, Sparkles, Users } from 'lucide-react';
import PersonalizedGuidance from './PersonalizedGuidance';
import AIFeedbackPanel from '../workbook/AIFeedbackPanel';
import CollaborationPanel from '../workbook/CollaborationPanel';
import TableEditor from '../shared/TableEditor';
import ChartBuilder from '../shared/ChartBuilder';

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

export default function WorkbookPage({ page, responses, onResponseChange, assessmentResults, customContent = null, organizationProfile = null }) {
  const [activeAIField, setActiveAIField] = useState(null);
  const [activeCollabField, setActiveCollabField] = useState(null);

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

  // Auto-fill logic: Check if field can be populated from profile
  const getPrefilledValue = (fieldId) => {
    if (!organizationProfile) return '';
    
    // Map common field IDs to organization profile fields
    const fieldMappings = {
      'organization_name': 'organization_name',
      'org_name': 'organization_name',
      'mission': 'mission_statement',
      'mission_statement': 'mission_statement',
      'vision': 'vision_statement',
      'vision_statement': 'vision_statement',
      'values': 'organizational_values',
      'programs': 'programs_offered',
      'programs_offered': 'programs_offered',
      'target_population': 'target_population',
      'service_area': 'geographic_service_area',
      'geographic_area': 'geographic_service_area',
      'annual_budget': 'annual_budget',
      'budget': 'annual_budget',
      'funding_sources': 'funding_sources',
      'staff_count': 'staff_count',
      'board_size': 'board_size',
      'executive_director': 'executive_director',
      'ed_name': 'executive_director',
      'board_chair': 'board_chair',
      'phone': 'phone',
      'address': 'mailing_address',
      'mailing_address': 'mailing_address',
      'website': 'website',
      'ein': 'ein',
      'tax_id': 'ein'
    };

    const profileField = fieldMappings[fieldId];
    if (profileField && organizationProfile[profileField]) {
      return organizationProfile[profileField];
    }
    
    return '';
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
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page {
            size: 8.5in 11in;
            margin: 0.75in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .no-print {
            display: none !important;
          }
          .print-page {
            page-break-after: always;
            width: 8.5in;
            min-height: 11in;
            padding: 0;
            margin: 0;
            box-sizing: border-box;
          }
        }
        .print-page {
          width: 8.5in;
          min-height: 11in;
          padding: 0.75in;
          margin: 0 auto;
          background: white;
          box-sizing: border-box;
          position: relative;
          font-family: 'Inter', sans-serif;
        }
        .header-band {
          background: linear-gradient(to right, #0f766e, #14b8a6);
          color: white;
          padding: 16px 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .footer-band {
          position: absolute;
          bottom: 0.5in;
          left: 0.75in;
          right: 0.75in;
          font-size: 10px;
          color: #6b7280;
          display: flex;
          justify-content: space-between;
        }
        @media screen {
          .print-page {
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
        }
      `}} />

      <div className="print-page bg-white shadow-2xl mx-auto">
        {/* Header Band */}
        <div className="header-band">
          <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
            IncubateHer Funding Readiness Workbook
          </div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Preparing for Grants, Proposals & Contracts
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '12px' }}>
            {displayPage.title}
          </div>
          {displayPage.subtitle && (
            <div style={{ fontSize: '12px', marginTop: '4px', opacity: 0.85 }}>
              {displayPage.subtitle}
            </div>
          )}
        </div>

      {/* Content Area */}
      <div className="space-y-4" style={{ fontSize: '12px', lineHeight: 1.6, color: '#111827', paddingBottom: '60px' }}>

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
                  const prefilledTextValue = !fieldValue && getPrefilledValue(field.id);
                  return (
                    <div key={field.id} className="space-y-3">
                      <div className="bg-white rounded-lg p-3 border border-slate-300">
                        <div className="flex items-center justify-between mb-1.5">
                          <Label className="text-sm block font-semibold text-[#143A50]">
                            {field.label}
                          </Label>
                          <div className="flex gap-2">
                            {prefilledTextValue && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleFieldChange(field.id, prefilledTextValue)}
                                className="text-green-600 hover:text-green-700 h-7 px-2"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Use Profile
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveAIField(activeAIField === field.id ? null : field.id)}
                              className="text-purple-600 hover:text-purple-700 h-7 px-2"
                            >
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActiveCollabField(activeCollabField === field.id ? null : field.id)}
                              className="text-blue-600 hover:text-blue-700 h-7 px-2"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Collab
                            </Button>
                          </div>
                        </div>
                        {field.description && (
                          <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                        )}
                        {prefilledTextValue && !fieldValue && (
                          <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                            💡 We have this info from your profile. Click "Use Profile" to auto-fill.
                          </div>
                        )}
                        <Textarea
                          value={fieldValue}
                          onChange={(e) => handleFieldChange(field.id, e.target.value)}
                          placeholder={field.placeholder}
                          rows={field.rows || 4}
                          className="w-full border-2 border-slate-300 focus:border-[#E5C089] focus:ring-2 focus:ring-[#E5C089]/20"
                        />
                      </div>
                      {activeAIField === field.id && (
                        <AIFeedbackPanel
                          fieldLabel={field.label}
                          userResponse={fieldValue}
                          onClose={() => setActiveAIField(null)}
                        />
                      )}
                      {activeCollabField === field.id && (
                        <CollaborationPanel
                          pageId={page.id}
                          fieldId={field.id}
                          responses={responses}
                        />
                      )}
                    </div>
                  );

                case 'input':
                  const prefilledInputValue = !fieldValue && getPrefilledValue(field.id);
                  return (
                    <div key={field.id} className="bg-white rounded-lg p-3 border border-slate-300">
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-sm block font-semibold text-[#143A50]">
                          {field.label}
                        </Label>
                        {prefilledInputValue && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFieldChange(field.id, prefilledInputValue)}
                            className="text-green-600 hover:text-green-700 h-7 px-2"
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Use Profile
                          </Button>
                        )}
                      </div>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                      )}
                      {prefilledInputValue && !fieldValue && (
                        <div className="mb-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-800">
                          💡 Available from profile: {prefilledInputValue.substring(0, 50)}...
                        </div>
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
                          <div key={option.value} className="flex items-center space-x-2 p-1.5 hover:bg-slate-50 rounded">
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
                      <TableEditor
                        value={fieldValue || []}
                        onChange={(value) => handleFieldChange(field.id, value)}
                      />
                    </div>
                  );

                case 'chart':
                  return (
                    <div key={field.id} className="bg-white rounded-lg p-4 border border-slate-300">
                      <Label className="text-base mb-3 block font-semibold text-[#143A50]">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3 italic">{field.description}</p>
                      )}
                      <ChartBuilder
                        value={fieldValue || {}}
                        onChange={(value) => handleFieldChange(field.id, value)}
                      />
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

      {/* Footer Band */}
      <div className="footer-band">
        <div>Elbert Innovative Solutions × Columbus Urban League</div>
        <div>Page {page.order || 1}</div>
      </div>
    </div>
    </>
  );
}