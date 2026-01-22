import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, Upload, Play, Trash2, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function VideoFeedback({ documentId, existingVideoUrl, onVideoUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 100MB)
    if (file.size > 100 * 1024 * 1024) {
      setUploadError('Video file must be under 100MB');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onVideoUploaded?.(file_url);
    } catch (error) {
      setUploadError('Failed to upload video. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Video className="w-5 h-5 text-blue-600" />
            Video Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {existingVideoUrl ? (
            <div className="space-y-3">
              <video
                src={existingVideoUrl}
                controls
                className="w-full rounded-lg border border-slate-200"
              >
                Your browser does not support video playback.
              </video>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onVideoUploaded?.(null)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove Video
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Alert className="bg-blue-50 border-blue-200">
                <AlertDescription className="text-sm text-blue-700">
                  Record a short video to walk through your feedback. This helps reduce 
                  misinterpretation and back-and-forth.
                </AlertDescription>
              </Alert>
              
              <label className="block">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  disabled={uploading}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={uploading}
                  asChild
                >
                  <span>
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Video Feedback
                      </>
                    )}
                  </span>
                </Button>
              </label>

              {uploadError && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertDescription className="text-sm text-red-700">
                    {uploadError}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}