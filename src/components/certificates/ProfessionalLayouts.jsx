import React from 'react';

// Professional certificate layouts with depth, shadows, and layering
// Separate portrait and landscape templates with dimension and visual hierarchy

export const professionalLayouts = {
  // LANDSCAPE TEMPLATES
  
  blue_wave_landscape: {
    name: 'Blue Wave (Landscape)',
    orientation: 'landscape',
    baseColors: { primary: '#0047AB', secondary: '#E5C089', background: '#FFFFFF', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-video bg-white overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100" />
        
        {/* Top Wave Decoration - Layered */}
        <div className="absolute top-0 left-0 right-0 h-40">
          <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.primary, stopOpacity: 0.6 }} />
              </linearGradient>
            </defs>
            <path d="M0,50 Q300,20 600,50 T1200,50 L1200,0 L0,0 Z" fill={colors.primary} opacity="0.8" />
            <path d="M0,80 Q300,100 600,80 T1200,80 L1200,0 L0,0 Z" fill={colors.secondary} opacity="0.6" />
            <path d="M0,120 Q300,80 600,120 T1200,120 L1200,0 L0,0 Z" fill={colors.secondary} opacity="0.3" />
          </svg>
          {/* Decorative circles */}
          <div className="absolute top-8 right-20 w-20 h-20 rounded-full opacity-20" style={{ backgroundColor: colors.secondary, filter: 'blur(10px)' }} />
        </div>

        {/* Bottom Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-40">
          <svg className="w-full h-full" viewBox="0 0 1200 300" preserveAspectRatio="none">
            <path d="M0,150 Q300,200 600,150 T1200,150 L1200,300 L0,300 Z" fill={colors.primary} opacity="0.6" />
            <path d="M0,100 Q300,50 600,100 T1200,100 L1200,300 L0,300 Z" fill={colors.secondary} opacity="0.4" />
          </svg>
        </div>

        {/* Medal Badge - Centered with Shadow */}
        <div className="absolute top-12 left-1/2 transform -translate-x-1/2 z-20">
          <div className="relative w-28 h-28">
            <div className="absolute inset-0 rounded-full shadow-2xl" style={{ background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, #FFD700)` }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-20 h-20 rounded-full border-4 border-white" style={{ background: `linear-gradient(135deg, #FFE55C, ${colors.secondary})` }} />
              </div>
            </div>
            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-6 border-r-6 border-t-8" style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.secondary }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-32 py-16 h-full flex flex-col justify-between">
          <div className="text-center space-y-3 pt-12">
            <h1 className="text-5xl font-bold" style={{ color: colors.primary }}>
              {headerText.split(' ')[0]}
            </h1>
            <h2 className="text-2xl" style={{ color: colors.secondary }}>
              {headerText.split(' ').slice(1).join(' ')}
            </h2>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-widest" style={{ color: colors.primary }}>
              THIS CERTIFICATE IS PRESENTED TO
            </p>
            <h3 className="text-4xl font-['Brush_Script_MT'] italic" style={{ color: colors.primary }}>
              {participantName}
            </h3>
            <p className="text-sm leading-relaxed max-w-3xl mx-auto" style={{ color: colors.text }}>
              {bodyText}
            </p>
          </div>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="flex justify-center gap-32">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-40 border-t-2 mb-2" style={{ borderColor: colors.primary }} />
                  <p className="font-semibold text-sm" style={{ color: colors.text }}>{sig.name}</p>
                  <p className="text-xs" style={{ color: colors.primary }}>{sig.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },

  gold_ribbon_landscape: {
    name: 'Gold Ribbon (Landscape)',
    orientation: 'landscape',
    baseColors: { primary: '#1A1A1A', secondary: '#D4AF37', background: '#FFFFF0', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-video overflow-hidden" style={{ backgroundColor: colors.background }}>
        {/* Decorative Top Bar with Gradient */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 30%, ${colors.primary} 100%)` }} />

        {/* Gold Ribbon & Medal on Left */}
        <div className="absolute top-12 left-12 z-20">
          <div className="relative">
            {/* Gold Ribbon */}
            <div className="w-24 h-32 rounded-b-lg shadow-2xl" style={{ background: `linear-gradient(to right, ${colors.secondary}, #FFD700)` }}>
              <div className="absolute inset-2 border-2 border-white opacity-50" />
            </div>
            {/* Medal */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-24 h-24 rounded-full shadow-2xl" style={{ background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, #FFB90F)` }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-white" style={{ background: `radial-gradient(circle, #FFE55C, ${colors.secondary})` }} />
              </div>
            </div>
            {/* Ribbon Tails */}
            <div className="absolute bottom-0 left-2 w-4 h-12 mt-24" style={{ background: `linear-gradient(to bottom, ${colors.secondary}, #FFD700)`, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <div className="absolute bottom-0 right-2 w-4 h-12 mt-24" style={{ background: `linear-gradient(to bottom, ${colors.secondary}, #FFD700)`, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          </div>
        </div>

        {/* Content Area */}
        <div className="relative z-10 pl-56 pr-12 py-12 h-full flex flex-col justify-center">
          <div className="border-4 rounded-lg p-8" style={{ borderColor: colors.primary, backgroundColor: 'rgba(255,255,255,0.7)' }}>
            <h1 className="text-5xl font-serif font-bold mb-2 text-center" style={{ color: colors.primary }}>
              {headerText}
            </h1>

            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.secondary }} />
              <svg className="w-4 h-4" viewBox="0 0 24 24" style={{ color: colors.secondary }}>
                <path fill="currentColor" d="M12,2L15,9L22,10L17,15L18,22L12,18L6,22L7,15L2,10L9,9L12,2Z" />
              </svg>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.secondary }} />
            </div>

            <p className="text-xs text-center uppercase tracking-wider mb-4" style={{ color: colors.primary }}>
              This certificate is proudly presented to
            </p>

            <h3 className="text-5xl font-['Brush_Script_MT'] text-center mb-6" style={{ color: colors.primary }}>
              {participantName}
            </h3>

            <p className="text-sm text-center leading-relaxed mb-6" style={{ color: colors.text }}>
              {bodyText}
            </p>

            {/* Signatures */}
            {signatures && signatures.length > 0 && (
              <div className="flex justify-center gap-24 pt-4">
                {signatures.map((sig, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-32 h-8 mb-2" />
                    <div className="w-40 border-t-2" style={{ borderColor: colors.primary }} />
                    <p className="font-semibold text-sm" style={{ color: colors.text }}>{sig.name}</p>
                    <p className="text-xs" style={{ color: colors.primary }}>{sig.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Decorative Bottom Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-r" style={{ backgroundImage: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 30%, ${colors.primary} 100%)` }} />
      </div>
    )
  },

  teal_geometric_landscape: {
    name: 'Teal Geometric (Landscape)',
    orientation: 'landscape',
    baseColors: { primary: '#1E4F58', secondary: '#E5C089', background: '#FFFFFF', text: '#1E4F58' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-video bg-white overflow-hidden">
        {/* Abstract Geometric Background */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1400 600" preserveAspectRatio="none">
          {/* Top Right Triangle */}
          <polygon points="1400,0 1400,300 700,0" fill={colors.primary} opacity="0.15" />
          {/* Bottom Left Triangle */}
          <polygon points="0,600 0,300 700,600" fill={colors.secondary} opacity="0.1" />
          {/* Center Decorative Shape */}
          <circle cx="700" cy="300" r="200" fill={colors.secondary} opacity="0.05" />
        </svg>

        {/* Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.secondary} 100%)` }} />

        {/* Award Badge - Top Center */}
        <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full shadow-xl" style={{ background: `linear-gradient(135deg, ${colors.secondary}, #FFD700)`, boxShadow: `0 10px 30px rgba(229, 192, 137, 0.4)` }}>
              <div className="w-full h-full flex items-center justify-center rounded-full">
                <svg className="w-12 h-12" viewBox="0 0 24 24" style={{ color: colors.primary }}>
                  <path fill="currentColor" d="M12,3L14,10L21,10L15,15L17,22L12,17L7,22L9,15L3,10L10,10L12,3Z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 px-24 py-8 h-full flex flex-col justify-between">
          <div className="text-center space-y-2 pt-20">
            <h1 className="text-5xl font-bold" style={{ color: colors.primary }}>
              {headerText.split(' ')[0]}
            </h1>
            <h2 className="text-xl tracking-widest" style={{ color: colors.secondary }}>
              {headerText.split(' ').slice(1).join(' ').toUpperCase()}
            </h2>
          </div>

          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-widest" style={{ color: colors.primary }}>
              This certificate is proudly presented to
            </p>
            <h3 className="text-5xl font-['Brush_Script_MT']" style={{ color: colors.primary }}>
              {participantName}
            </h3>
            <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: colors.text }}>
              {bodyText}
            </p>
          </div>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="flex justify-center gap-24">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <p className="font-semibold text-xs uppercase tracking-wider mb-2" style={{ color: colors.primary }}>{sig.title}</p>
                  <div className="w-40 border-t-2 mb-2" style={{ borderColor: colors.primary }} />
                  <p className="text-sm" style={{ color: colors.text }}>{sig.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Accent Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-r" style={{ background: `linear-gradient(90deg, ${colors.secondary} 0%, ${colors.primary} 100%)` }} />
      </div>
    )
  },

  // PORTRAIT TEMPLATES

  blue_wave_portrait: {
    name: 'Blue Wave (Portrait)',
    orientation: 'portrait',
    baseColors: { primary: '#0047AB', secondary: '#E5C089', background: '#FFFFFF', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11] bg-white overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-slate-100" />
        
        {/* Top Decorative Wave */}
        <div className="absolute top-0 left-0 right-0 h-48">
          <svg className="w-full h-full" viewBox="0 0 800 400" preserveAspectRatio="none">
            <defs>
              <linearGradient id="wave-grad-v" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                <stop offset="100%" style={{ stopColor: colors.primary, stopOpacity: 0.4 }} />
              </linearGradient>
            </defs>
            <path d="M0,80 Q200,40 400,80 T800,80 L800,0 L0,0 Z" fill={colors.primary} opacity="0.9" />
            <path d="M0,120 Q200,160 400,120 T800,120 L800,0 L0,0 Z" fill={colors.secondary} opacity="0.5" />
            <circle cx="700" cy="60" r="40" fill={colors.secondary} opacity="0.2" />
          </svg>
        </div>

        {/* Medal Badge */}
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 rounded-full shadow-2xl" style={{ background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, #FFD700)` }}>
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-white" style={{ background: `linear-gradient(135deg, #FFE55C, ${colors.secondary})` }} />
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-5 border-r-5 border-t-6" style={{ borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.secondary }} />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-12 py-40 flex flex-col justify-between h-full">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold" style={{ color: colors.primary }}>
              {headerText.split(' ')[0]}
            </h1>
            <h2 className="text-xl" style={{ color: colors.secondary }}>
              {headerText.split(' ').slice(1).join(' ')}
            </h2>
          </div>

          <div className="text-center space-y-3">
            <p className="text-xs uppercase tracking-widest" style={{ color: colors.primary }}>
              THIS CERTIFICATE IS PRESENTED TO
            </p>
            <h3 className="text-4xl font-['Brush_Script_MT'] italic" style={{ color: colors.primary }}>
              {participantName}
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
              {bodyText}
            </p>
          </div>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="space-y-6">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <div className="w-32 border-t-2 mx-auto mb-1" style={{ borderColor: colors.primary }} />
                  <p className="font-semibold text-sm" style={{ color: colors.text }}>{sig.name}</p>
                  <p className="text-xs" style={{ color: colors.primary }}>{sig.title}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Decorative */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t" style={{ background: `linear-gradient(to top, ${colors.primary}, transparent)`, opacity: 0.1 }} />
      </div>
    )
  },

  gold_ribbon_portrait: {
    name: 'Gold Ribbon (Portrait)',
    orientation: 'portrait',
    baseColors: { primary: '#1A1A1A', secondary: '#D4AF37', background: '#FFFFF0', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11] overflow-hidden" style={{ backgroundColor: colors.background }}>
        {/* Decorative Corner Patterns */}
        <div className="absolute top-4 right-4 w-12 h-12 opacity-10">
          <svg viewBox="0 0 100 100">
            <path d="M10,90 L90,10" stroke={colors.primary} strokeWidth="2" />
            <path d="M90,90 L10,10" stroke={colors.primary} strokeWidth="2" />
            <circle cx="50" cy="50" r="30" fill="none" stroke={colors.primary} strokeWidth="2" />
          </svg>
        </div>
        <div className="absolute bottom-4 left-4 w-12 h-12 opacity-10">
          <svg viewBox="0 0 100 100">
            <path d="M10,10 L90,90" stroke={colors.primary} strokeWidth="2" />
            <path d="M90,10 L10,90" stroke={colors.primary} strokeWidth="2" />
            <circle cx="50" cy="50" r="30" fill="none" stroke={colors.primary} strokeWidth="2" />
          </svg>
        </div>

        {/* Gold Ribbon on Left */}
        <div className="absolute top-20 left-6 z-20">
          <div className="relative">
            <div className="w-20 h-40 rounded-r-lg shadow-2xl" style={{ background: `linear-gradient(to right, ${colors.secondary}, #FFD700)`, boxShadow: `10px 10px 30px rgba(0,0,0,0.2)` }} />
            {/* Medal */}
            <div className="absolute -right-6 top-16 w-20 h-20 rounded-full shadow-xl" style={{ background: `radial-gradient(circle at 30% 30%, ${colors.secondary}, #FFB90F)` }}>
              <div className="w-full h-full flex items-center justify-center rounded-full">
                <div className="w-14 h-14 rounded-full border-4 border-white" style={{ background: `radial-gradient(circle, #FFE55C, ${colors.secondary})` }} />
              </div>
            </div>
            {/* Ribbon Tails */}
            <div className="absolute left-0 bottom-0 w-5 h-16" style={{ background: `linear-gradient(to bottom, ${colors.secondary}, #FFD700)`, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
            <div className="absolute right-0 bottom-0 w-5 h-16" style={{ background: `linear-gradient(to bottom, ${colors.secondary}, #FFD700)`, clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
          </div>
        </div>

        {/* Border Frame */}
        <div className="absolute inset-8 border-4 rounded-lg pointer-events-none" style={{ borderColor: colors.primary }} />

        {/* Content */}
        <div className="relative z-10 px-8 py-32 h-full flex flex-col justify-between">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-serif font-bold" style={{ color: colors.primary }}>
              {headerText}
            </h1>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-wider" style={{ color: colors.primary }}>
              This certificate is awarded to
            </p>
            <h3 className="text-5xl font-['Brush_Script_MT']" style={{ color: colors.primary }}>
              {participantName}
            </h3>
            <div className="flex items-center justify-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.primary }} />
              <svg className="w-3 h-3" viewBox="0 0 24 24" style={{ color: colors.secondary }}>
                <path fill="currentColor" d="M12,2L15,9L22,10L17,15L18,22L12,18L6,22L7,15L2,10L9,9L12,2Z" />
              </svg>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.primary }} />
            </div>
            <p className="text-xs leading-relaxed" style={{ color: colors.text }}>
              {bodyText}
            </p>
          </div>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="space-y-4">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-xs uppercase tracking-widest mb-2" style={{ color: colors.primary }}>{sig.title}</p>
                  <div className="w-32 border-t-2 mx-auto mb-2" style={{ borderColor: colors.primary }} />
                  <p className="font-semibold text-sm" style={{ color: colors.text }}>{sig.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  },

  red_geometric_portrait: {
    name: 'Red Geometric (Portrait)',
    orientation: 'portrait',
    baseColors: { primary: '#B91C1C', secondary: '#991B1B', background: '#FEF2F2', text: '#000000' },
    render: ({ headerText, participantName, bodyText, signatures, colors }) => (
      <div className="relative w-full aspect-[8.5/11] bg-white overflow-hidden">
        {/* Top Band */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r" style={{ background: `linear-gradient(to right, ${colors.secondary} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)` }} />

        {/* Geometric Shapes Top Right */}
        <div className="absolute top-8 right-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute w-3 h-3 transform rotate-45" style={{ backgroundColor: `rgba(185, 28, 28, ${0.1 + i * 0.15})`, top: `${i * 8}px`, left: `${i * 8}px` }} />
          ))}
        </div>

        {/* Decorative Circle */}
        <div className="absolute top-20 right-12 w-16 h-16 rounded-full opacity-20" style={{ backgroundColor: colors.primary, filter: 'blur(8px)' }} />

        {/* Content */}
        <div className="relative z-10 px-12 py-40 h-full flex flex-col justify-between">
          <div className="text-center space-y-3 pt-8">
            <h1 className="text-5xl font-bold uppercase" style={{ color: colors.primary }}>
              {headerText.split(' ')[0]}
            </h1>
            <h2 className="text-lg uppercase tracking-widest" style={{ color: colors.primary }}>
              {headerText.split(' ').slice(1).join(' ')}
            </h2>
          </div>

          <div className="text-center space-y-4">
            <p className="text-xs uppercase tracking-wider" style={{ color: colors.text }}>
              This certificate is proudly presented to
            </p>
            <h3 className="text-5xl font-['Brush_Script_MT']" style={{ color: colors.primary }}>
              {participantName}
            </h3>
            <div className="flex items-center justify-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.text }} />
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.primary }} />
              <div className="flex-1 h-px" style={{ backgroundColor: colors.text }} />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: colors.text }}>
              {bodyText}
            </p>
          </div>

          {/* Signatures */}
          {signatures && signatures.length > 0 && (
            <div className="flex flex-col gap-6">
              {signatures.map((sig, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: colors.primary }}>{sig.title}</p>
                  <div className="w-40 border-t-2 mx-auto mb-2" style={{ borderColor: colors.text }} />
                  <p className="text-sm" style={{ color: colors.text }}>{sig.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Geometric Shapes Bottom Left */}
        <div className="absolute bottom-8 left-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="absolute w-3 h-3 transform rotate-45" style={{ backgroundColor: `rgba(185, 28, 28, ${0.1 + i * 0.15})`, bottom: `${i * 8}px`, right: `${i * 8}px` }} />
          ))}
        </div>

        {/* Bottom Band */}
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-r" style={{ background: `linear-gradient(to right, ${colors.secondary} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`, opacity: 0.6 }} />
      </div>
    )
  }
};

export default function ProfessionalLayoutPreview({ layout, colors }) {
  const layoutConfig = professionalLayouts[layout];
  
  if (!layoutConfig) {
    return (
      <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
        Layout not available
      </div>
    );
  }

  const sampleData = {
    headerText: 'Certificate of Completion',
    participantName: 'Jane Doe',
    bodyText: 'In recognition of your outstanding dedication and consistent contribution.',
    signatures: [
      { name: 'John Smith', title: 'Director' }
    ],
    colors: colors || layoutConfig.baseColors
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-600 font-medium">{layoutConfig.name}</p>
      <div className="border rounded-lg overflow-hidden bg-slate-50 shadow-sm">
        <div style={{ transform: 'scale(0.25)', transformOrigin: 'top left', width: layoutConfig.orientation === 'portrait' ? '340px' : '560px' }}>
          {layoutConfig.render(sampleData)}
        </div>
      </div>
    </div>
  );
}