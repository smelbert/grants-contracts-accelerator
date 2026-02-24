import React, { useRef, useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pen, RotateCcw } from 'lucide-react';

export default function SignatureAndDate({ signature, date, onSignatureChange, onDateChange }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureType, setSignatureType] = useState(signature ? 'typed' : 'draw'); // 'draw' or 'typed'
  const [typedSignature, setTypedSignature] = useState(signature || '');

  // Auto-fill today's date if not provided
  useEffect(() => {
    if (!date) {
      const today = new Date().toISOString().split('T')[0];
      onDateChange(today);
    }
  }, [date, onDateChange]);

  // Initialize canvas
  useEffect(() => {
    if (signatureType === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [signatureType]);

  const startDrawing = (e) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      const canvas = canvasRef.current;
      const signatureData = canvas.toDataURL();
      onSignatureChange(signatureData);
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange('');
  };

  const handleTypedSignatureChange = (value) => {
    setTypedSignature(value);
    onSignatureChange(value);
  };

  return (
    <Card className="p-4 bg-amber-50 border-2 border-amber-300">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-bold text-[#143A50]">Signature & Date</Label>
          <div className="flex gap-2">
            <Button
              variant={signatureType === 'draw' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSignatureType('draw')}
            >
              <Pen className="w-3 h-3 mr-1" />
              Draw
            </Button>
            <Button
              variant={signatureType === 'typed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSignatureType('typed')}
            >
              Type
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Signature */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Signature <span className="text-red-500">*</span>
            </Label>
            {signatureType === 'draw' ? (
              <div className="space-y-2">
                <canvas
                  ref={canvasRef}
                  width={300}
                  height={120}
                  className="border-2 border-slate-300 rounded bg-white cursor-crosshair w-full"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSignature}
                  className="text-xs"
                >
                  <RotateCcw className="w-3 h-3 mr-1" />
                  Clear
                </Button>
              </div>
            ) : (
              <Input
                value={typedSignature}
                onChange={(e) => handleTypedSignatureChange(e.target.value)}
                placeholder="Type your full name"
                className="font-serif text-lg italic"
              />
            )}
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-slate-700">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="date"
              value={date || ''}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full"
            />
          </div>
        </div>

        <p className="text-xs text-slate-600 italic">
          By signing and dating this form, you acknowledge that all information provided is accurate and complete.
        </p>
      </div>
    </Card>
  );
}