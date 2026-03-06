import React from 'react';

export default function SectionRenderer({ sections, preview = false }) {
  return (
    <div className={`space-y-4 ${preview ? 'border border-slate-200 rounded-lg p-6 bg-white' : ''}`}>
      {sections.map((section) => (
        <SectionView key={section.id} section={section} />
      ))}
    </div>
  );
}

function SectionView({ section }) {
  switch (section.type) {
    case 'title':
      return (
        <div className="text-center">
          <h1 className="text-4xl font-bold text-slate-900">{section.content}</h1>
        </div>
      );

    case 'heading':
      const HeadingTag = section.level || 'h2';
      return (
        <HeadingTag className={`text-slate-900 font-bold ${
          section.level === 'h1' ? 'text-3xl' :
          section.level === 'h3' ? 'text-lg' :
          'text-2xl'
        }`}>
          {section.content}
        </HeadingTag>
      );

    case 'body':
    case 'custom':
      return (
        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
          {section.content}
        </p>
      );

    case 'callout':
      const calloutStyles = {
        info: 'bg-blue-50 border-blue-200 text-blue-900',
        warning: 'bg-amber-50 border-amber-200 text-amber-900',
        success: 'bg-green-50 border-green-200 text-green-900',
        error: 'bg-red-50 border-red-200 text-red-900'
      };
      return (
        <div className={`border-l-4 p-4 rounded ${calloutStyles[section.calloutType || 'info']}`}>
          <p className="whitespace-pre-wrap">{section.content}</p>
        </div>
      );

    case 'list':
      const items = section.items || [];
      if (section.listType === 'numbered') {
        return (
          <ol className="space-y-1 ml-5 list-decimal">
            {items.map((item, idx) => (
              <li key={idx} className="text-slate-700">
                {item}
              </li>
            ))}
          </ol>
        );
      } else if (section.listType === 'checkbox') {
        return (
          <div className="space-y-2">
            {items.map((item, idx) => (
              <label key={idx} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded" disabled />
                <span className="text-slate-700">{item}</span>
              </label>
            ))}
          </div>
        );
      } else {
        return (
          <ul className="space-y-1 ml-5 list-disc">
            {items.map((item, idx) => (
              <li key={idx} className="text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        );
      }

    case 'quote':
      return (
        <blockquote className="border-l-4 border-slate-300 pl-4 py-2 italic text-slate-700">
          <p>"{section.content}"</p>
          {section.attribution && (
            <p className="mt-2 text-sm text-slate-600">— {section.attribution}</p>
          )}
        </blockquote>
      );

    case 'image':
      return (
        <div className="my-4">
          <img
            src={section.content}
            alt={section.altText || 'Image'}
            className="max-w-full h-auto rounded-lg"
          />
          {section.altText && (
            <p className="text-xs text-slate-500 mt-2 italic">{section.altText}</p>
          )}
        </div>
      );

    case 'table':
      const rows = section.rows || [];
      return (
        <div className="overflow-x-auto my-4">
          <table className="w-full border-collapse border border-slate-300">
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx}>
                  {row.map((cell, cidx) => (
                    <td
                      key={cidx}
                      className="border border-slate-300 px-3 py-2 text-slate-700"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
}