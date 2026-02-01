import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Layout, Plus, Eye, Settings } from 'lucide-react';

export default function WebsiteBuilderPage() {
  const { data: pages = [] } = useQuery({
    queryKey: ['landing-pages'],
    queryFn: () => base44.entities.LandingPage.list(),
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Layout className="w-8 h-8 text-indigo-600" />
              Website Builder
            </h1>
            <p className="text-slate-600 mt-2">Build custom landing pages and websites</p>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Page
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {pages.map(page => (
            <Card key={page.id}>
              <CardHeader>
                <CardTitle className="text-base">{page.page_name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 mb-4">/{page.slug}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}