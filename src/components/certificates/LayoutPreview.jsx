import React from 'react';
import { Badge } from '@/components/ui/badge';

const layouts = {
  modern_blue_geometric: {
    name: 'Modern Blue Geometric',
    preview: (colors) => (
      <div className="relative w-full h-48 border-4 rounded-lg overflow-hidden" style={{ borderColor: colors.border }}>
        <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[100px] border-l-transparent border-b-[100px]" style={{ borderBottomColor: colors.accent }} />
        <div className="absolute top-0 right-0 w-0 h-0 border-r-[100px] border-r-transparent border-t-[100px]" style={{ borderTopColor: colors.border }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold" style={{ color: colors.border }}>CERTIFICATE</h3>
            <p className="text-sm" style={{ color: colors.text }}>Modern & Professional</p>
          </div>
        </div>
      </div>
    )
  },
  classic_gold_seal: {
    name: 'Classic Gold Seal',
    preview: (colors) => (
      <div className="relative w-full h-48 border-2 rounded-lg p-4" style={{ borderColor: colors.accent, backgroundColor: '#FAFAF9' }}>
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full" style={{ backgroundColor: colors.accent }}>
          <div className="w-full h-full flex items-center justify-center text-white text-xs">SEAL</div>
        </div>
        <div className="text-center mt-8 space-y-2">
          <h3 className="text-2xl font-serif font-bold" style={{ color: colors.text }}>Certificate</h3>
          <p className="text-sm italic" style={{ color: colors.text }}>of Completion</p>
        </div>
      </div>
    )
  },
  yellow_black_diagonal: {
    name: 'Yellow & Black Diagonal',
    preview: (colors) => (
      <div className="relative w-full h-48 overflow-hidden rounded-lg" style={{ backgroundColor: '#1A1A1A' }}>
        <div className="absolute inset-y-0 right-0 w-1/3 transform skew-x-12 origin-right" style={{ backgroundColor: '#FDB813' }} />
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-white">CERTIFICATE</h3>
            <p className="text-sm text-yellow-400">Bold & Dynamic</p>
          </div>
        </div>
      </div>
    )
  },
  blue_shield_modern: {
    name: 'Blue Shield Modern',
    preview: (colors) => (
      <div className="relative w-full h-48 border-4 rounded-lg overflow-hidden" style={{ borderColor: colors.border, backgroundColor: colors.background }}>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-40 opacity-10" style={{ backgroundColor: colors.border }}>
          <svg viewBox="0 0 100 120" className="w-full h-full">
            <path d="M50 0 L100 20 L100 80 Q50 120 50 120 Q0 120 0 80 L0 20 Z" fill="currentColor" />
          </svg>
        </div>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold" style={{ color: colors.border }}>Certificate</h3>
            <p className="text-sm" style={{ color: colors.text }}>Achievement Badge</p>
          </div>
        </div>
      </div>
    )
  },
  elegant_gold_border: {
    name: 'Elegant Gold Border',
    preview: (colors) => (
      <div className="relative w-full h-48 rounded-lg p-2" style={{ backgroundColor: colors.accent }}>
        <div className="w-full h-full border-4 rounded" style={{ borderColor: '#FFFFFF', backgroundColor: colors.background }}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-serif font-bold" style={{ color: colors.accent }}>Certificate</h3>
              <p className="text-sm" style={{ color: colors.text }}>Elegant & Refined</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  purple_modern: {
    name: 'Purple Modern',
    preview: (colors) => (
      <div className="relative w-full h-48 border-4 rounded-lg" style={{ borderColor: '#7C3AED', backgroundColor: '#F5F3FF' }}>
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-purple-700">CERTIFICATE</h3>
            <p className="text-sm text-purple-600">of Completion</p>
          </div>
        </div>
      </div>
    )
  },
  minimalist_black_frame: {
    name: 'Minimalist Black Frame',
    preview: (colors) => (
      <div className="relative w-full h-48 border-2 rounded-none" style={{ borderColor: '#000000', backgroundColor: '#FFFFFF' }}>
        <div className="absolute inset-2 border border-gray-300" />
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-xl font-light text-black">Certificate</h3>
            <p className="text-xs text-gray-600">of Completion</p>
          </div>
        </div>
      </div>
    )
  },
  blue_wave_corporate: {
    name: 'Blue Wave Corporate',
    preview: (colors) => (
      <div className="relative w-full h-48 overflow-hidden rounded-lg bg-white">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 200" preserveAspectRatio="none">
          <path d="M0,50 Q100,20 200,50 T400,50 L400,0 L0,0 Z" fill="#1E40AF" opacity="0.8" />
          <path d="M0,70 Q100,100 200,70 T400,70 L400,0 L0,0 Z" fill="#3B82F6" opacity="0.6" />
        </svg>
        <div className="relative z-10 flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-blue-900">Certificate</h3>
            <p className="text-sm text-blue-700">Corporate Design</p>
          </div>
        </div>
      </div>
    )
  },
  vintage_ornate: {
    name: 'Vintage Ornate',
    preview: (colors) => (
      <div className="relative w-full h-48 border-4 rounded-lg p-3" style={{ borderColor: colors.accent, backgroundColor: '#FFF8E7' }}>
        <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2" style={{ borderColor: colors.accent }} />
        <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2" style={{ borderColor: colors.accent }} />
        <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2" style={{ borderColor: colors.accent }} />
        <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2" style={{ borderColor: colors.accent }} />
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-serif font-bold" style={{ color: colors.accent }}>Certificate</h3>
            <p className="text-sm font-serif italic" style={{ color: colors.text }}>of Completion</p>
          </div>
        </div>
      </div>
    )
  },
  navy_ribbon_formal: {
    name: 'Navy Ribbon Formal',
    preview: (colors) => (
      <div className="relative w-full h-48 border-4 rounded-lg" style={{ borderColor: '#1E3A8A', backgroundColor: '#EFF6FF' }}>
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-16 h-24 bg-gradient-to-b from-yellow-400 to-amber-500 rounded-b-lg shadow-lg">
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-amber-500" />
        </div>
        <div className="flex items-center justify-center h-full pt-8">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-blue-900">Certificate</h3>
            <p className="text-sm text-blue-700">Achievement Award</p>
          </div>
        </div>
      </div>
    )
  },
  red_formal_elegant: {
    name: 'Red Formal Elegant',
    preview: (colors) => (
      <div className="relative w-full h-48 border-8 rounded-lg overflow-hidden" style={{ borderColor: '#991B1B' }}>
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-r from-red-700 via-red-600 to-red-700" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-red-700 via-red-600 to-red-700" />
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div className="flex items-center justify-center h-full">
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-bold text-red-900">CERTIFICATE</h3>
            <p className="text-sm text-red-700">of Completion</p>
          </div>
        </div>
      </div>
    )
  }
};

export default function LayoutPreview({ layout, colors }) {
  const layoutConfig = layouts[layout];
  
  if (!layoutConfig) {
    return (
      <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
        Preview not available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Badge variant="outline" className="mb-2">{layoutConfig.name}</Badge>
      {layoutConfig.preview(colors)}
    </div>
  );
}

export { layouts };