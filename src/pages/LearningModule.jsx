import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams, Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeft, 
  Clock, 
  Target, 
  Download, 
  MessageSquare, 
  CheckCircle2,
  AlertCircle,
  Send,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';

export default function LearningModulePage() {
  const [searchParams] = useSearchParams();
  const moduleId = searchParams.get('id');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackType, setFeedbackType] = useState('comment');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  const { data: module, isLoading: moduleLoading } = useQuery({
    queryKey: ['learning-module', moduleId],
    queryFn: () => base44.entities.LearningContent.filter({ id: moduleId }).then(res => res[0]),
    enabled: !!moduleId,
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ['learning-feedback', moduleId],
    queryFn: () => base44.entities.LearningFeedback.filter({ learning_content_id: moduleId }, '-created_date'),
    enabled: !!moduleId,
  });

  const submitFeedbackMutation = useMutation({
    mutationFn: (data) => base44.entities.LearningFeedback.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learning-feedback', moduleId] });
      setFeedbackMessage('');
    }
  });

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    if (!feedbackMessage.trim()) return;

    submitFeedbackMutation.mutate({
      learning_content_id: moduleId,
      feedback_type: feedbackType,
      message: feedbackMessage,
      author_name: user?.full_name || 'Anonymous',
      author_email: user?.email,
    });
  };

  // Extract video ID from YouTube or Vimeo URLs
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = url.includes('youtu.be') 
        ? url.split('youtu.be/')[1]?.split('?')[0]
        : new URLSearchParams(url.split('?')[1]).get('v');
      return `https://www.youtube.com/embed/${videoId}`;
    }
    
    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${videoId}`;
    }

    // Gamma (supports iframe embed)
    if (url.includes('gamma.app')) {
      return url;
    }
    
    // Direct video file
    if (url.match(/\.(mp4|webm|ogg)$/i)) {
      return url;
    }

    return url;
  };

  const embedUrl = getEmbedUrl(module?.content_url);
  const isDirectVideo = embedUrl?.match(/\.(mp4|webm|ogg)$/i);

  if (moduleLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!module) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6 text-center">
              <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Module not found</h3>
              <Button asChild variant="outline" className="mt-4">
                <Link to={createPageUrl('Learning')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Learning Hub
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-6">
          <Link to={createPageUrl('Learning')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Hub
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-3">
                  <Badge className="bg-blue-100 text-blue-800">
                    {module.content_type}
                  </Badge>
                  <Badge variant="outline">{module.funding_lane}</Badge>
                  {module.is_premium && (
                    <Badge className="bg-amber-100 text-amber-800">Premium</Badge>
                  )}
                </div>
                <CardTitle className="text-2xl">{module.title}</CardTitle>
                <p className="text-slate-600 mt-2">{module.description}</p>
              </CardHeader>
            </Card>

            {/* Embedded Content */}
            {embedUrl && (
              <Card>
                <CardContent className="p-0">
                  {isDirectVideo ? (
                    <video 
                      controls 
                      className="w-full rounded-t-lg"
                      style={{ maxHeight: '500px' }}
                    >
                      <source src={embedUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  ) : (
                    <iframe
                      src={embedUrl}
                      className="w-full rounded-t-lg"
                      style={{ height: '500px', border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Questions & Feedback Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  Questions & Feedback
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Submit Form */}
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-2 block">
                      What would you like to share?
                    </label>
                    <div className="flex gap-2 mb-3">
                      <Button
                        type="button"
                        size="sm"
                        variant={feedbackType === 'question' ? 'default' : 'outline'}
                        onClick={() => setFeedbackType('question')}
                        className={feedbackType === 'question' ? 'bg-blue-600' : ''}
                      >
                        Ask Question
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={feedbackType === 'feedback' ? 'default' : 'outline'}
                        onClick={() => setFeedbackType('feedback')}
                        className={feedbackType === 'feedback' ? 'bg-blue-600' : ''}
                      >
                        Give Feedback
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={feedbackType === 'comment' ? 'default' : 'outline'}
                        onClick={() => setFeedbackType('comment')}
                        className={feedbackType === 'comment' ? 'bg-blue-600' : ''}
                      >
                        Leave Comment
                      </Button>
                    </div>
                    <Textarea
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      placeholder={
                        feedbackType === 'question' 
                          ? 'Ask your question here...'
                          : feedbackType === 'feedback'
                          ? 'Share your feedback...'
                          : 'Leave a comment...'
                      }
                      rows={4}
                      className="resize-none"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={!feedbackMessage.trim() || submitFeedbackMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {submitFeedbackMutation.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Submit
                  </Button>
                </form>

                <Separator />

                {/* Feedback List */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">
                    Discussion ({feedback.length})
                  </h4>
                  {feedback.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8">
                      No questions or feedback yet. Be the first to contribute!
                    </p>
                  ) : (
                    feedback.map((item) => (
                      <div key={item.id} className="border border-slate-200 rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-700">
                                {item.author_name?.[0]?.toUpperCase() || 'A'}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {item.author_name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(item.created_date), 'MMM d, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={
                              item.feedback_type === 'question' 
                                ? 'border-blue-200 text-blue-700 bg-blue-50'
                                : item.feedback_type === 'feedback'
                                ? 'border-green-200 text-green-700 bg-green-50'
                                : 'border-slate-200 text-slate-700 bg-slate-50'
                            }
                          >
                            {item.feedback_type}
                          </Badge>
                        </div>
                        <p className="text-slate-700 text-sm mb-3">{item.message}</p>
                        
                        {item.response && (
                          <div className="bg-blue-50 border-l-4 border-blue-400 rounded p-3 mt-3">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                              <p className="text-xs font-medium text-blue-900">
                                Response from {item.response_by}
                              </p>
                            </div>
                            <p className="text-sm text-blue-800">{item.response}</p>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Module Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Module Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {module.duration_minutes && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-slate-400" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">Duration</p>
                      <p className="text-sm text-slate-600">{module.duration_minutes} minutes</p>
                    </div>
                  </div>
                )}
                
                <Separator />
                
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-slate-400" />
                    <p className="text-sm font-medium text-slate-900">Target Audience</p>
                  </div>
                  {module.target_org_types && module.target_org_types.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                      {module.target_org_types.map(type => (
                        <Badge key={type} variant="outline" className="text-xs">
                          {type}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {module.target_stages && module.target_stages.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {module.target_stages.map(stage => (
                        <Badge key={stage} variant="outline" className="text-xs bg-slate-50">
                          {stage} stage
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {module.content_url && (
                  <>
                    <Separator />
                    <Button 
                      asChild 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      <a href={module.content_url} target="_blank" rel="noopener noreferrer">
                        <Download className="w-4 h-4 mr-2" />
                        Open in New Tab
                      </a>
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Related Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-slate-600">
                  Have questions about this module? Use the feedback section to ask questions or request clarification.
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Schedule Office Hours
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}