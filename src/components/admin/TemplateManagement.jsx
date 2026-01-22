import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle2, XCircle, Edit, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function TemplateManagement() {
  const queryClient = useQueryClient();

  const { data: templates, isLoading } = useQuery({
    queryKey: ['allTemplates'],
    queryFn: () => base44.entities.Template.list(),
  });

  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Template.update(id, data),
    onSuccess: () => queryClient.invalidateQueries(['allTemplates']),
  });

  const deleteTemplateMutation = useMutation({
    mutationFn: (id) => base44.entities.Template.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['allTemplates']),
  });

  const handleToggleActive = (template) => {
    updateTemplateMutation.mutate({
      id: template.id,
      data: { is_active: !template.is_active }
    });
  };

  if (isLoading) {
    return <Card><CardContent className="py-8 text-center">Loading templates...</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-900">Template Library Management</h3>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <FileText className="w-4 h-4 mr-2" />
          Add Template
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates?.map((template, i) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-slate-400" />
                      <h4 className="font-semibold text-slate-900">{template.template_name}</h4>
                      {template.is_active ? (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 text-slate-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="capitalize">
                        {template.funding_lane}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {template.purpose?.replace(/_/g, ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {template.maturity_level} Level
                      </Badge>
                    </div>

                    {template.when_to_use && (
                      <p className="text-sm text-slate-600 line-clamp-2">
                        {template.when_to_use}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(template)}
                    >
                      {template.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm('Delete this template?')) {
                          deleteTemplateMutation.mutate(template.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {!templates?.length && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No templates yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}