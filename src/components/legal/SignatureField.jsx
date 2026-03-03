import React, { useState, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { PenTool, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function SignatureField({ 
  value = {}, 
  onChange, 
  required = false,
  label = "Signature & Acknowledgement"
}) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [acknowledged, setAcknowledged] = useState(value?.acknowledged || false);

  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if (e.touches) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#143A50';
    const { x, y } = getPos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e) => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();
      onChange({
        ...value,
        signature: signatureData,
        date: new Date().toISOString(),
        signedName: value.signedName || ''
      });
    }
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange({
      ...value,
      signature: null
    });
  };

  const handleNameChange = (name) => {
    onChange({
      ...value,
      signedName: name,
      date: new Date().toISOString()
    });
  };

  const handleAcknowledgement = (checked) => {
    setAcknowledged(checked);
    onChange({
      ...value,
      acknowledged: checked,
      acknowledgedDate: checked ? new Date().toISOString() : null
    });
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="space-y-4 p-6 bg-slate-50 border-2 border-[#143A50] rounded-lg">
      <div className="flex items-center gap-2 mb-4">
        <PenTool className="w-5 h-5 text-[#143A50]" />
        <h3 className="text-lg font-bold text-[#143A50]">{label}</h3>
        {required && <span className="text-red-500">*</span>}
      </div>

      {/* Legal Acknowledgement */}
      <div className="bg-white p-4 rounded-lg border border-slate-300 text-sm text-slate-700 space-y-3">
        <p className="font-semibold text-[#143A50]">By signing below, I acknowledge and agree to the following:</p>
        <ul className="space-y-2 ml-4">
          <li className="flex items-start gap-2">
            <span className="text-[#AC1A5B] font-bold mt-0.5">•</span>
            <span>All materials, frameworks, templates, and content provided by Elbert Innovative Solutions (EIS) are proprietary and protected by intellectual property law.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#AC1A5B] font-bold mt-0.5">•</span>
            <span>I will use these materials solely for my personal or organizational development and will not copy, share, teach, sell, distribute, or create derivative works for commercial purposes.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#AC1A5B] font-bold mt-0.5">•</span>
            <span>The information I provide is accurate and complete to the best of my knowledge.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-[#AC1A5B] font-bold mt-0.5">•</span>
            <span>I have read and agree to the{' '}
              <Link to={createPageUrl('TermsOfService')} className="text-[#AC1A5B] underline font-semibold">
                Terms of Service
              </Link>.
            </span>
          </li>
        </ul>
      </div>

      {/* Acknowledgement Checkbox */}
      <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-300 rounded-lg">
        <Checkbox
          id="acknowledge-terms"
          checked={acknowledged}
          onCheckedChange={handleAcknowledgement}
          className="mt-1"
        />
        <Label htmlFor="acknowledge-terms" className="text-sm cursor-pointer leading-relaxed">
          I have read and agree to the acknowledgements above and understand that all content is protected by copyright and intellectual property law.
        </Label>
      </div>

      {acknowledged && (
        <>
          {/* Printed Name */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#143A50]">
              Printed Name {required && <span className="text-red-500">*</span>}
            </Label>
            <Input
              value={value?.signedName || ''}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your full name"
              className="border-2 border-slate-300"
            />
          </div>

          {/* Signature Canvas */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-[#143A50]">
                Signature {required && <span className="text-red-500">*</span>}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="text-red-600 hover:text-red-700"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            </div>
            <div className="border-2 border-[#143A50] rounded-lg bg-white">
              <canvas
                ref={canvasRef}
                width={600}
                height={150}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full cursor-crosshair"
                style={{ touchAction: 'none' }}
              />
            </div>
            <p className="text-xs text-slate-600 italic">Draw your signature above using your mouse or touchscreen</p>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-[#143A50]">Date</Label>
            <Input
              value={currentDate}
              readOnly
              className="border-2 border-slate-300 bg-slate-100"
            />
          </div>

          {/* Copyright Notice */}
          <div className="text-xs text-slate-600 bg-white p-3 rounded border border-slate-200">
            <p className="font-semibold text-slate-900 mb-1">
              ©{new Date().getFullYear()} Elbert Innovative Solutions. All rights reserved.
            </p>
            <p>
              This document and all associated materials are the proprietary property of EIS and are protected by copyright law. 
              Unauthorized reproduction or distribution is prohibited.
            </p>
          </div>
        </>
      )}
    </div>
  );
}