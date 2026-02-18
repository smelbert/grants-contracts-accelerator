import React from 'react';

// Professional certificate layouts based on real designs
// Structure is locked - only colors and text are customizable

export const professionalLayouts = {
  blue_wave_completion: {
    name: 'Blue Wave Completion',
    baseColors: { primary: '#0047AB', secondary: '#E5C089', background: '#FFFFFF', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors, logos }) => (
      <div className="relative w-full aspect-[8.5/11] bg-white">
        {/* Top Wave */}
        <div className="absolute top-0 left-0 right-0 h-32" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary} 60%, ${colors.secondary} 60%, ${colors.secondary} 100%)` }}>
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="80" cy="80" r="60" fill="none" stroke="white" strokeWidth="0.5" />
              <circle cx="80" cy="80" r="45" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-20 pt-40 pb-20 text-center">
          <h1 className="text-5xl font-bold mb-2" style={{ color: colors.text }}>
            {headerText.split(' ')[0]}
          </h1>
          <h2 className="text-3xl font-light mb-12" style={{ color: colors.primary }}>
            {headerText.split(' ').slice(1).join(' ')}
          </h2>

          <p className="text-sm uppercase tracking-widest mb-6" style={{ color: colors.text }}>
            THIS CERTIFICATE IS PRESENTED TO
          </p>

          <h3 className="text-5xl font-['Brush_Script_MT'] mb-12" style={{ color: colors.primary }}>
            {participantName}
          </h3>

          <p className="text-base leading-relaxed max-w-2xl mx-auto mb-16" style={{ color: colors.text }}>
            {bodyText}
          </p>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="flex justify-center gap-24 mt-16">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-48 border-t-2 mb-2" style={{ borderColor: colors.primary }} />
                  <p className="font-semibold" style={{ color: colors.text }}>{sig.name}</p>
                  <p className="text-sm" style={{ color: colors.primary }}>{sig.title}</p>
                </div>
              ))}
            </div>
          )}

          {/* Medal Badge */}
          <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full" style={{ background: `linear-gradient(135deg, ${colors.secondary} 0%, #FFD700 100%)` }}>
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-16 h-16 rounded-full border-4" style={{ borderColor: colors.primary, backgroundColor: colors.secondary }} />
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-8 h-12" style={{ backgroundColor: colors.primary, clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: `linear-gradient(45deg, ${colors.primary} 0%, ${colors.primary} 40%, ${colors.secondary} 40%, ${colors.secondary} 100%)` }}>
          <div className="absolute top-0 left-0 w-32 h-32 opacity-20">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="20" cy="20" r="60" fill="none" stroke="white" strokeWidth="0.5" />
            </svg>
          </div>
        </div>
      </div>
    )
  },

  gold_ribbon_appreciation: {
    name: 'Gold Ribbon Appreciation',
    baseColors: { primary: '#B8860B', secondary: '#FFFFF0', background: '#FAFAFA', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11]" style={{ backgroundColor: colors.background }}>
        {/* Gold Ribbon & Medal */}
        <div className="absolute top-0 left-16 w-32 h-48">
          <div className="relative">
            <div className="w-full h-32" style={{ background: `linear-gradient(to bottom, ${colors.primary}, #FFD700)`, borderRadius: '0 0 50% 50%' }} />
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full shadow-xl" style={{ background: `radial-gradient(circle, #FFD700 0%, ${colors.primary} 100%)` }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4" style={{ borderColor: '#B8860B', background: 'radial-gradient(circle, #FFE55C 0%, #FFD700 100%)' }} />
              </div>
            </div>
            <div className="absolute -bottom-8 left-4 w-8 h-16" style={{ backgroundColor: colors.primary, clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
            <div className="absolute -bottom-8 right-4 w-8 h-16" style={{ backgroundColor: '#FFD700', clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-20 pt-24 pb-16 text-center">
          <div className="border-2 rounded-lg p-16" style={{ borderColor: colors.primary }}>
            <h1 className="text-5xl font-serif uppercase tracking-wider mb-4" style={{ color: colors.text }}>
              {headerText}
            </h1>

            <p className="text-base tracking-wide mb-12" style={{ color: colors.text }}>
              This certificate is proudly presented to
            </p>

            <h2 className="text-6xl font-['Brush_Script_MT'] mb-12" style={{ color: colors.text }}>
              {participantName}
            </h2>

            <div className="flex items-center justify-center mb-12">
              <div className="h-px w-32" style={{ backgroundColor: colors.text }} />
              <div className="mx-4">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path d="M12 2L15 9L22 10L17 15L18 22L12 18L6 22L7 15L2 10L9 9L12 2Z" fill={colors.primary} />
                </svg>
              </div>
              <div className="h-px w-32" style={{ backgroundColor: colors.text }} />
            </div>

            <p className="text-base leading-relaxed max-w-2xl mx-auto mb-16" style={{ color: colors.text }}>
              {bodyText}
            </p>

            {/* Signatures */}
            {signatures && signatures.length > 0 && (
              <div className="flex justify-center gap-32 mt-16">
                {signatures.map((sig, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-48 h-12 mb-2 flex items-end justify-center">
                      <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
                        <path d="M 0,40 Q 50,10 100,30 T 200,40" stroke={colors.text} strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                    <p className="font-semibold" style={{ color: colors.text }}>{sig.name}</p>
                    <p className="text-sm" style={{ color: colors.text }}>{sig.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  },

  teal_gold_recognition: {
    name: 'Teal Gold Recognition',
    baseColors: { primary: '#1E4F58', secondary: '#E5C089', background: '#FFFFFF', text: '#1E4F58' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11] bg-white overflow-hidden">
        {/* Geometric Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-40" style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary} 50%, ${colors.secondary} 50%, ${colors.secondary} 100%)`, clipPath: 'polygon(0 0, 100% 0, 100% 70%, 0 100%)' }} />
          <div className="absolute top-0 left-0 w-64 h-64 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="absolute border-2 rounded-full" style={{ borderColor: colors.secondary, width: `${(i + 1) * 40}px`, height: `${(i + 1) * 40}px`, top: '20%', left: '20%' }} />
            ))}
          </div>
        </div>

        {/* White Content Box */}
        <div className="relative z-10 mx-16 my-24 p-12 bg-white rounded-lg border-4" style={{ borderColor: colors.secondary }}>
          <div className="absolute -top-8 right-12 w-20 h-20 rounded-full shadow-lg" style={{ background: `linear-gradient(135deg, ${colors.secondary} 0%, #FFD700 100%)` }}>
            <div className="w-full h-full flex items-center justify-center rounded-full">
              <svg className="w-10 h-10" viewBox="0 0 24 24" style={{ color: colors.primary }}>
                <path fill="currentColor" d="M12,3L14,10L21,10L15,15L17,22L12,17L7,22L9,15L3,10L10,10L12,3Z" />
                <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
              </svg>
            </div>
          </div>

          <h1 className="text-5xl font-bold text-center mb-2" style={{ color: colors.primary }}>
            {headerText.split(' ')[0]}
          </h1>
          <h2 className="text-2xl text-center mb-12" style={{ color: colors.secondary }}>
            {headerText.split(' ').slice(1).join(' ')}
          </h2>

          <p className="text-sm text-center uppercase tracking-wider mb-6" style={{ color: colors.text }}>
            This certificate is proudly presented to
          </p>

          <h3 className="text-5xl font-bold text-center mb-12" style={{ color: colors.primary }}>
            {participantName}
          </h3>

          <p className="text-base text-center leading-relaxed mb-16 max-w-xl mx-auto" style={{ color: colors.text }}>
            {bodyText}
          </p>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="flex justify-center gap-24">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <p className="font-semibold text-base" style={{ color: colors.primary }}>{sig.title}</p>
                  <svg className="w-32 h-12 mx-auto my-2" viewBox="0 0 120 40" preserveAspectRatio="none">
                    <path d="M 5,30 Q 30,15 60,25 T 115,30" stroke={colors.primary} strokeWidth="2" fill="none" />
                  </svg>
                  <p className="text-sm" style={{ color: colors.primary }}>{sig.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Geometric */}
        <div className="absolute bottom-0 right-0 w-full h-40" style={{ background: `linear-gradient(45deg, ${colors.primary} 0%, ${colors.primary} 50%, ${colors.secondary} 50%, ${colors.secondary} 100%)`, clipPath: 'polygon(0 30%, 100% 0, 100% 100%, 0 100%)' }} />
      </div>
    )
  },

  blue_frame_completion: {
    name: 'Blue Frame Completion',
    baseColors: { primary: '#003D82', secondary: '#E5C089', background: '#FFFFFF', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11] bg-white">
        {/* Double Border Frame */}
        <div className="absolute inset-0 m-8">
          <div className="absolute inset-0 border-8 rounded-lg" style={{ borderColor: colors.primary }} />
          <div className="absolute inset-3 border-4 rounded-lg" style={{ borderColor: colors.primary }} />
        </div>

        {/* Top Right Diagonal */}
        <div className="absolute top-0 right-0 w-64 h-64 overflow-hidden">
          <div className="absolute -top-16 -right-16 w-96 h-96 transform rotate-45" style={{ background: `linear-gradient(to bottom right, ${colors.primary} 0%, ${colors.secondary} 100%)` }} />
        </div>

        {/* Diamond Accents */}
        <div className="absolute top-32 left-16 w-8 h-8 transform rotate-45" style={{ backgroundColor: colors.primary }} />
        <div className="absolute bottom-32 right-16 w-8 h-8 transform rotate-45" style={{ backgroundColor: colors.primary }} />

        {/* Content */}
        <div className="relative z-10 px-24 py-32 text-center">
          <h1 className="text-6xl font-bold mb-4" style={{ color: colors.primary }}>
            {headerText.split(' ')[0]}
          </h1>
          <h2 className="text-3xl mb-16" style={{ color: colors.secondary }}>
            {headerText.split(' ').slice(1).join(' ')}
          </h2>

          <p className="text-sm uppercase tracking-wider mb-8" style={{ color: colors.text }}>
            This certificate is proudly presented to
          </p>

          <h3 className="text-6xl font-['Brush_Script_MT'] mb-8" style={{ color: colors.secondary }}>
            {participantName}
          </h3>

          <div className="w-full h-px my-8" style={{ backgroundColor: colors.primary }} />

          <p className="text-base leading-relaxed mb-16" style={{ color: colors.text }}>
            {bodyText}
          </p>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="flex justify-center gap-32">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-48 border-t-2 mb-2" style={{ borderColor: colors.secondary }} />
                  <p className="font-semibold" style={{ color: colors.text }}>{sig.name}</p>
                  <p className="text-sm" style={{ color: colors.primary }}>{sig.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },

  navy_gold_diagonal: {
    name: 'Navy Gold Diagonal',
    baseColors: { primary: '#1A1A3E', secondary: '#E5C089', background: '#F5F5F5', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11] overflow-hidden" style={{ backgroundColor: colors.background }}>
        {/* Navy Triangle */}
        <div className="absolute top-0 left-0 w-1/3 h-full" style={{ backgroundColor: colors.primary, clipPath: 'polygon(0 0, 100% 0, 0 100%)' }}>
          <div className="absolute top-16 left-12">
            <div className="w-24 h-24 rounded-full shadow-2xl" style={{ background: `linear-gradient(135deg, ${colors.secondary} 0%, #FFD700 100%)` }}>
              <div className="w-full h-full flex items-center justify-center rounded-full">
                <div className="w-16 h-16 rounded-full border-4 border-white" style={{ background: `radial-gradient(circle, #FFE55C, ${colors.secondary})` }} />
              </div>
            </div>
            <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-12" style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.secondary }} />
          </div>

          {/* Gold Lines */}
          <div className="absolute top-32 right-8 w-px h-16" style={{ backgroundColor: colors.secondary }} />
          <div className="absolute bottom-32 right-12 w-px h-24" style={{ backgroundColor: colors.secondary }} />
        </div>

        {/* Ornate Corner */}
        <div className="absolute top-8 right-8 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color: colors.secondary }}>
            <path d="M50,5 Q75,25 95,50" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M95,50 Q75,75 50,95" stroke="currentColor" strokeWidth="2" fill="none" />
            <circle cx="50" cy="50" r="15" fill="currentColor" opacity="0.2" />
          </svg>
        </div>

        {/* Content */}
        <div className="relative z-10 pl-96 pr-24 py-32">
          <h1 className="text-5xl font-bold mb-4" style={{ color: colors.text }}>
            {headerText.split(' ')[0]}
          </h1>
          <h2 className="text-2xl mb-16 uppercase tracking-wider" style={{ color: colors.primary }}>
            {headerText.split(' ').slice(1).join(' ')}
          </h2>

          <p className="text-sm uppercase mb-8" style={{ color: colors.text }}>
            This certificate is awarded to
          </p>

          <h3 className="text-5xl font-['Brush_Script_MT'] mb-12" style={{ color: colors.text }}>
            {participantName}
          </h3>

          <div className="flex items-center mb-8">
            <div className="h-px flex-1" style={{ backgroundColor: colors.text }} />
            <svg className="w-6 h-6 mx-3" viewBox="0 0 24 24" style={{ color: colors.secondary }}>
              <path fill="currentColor" d="M12,3L14,10L21,10L15,15L17,22L12,17L7,22L9,15L3,10L10,10L12,3Z" />
            </svg>
            <div className="h-px flex-1" style={{ backgroundColor: colors.text }} />
          </div>

          <p className="text-base leading-relaxed mb-16" style={{ color: colors.text }}>
            {bodyText}
          </p>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="space-y-8">
              {signatures.map((sig, idx) => (
                <div key={idx}>
                  <div className="w-48 border-t-2 mb-1" style={{ borderColor: colors.text }} />
                  <p className="font-semibold text-sm" style={{ color: colors.text }}>{sig.name}</p>
                  <p className="text-xs" style={{ color: colors.primary }}>{sig.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Ornate Corner */}
        <div className="absolute bottom-8 left-96 w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full" style={{ color: colors.secondary }}>
            <path d="M5,50 Q25,75 50,95" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M50,95 Q75,75 95,50" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        </div>
      </div>
    )
  },

  red_geometric_modern: {
    name: 'Red Geometric Modern',
    baseColors: { primary: '#B91C1C', secondary: '#991B1B', background: '#FEF2F2', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11] bg-white">
        {/* Top and Bottom Red Bands */}
        <div className="absolute top-0 left-0 right-0 h-32" style={{ background: `linear-gradient(to right, ${colors.secondary} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)` }} />
        <div className="absolute bottom-0 left-0 right-0 h-32" style={{ background: `linear-gradient(to right, ${colors.secondary} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)` }} />

        {/* Geometric Diamonds Top Right */}
        <div className="absolute top-12 right-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute w-4 h-4 transform rotate-45" style={{ backgroundColor: `rgba(185, 28, 28, ${0.2 + i * 0.2})`, top: `${i * 12}px`, left: `${i * 12}px` }} />
          ))}
        </div>

        {/* Geometric Diamonds Bottom Left */}
        <div className="absolute bottom-12 left-12">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="absolute w-4 h-4 transform rotate-45" style={{ backgroundColor: `rgba(185, 28, 28, ${0.2 + i * 0.2})`, bottom: `${i * 12}px`, right: `${i * 12}px` }} />
          ))}
        </div>

        {/* Line Decorations */}
        <div className="absolute top-24 left-24 right-24 flex items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colors.primary }} />
          <div className="flex-1 h-px" style={{ backgroundColor: colors.primary }} />
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colors.primary }} />
        </div>

        <div className="absolute bottom-24 left-24 right-24 flex items-center justify-center gap-4">
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colors.primary }} />
          <div className="flex-1 h-px" style={{ backgroundColor: colors.primary }} />
          <div className="w-8 h-8 rounded-full" style={{ backgroundColor: colors.primary }} />
        </div>

        {/* Content */}
        <div className="relative z-10 px-24 py-40 text-center">
          <h1 className="text-6xl font-bold mb-8 uppercase" style={{ color: colors.primary }}>
            {headerText.split(' ')[0]}
          </h1>
          <h2 className="text-2xl mb-16 uppercase tracking-widest" style={{ color: colors.primary }}>
            {headerText.split(' ').slice(1).join(' ')}
          </h2>

          <p className="text-sm uppercase tracking-wider mb-8" style={{ color: colors.text }}>
            This certificate is proudly presented to
          </p>

          <h3 className="text-5xl font-['Brush_Script_MT'] mb-16" style={{ color: colors.primary }}>
            {participantName}
          </h3>

          <p className="text-base leading-relaxed mb-16 max-w-2xl mx-auto" style={{ color: colors.text }}>
            {bodyText}
          </p>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="flex justify-center gap-24">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <p className="font-semibold uppercase text-xs tracking-wider mb-2" style={{ color: colors.primary }}>{sig.title}</p>
                  <div className="w-40 border-t-2 mb-2" style={{ borderColor: colors.text }} />
                  <p className="text-sm" style={{ color: colors.text }}>{sig.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },

  navy_ribbon_award: {
    name: 'Navy Ribbon Award',
    baseColors: { primary: '#1E3A8A', secondary: '#FDB813', background: '#EFF6FF', text: '#1E3A8A' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11]" style={{ backgroundColor: colors.background }}>
        {/* Ribbon from Top */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2">
          <div className="relative w-20 h-32 rounded-b-lg shadow-xl" style={{ background: `linear-gradient(to bottom, ${colors.secondary}, #FFA500)` }}>
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
              <div className="w-0 h-0 border-l-10 border-r-10 border-t-16" style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: '#FFA500' }} />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <svg className="w-10 h-10" viewBox="0 0 24 24" style={{ color: colors.secondary }}>
                <path fill="currentColor" d="M12,3L14,10L21,10L15,15L17,22L12,17L7,22L9,15L3,10L10,10L12,3Z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Border Frame */}
        <div className="absolute inset-12 border-4 rounded" style={{ borderColor: colors.primary }} />

        {/* Content */}
        <div className="relative z-10 px-24 pt-48 pb-20 text-center">
          <h1 className="text-6xl font-bold mb-4" style={{ color: colors.primary }}>
            {headerText.split(' ')[0]}
          </h1>
          <h2 className="text-2xl mb-16" style={{ color: colors.text }}>
            {headerText.split(' ').slice(1).join(' ')}
          </h2>

          <p className="text-sm mb-8" style={{ color: colors.text }}>
            This certificate is presented to
          </p>

          <h3 className="text-6xl font-['Brush_Script_MT'] mb-16" style={{ color: colors.secondary }}>
            {participantName}
          </h3>

          <p className="text-base leading-relaxed mb-16 max-w-2xl mx-auto" style={{ color: colors.text }}>
            {bodyText}
          </p>

          <p className="text-xs mb-8" style={{ color: colors.text }}>Signed by,</p>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="flex justify-center gap-24">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-48 h-px mb-2" style={{ backgroundColor: colors.primary }} />
                  <p className="font-bold" style={{ color: colors.primary }}>{sig.name}</p>
                  <p className="text-sm" style={{ color: colors.text }}>{sig.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
};

export default function ProfessionalLayoutPreview({ layout, colors }) {
  const layoutConfig = professionalLayouts[layout];
  
  if (!layoutConfig) {
    return (
      <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
        Layout not available
      </div>
    );
  }

  // Mini preview for selection
  const sampleData = {
    headerText: 'Certificate of Completion',
    participantName: 'Jane Doe',
    bodyText: 'For outstanding achievement and dedication.',
    signatures: [
      { name: 'John Smith', title: 'Director' }
    ],
    colors: colors || layoutConfig.baseColors
  };

  return (
    <div className="relative">
      <div className="transform scale-[0.15] origin-top-left w-[850px] h-[1100px] pointer-events-none">
        {layoutConfig.render(sampleData)}
      </div>
      <p className="text-xs text-center mt-2 text-slate-600">{layoutConfig.name}</p>
    </div>
  );
}