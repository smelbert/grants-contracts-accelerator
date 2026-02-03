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
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#143A50] mb-2">{page.title}</h2>
          {page.subtitle && (
            <p className="text-slate-600">{page.subtitle}</p>
          )}
        </div>
        <PageTypeBadge type={page.type} />
      </div>

      {/* Video Content */}
      {page.video_url && (
        <Card>
          <CardContent className="pt-6">
            <div className="aspect-video rounded-lg overflow-hidden bg-slate-900">
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
          </CardContent>
        </Card>
      )}

      {/* Page Content */}
      {page.content && (
        <Card>
          <CardContent className="pt-6">
            <div 
              className="prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: page.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Interactive Fields */}
      {page.fields && page.fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {page.fields.map((field) => {
              const fieldValue = responses?.[field.id] || '';

              switch (field.type) {
                case 'textarea':
                  return (
                    <div key={field.id}>
                      <Label className="text-base mb-2 block font-medium text-slate-900">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-2">{field.description}</p>
                      )}
                      <Textarea
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={field.rows || 4}
                        className="w-full"
                      />
                    </div>
                  );

                case 'input':
                  return (
                    <div key={field.id}>
                      <Label className="text-base mb-2 block font-medium text-slate-900">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-2">{field.description}</p>
                      )}
                      <Input
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className="w-full"
                      />
                    </div>
                  );

                case 'radio':
                  return (
                    <div key={field.id}>
                      <Label className="text-base mb-3 block font-medium text-slate-900">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3">{field.description}</p>
                      )}
                      <RadioGroup value={fieldValue} onValueChange={(val) => handleFieldChange(field.id, val)}>
                        {field.options.map((option) => (
                          <div key={option.value} className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value={option.value} id={`${field.id}-${option.value}`} />
                            <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer">
                              {option.label}
                            </Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  );

                case 'checkbox':
                  return (
                    <div key={field.id}>
                      <Label className="text-base mb-3 block font-medium text-slate-900">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3">{field.description}</p>
                      )}
                      <div className="space-y-2">
                        {field.options.map((option) => {
                          const isChecked = Array.isArray(fieldValue) && fieldValue.includes(option.value);
                          return (
                            <div key={option.value} className="flex items-center space-x-2">
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
                              <Label htmlFor={`${field.id}-${option.value}`} className="cursor-pointer">
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
                    <div key={field.id}>
                      <Label className="text-base mb-3 block font-medium text-slate-900">
                        {field.label}
                      </Label>
                      {field.description && (
                        <p className="text-sm text-slate-600 mb-3">{field.description}</p>
                      )}
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="bg-slate-50">
                              {field.columns.map((col) => (
                                <th key={col.id} className="border p-2 text-left font-medium text-sm">
                                  {col.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {(field.rows || 3).times((_, rowIdx) => {
                              const rowData = (Array.isArray(fieldValue) ? fieldValue[rowIdx] : {}) || {};
                              return (
                                <tr key={rowIdx}>
                                  {field.columns.map((col) => (
                                    <td key={col.id} className="border p-2">
                                      <Input
                                        value={rowData[col.id] || ''}
                                        onChange={(e) => {
                                          const newRows = Array.isArray(fieldValue) ? [...fieldValue] : [];
                                          newRows[rowIdx] = { ...rowData, [col.id]: e.target.value };
                                          handleFieldChange(field.id, newRows);
                                        }}
                                        className="w-full"
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}