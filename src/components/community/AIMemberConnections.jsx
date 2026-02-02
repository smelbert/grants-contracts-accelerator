import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { Sparkles, Users, TrendingUp, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AIMemberConnections({ spaceId, currentUserEmail }) {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSuggestions();
  }, [spaceId]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      // Get recent discussions in this space
      const { data: discussions } = await base44.entities.Discussion.filter({ 
        space_id: spaceId 
      }, '-created_date', 10);

      // Get user's recent activity
      const { data: userActivity } = await base44.entities.UserActivity.filter({
        user_email: currentUserEmail,
        space_id: spaceId
      }, '-created_date', 5);

      const context = {
        recentTopics: discussions.map(d => d.title),
        userInterests: userActivity.map(a => a.activity_type)
      };

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on this community space activity, suggest 3 relevant content topics or member connections that would be valuable. Keep each suggestion to 1 sentence.

Recent topics: ${context.recentTopics.join(', ')}
User interests: ${context.userInterests.join(', ')}

Format as JSON with this structure:
{
  "suggestions": [
    {"type": "content" or "connection", "title": "...", "description": "..."}
  ]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            suggestions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  type: { type: "string" },
                  title: { type: "string" },
                  description: { type: "string" }
                }
              }
            }
          }
        }
      });

      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-[#E5C089]/30">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-[#143A50]" />
        </CardContent>
      </Card>
    );
  }

  if (!suggestions || suggestions.length === 0) return null;

  return (
    <Card className="border-[#E5C089]/30 bg-gradient-to-br from-white to-[#E5C089]/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#143A50]" />
          <CardTitle className="text-lg">Suggested For You</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {suggestions.map((suggestion, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="p-3 bg-white rounded-lg border border-slate-200 hover:border-[#143A50]/30 transition-colors"
            >
              <div className="flex items-start gap-3">
                {suggestion.type === 'connection' ? (
                  <Users className="w-4 h-4 text-[#AC1A5B] mt-1 flex-shrink-0" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-[#1E4F58] mt-1 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 mb-1">
                    {suggestion.title}
                  </p>
                  <p className="text-xs text-slate-600">
                    {suggestion.description}
                  </p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {suggestion.type === 'connection' ? 'Connect' : 'Explore'}
                  </Badge>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={generateSuggestions}
          className="w-full mt-4 text-[#143A50]"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh Suggestions
        </Button>
      </CardContent>
    </Card>
  );
}