import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import CoBrandedHeader, { BRAND_COLORS } from '@/components/incubateher/CoBrandedHeader';
import CoBrandedFooter from '@/components/incubateher/CoBrandedFooter';
import ParticipantAggregates from '@/components/incubateher/ParticipantAggregates';
import JotFormProfile from '@/components/incubateher/JotFormProfile';
import BulkEnrolleAccessManager from '@/components/admin/BulkEnrolleAccessManager';
import { CheckCircle2, XCircle, Search, Award, Upload, FileText, Loader2, X, CheckCircle, ChevronDown, ChevronUp, Activity } from 'lucide-react';
import ParticipantActivityDetail from '@/components/incubateher/ParticipantActivityDetail';

export default function IncubateHerParticipants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProfiles, setExpandedProfiles] = useState({});
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [filterExtractors, setFilterExtractors] = useState({});
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const handleFilter = (key, val, extractor) => {
    setActiveFilters(prev => ({ ...prev, [key]: val }));
    setFilterExtractors(prev => ({ ...prev, [key]: extractor }));
  };

  const handleClearFilters = () => {
    setActiveFilters({});
    setFilterExtractors({});
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
    const newItems = files.map(file => ({ file, status: 'pending', result: null, error: null }));
    setUploadQueue(prev => [...prev, ...newItems]);
    e.target.value = '';
  };

  const processQueue = async () => {
    setIsProcessing(true);
    const pending = uploadQueue.filter(item => item.status === 'pending');

    for (let i = 0; i < pending.length; i++) {
      const item = pending[i];
      const idx = uploadQueue.findIndex(q => q.file === item.file);

      // Mark as processing
      setUploadQueue(prev => prev.map((q, j) => 
        q.file === item.file ? { ...q, status: 'processing' } : q
      ));

      try {
        // Upload to storage first
        const { file_url } = await base44.integrations.Core.UploadFile({ file: item.file });

        // Process via backend function
        const response = await base44.functions.invoke('importJotformPDF', {
          file_url,
          file_name: item.file.name
        });

        setUploadQueue(prev => prev.map(q =>
          q.file === item.file ? { ...q, status: 'success', result: response.data } : q
        ));
      } catch (err) {
        setUploadQueue(prev => prev.map(q =>
          q.file === item.file ? { ...q, status: 'error', error: err.message } : q
        ));
      }
    }

    setIsProcessing(false);
    queryClient.invalidateQueries({ queryKey: ['all-enrollments'] });
  };

  const removeFromQueue = (file) => {
    setUploadQueue(prev => prev.filter(q => q.file !== file));
  };

  const { data: enrollments = [] } = useQuery({
    queryKey: ['all-enrollments'],
    queryFn: async () => {
      // Load all IncubateHer participants (synced with program control)
      return await base44.entities.ProgramEnrollment.filter({
        role: 'participant'
      });
    }
  });

  const filteredEnrollments = enrollments.filter(e => {
    const matchesSearch = !searchTerm ||
      e.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.participant_email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilters = Object.entries(activeFilters).every(([key, val]) => {
      if (!val) return true;
      const extractor = filterExtractors[key];
      return extractor ? extractor(e) === val : true;
    });

    return matchesSearch && matchesFilters;
  }).sort((a, b) => (a.participant_name || '').localeCompare(b.participant_name || ''));

  return (
    <div className="min-h-screen" style={{ backgroundColor: BRAND_COLORS.neutralGray }}>
      <CoBrandedHeader 
        title="Participant Management"
        subtitle="Track individual progress and completion"
      />

      <div className="max-w-7xl mx-auto px-6 py-12">

        {/* PDF Upload Section */}
        <Card className="mb-6 border-2 border-dashed border-slate-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: BRAND_COLORS.eisNavy }}>
              <Upload className="w-5 h-5" />
              Import JotForm Registrations via PDF
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="application/pdf"
                multiple
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Select PDF(s)
              </Button>
              {uploadQueue.some(q => q.status === 'pending') && (
                <Button
                  onClick={processQueue}
                  disabled={isProcessing}
                  style={{ backgroundColor: BRAND_COLORS.eisNavy, color: 'white' }}
                >
                  {isProcessing ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</>
                  ) : (
                    `Import ${uploadQueue.filter(q => q.status === 'pending').length} File(s)`
                  )}
                </Button>
              )}
            </div>

            {uploadQueue.length > 0 && (
              <div className="space-y-2">
                {uploadQueue.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border">
                    <FileText className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span className="text-sm flex-1 truncate">{item.file.name}</span>
                    {item.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">Pending</Badge>
                        <button onClick={() => removeFromQueue(item.file)} className="text-slate-400 hover:text-red-500">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {item.status === 'processing' && (
                      <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    )}
                    {item.status === 'success' && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600">{item.result?.name || item.result?.email} enrolled</span>
                      </div>
                    )}
                    {item.status === 'error' && (
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-500" />
                        <span className="text-xs text-red-500">{item.error}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Access Manager */}
        {enrollments.length > 0 && (
          <BulkEnrolleAccessManager enrollments={enrollments} />
        )}

        {/* Aggregates */}
        {enrollments.length > 0 && (
          <ParticipantAggregates
            enrollments={enrollments}
            onFilter={handleFilter}
            activeFilters={activeFilters}
            onClearFilters={handleClearFilters}
          />
        )}

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Participants List */}
        <Card>
          <CardHeader>
            <CardTitle style={{ color: BRAND_COLORS.culRed }}>
              All Participants ({filteredEnrollments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEnrollments.map((enrollment) => (
                <div 
                  key={enrollment.id}
                  className="p-4 rounded-lg border"
                  style={{ backgroundColor: BRAND_COLORS.neutralLight }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: BRAND_COLORS.neutralDark }}>
                        {enrollment.participant_name}
                      </h3>
                      <p className="text-sm text-slate-600">{enrollment.participant_email}</p>
                      {enrollment.phone_number && (
                        <p className="text-sm text-slate-500">{enrollment.phone_number}</p>
                      )}
                      <Badge className="mt-1" style={{ backgroundColor: BRAND_COLORS.eisNavy, color: BRAND_COLORS.neutralLight }}>
                        {enrollment.role}
                      </Badge>
                    </div>
                    
                    {enrollment.giveaway_eligible && (
                      <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                        <Award className="w-3 h-3 mr-1" />
                        Giveaway Eligible
                      </Badge>
                    )}
                  </div>

                  {/* JotForm details */}
                  {(enrollment.organization_name || enrollment.enrollment_notes) && (
                    <div className="mb-3 p-3 rounded bg-white border text-xs text-slate-600 space-y-1">
                      {enrollment.organization_name && (
                        <p><span className="font-semibold">Cohort/Org:</span> {enrollment.organization_name}</p>
                      )}
                      {enrollment.enrollment_notes && (
                        <p><span className="font-semibold">Notes:</span> {enrollment.enrollment_notes}</p>
                      )}
                    </div>
                  )}

                  {/* Progress Checklist */}
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="flex items-center gap-2">
                      {enrollment.pre_assessment_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Pre-Assessment</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.attendance_complete ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Attendance</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.consultation_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">1:1 Consultation</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.documents_uploaded ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Documents</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {enrollment.post_assessment_completed ? (
                        <CheckCircle2 className="w-5 h-5" style={{ color: BRAND_COLORS.eisGold }} />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-300" />
                      )}
                      <span className="text-xs">Post-Assessment</span>
                    </div>
                  </div>

                  {/* JotForm Profile Toggle */}
                  <div className="mt-3">
                    <button
                      onClick={() => setExpandedProfiles(prev => ({ ...prev, [enrollment.id]: !prev[enrollment.id] }))}
                      className="flex items-center gap-1 text-xs font-medium hover:underline"
                      style={{ color: BRAND_COLORS.eisNavy }}
                    >
                      {expandedProfiles[enrollment.id] ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      {expandedProfiles[enrollment.id] ? 'Hide' : 'View'} Registration Profile
                    </button>
                    {expandedProfiles[enrollment.id] && (
                      <div className="mt-3">
                        <JotFormProfile enrollment={enrollment} />
                      </div>
                    )}
                  </div>

                  {/* Overall Status */}
                  <div className="mt-3 pt-3 border-t">
                    {enrollment.program_completed ? (
                      <Badge style={{ backgroundColor: BRAND_COLORS.eisGold }}>
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Program Completed
                      </Badge>
                    ) : (
                      <Badge variant="outline">In Progress</Badge>
                    )}
                  </div>
                </div>
              ))}

              {filteredEnrollments.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500">No participants found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <CoBrandedFooter />
    </div>
  );
}