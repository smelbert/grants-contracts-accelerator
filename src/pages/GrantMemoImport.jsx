import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, CheckCircle2, AlertCircle, FileSpreadsheet, RefreshCw } from 'lucide-react';

export default function GrantMemoImport() {
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setError(null);
    setResult(null);

    try {
      setUploading(true);
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      setUploading(false);
      setProcessing(true);

      const response = await base44.functions.invoke('parseGrantMemos', { file_url });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'An error occurred');
    } finally {
      setUploading(false);
      setProcessing(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  const isLoading = uploading || processing;

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#143A50]">Grant Memo Import</h1>
        <p className="text-slate-500 mt-1">
          Upload your grant memo Excel file to automatically create or update funding opportunities for any organization.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {/* Upload Zone */}
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors cursor-pointer ${
              dragOver
                ? 'border-[#143A50] bg-[#143A50]/5'
                : 'border-slate-200 hover:border-[#143A50]/50 hover:bg-slate-50'
            } ${isLoading ? 'pointer-events-none opacity-60' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isLoading && document.getElementById('memo-file-input').click()}
          >
            <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium mb-1">Drag & drop your Excel file here</p>
            <p className="text-slate-400 text-sm mb-4">.xlsx, .xls, or .csv</p>
            <Button variant="outline" className="pointer-events-none">
              <Upload className="w-4 h-4 mr-2" />
              Select File
            </Button>
            <input
              id="memo-file-input"
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>

          {/* Expected columns hint */}
          <div className="mt-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-xs font-medium text-slate-500 mb-1">Expected columns:</p>
            <p className="text-xs text-slate-400">
              Opportunity · Entrepreneurship Services Fit · Geographic Fit · Typical Award · Recommended Ask · Due Date / Timing · Match Requirement · Application Path / Effort
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="mt-6 text-center py-4">
              <div className="inline-block w-6 h-6 border-2 border-[#143A50] border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-600 text-sm font-medium">
                {uploading ? 'Uploading file...' : 'Parsing grant opportunities...'}
              </p>
              <p className="text-slate-400 text-xs mt-1">This may take a moment for large files.</p>
            </div>
          )}

          {/* Success Result */}
          {result && (
            <div className="mt-6 p-5 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-green-800">Import Complete</span>
                </div>
                <Button variant="ghost" size="sm" onClick={reset} className="text-slate-500">
                  <RefreshCw className="w-4 h-4 mr-1" /> Import Another
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="text-2xl font-bold text-green-700">{result.created}</div>
                  <div className="text-xs text-green-600 mt-1">New Opportunities Created</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="text-2xl font-bold text-blue-700">{result.updated}</div>
                  <div className="text-xs text-blue-600 mt-1">Existing Opportunities Updated</div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-green-100">
                  <div className="text-2xl font-bold text-slate-700">{result.total}</div>
                  <div className="text-xs text-slate-500 mt-1">Total Rows Processed</div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-700 text-sm font-medium">Import Failed</p>
                <p className="text-red-600 text-xs mt-1">{error}</p>
                <Button variant="ghost" size="sm" onClick={reset} className="mt-2 text-red-600 p-0 h-auto">
                  Try again
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}