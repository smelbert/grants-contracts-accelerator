import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Code, Key, Webhook, Plus } from 'lucide-react';

export default function DeveloperToolsPage() {
  const { data: apiKeys = [] } = useQuery({
    queryKey: ['api-keys'],
    queryFn: () => base44.entities.APIKey.list(),
  });

  const { data: webhooks = [] } = useQuery({
    queryKey: ['webhooks'],
    queryFn: () => base44.entities.Webhook.list(),
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-8">
          <Code className="w-8 h-8 text-green-600" />
          Developer Tools
        </h1>

        <Tabs defaultValue="api-keys">
          <TabsList>
            <TabsTrigger value="api-keys">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks">
              <Webhook className="w-4 h-4 mr-2" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">API Keys</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Key
              </Button>
            </div>
            <div className="space-y-3">
              {apiKeys.map(key => (
                <Card key={key.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{key.key_name}</p>
                        <p className="text-sm text-slate-600">Created {new Date(key.created_date).toLocaleDateString()}</p>
                      </div>
                      <Button variant="outline" size="sm">Revoke</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="webhooks">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Webhooks</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Webhook
              </Button>
            </div>
            <div className="space-y-3">
              {webhooks.map(webhook => (
                <Card key={webhook.id}>
                  <CardContent className="pt-6">
                    <p className="font-medium">{webhook.webhook_name}</p>
                    <p className="text-sm text-slate-600">{webhook.url}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {webhook.total_calls} calls • {webhook.failed_calls} failed
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="docs">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">Comprehensive API documentation coming soon.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}