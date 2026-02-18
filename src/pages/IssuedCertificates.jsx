import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Award, Download, Eye, Search, CheckCircle, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

export default function IssuedCertificatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: certificates } = useQuery({
    queryKey: ['issued-certificates'],
    queryFn: () => base44.entities.ProgramCertificate.list(),
    enabled: !!user
  });

  const { data: programs } = useQuery({
    queryKey: ['all-programs'],
    queryFn: () => base44.entities.ProgramCohort.list()
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'owner';

  const filteredCertificates = certificates?.filter(cert => {
    const matchesSearch = !searchTerm || 
      cert.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.participant_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.program_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.certificate_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Show all for admin, only user's own for participants
    const matchesUser = isAdmin || cert.participant_email === user?.email;
    
    return matchesSearch && matchesUser;
  });

  const handleDownload = (certificateUrl) => {
    window.open(certificateUrl, '_blank');
  };

  const handleVerify = (cert) => {
    const verificationUrl = `${window.location.origin}/verify-certificate/${cert.certificate_number}`;
    window.open(verificationUrl, '_blank');
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {isAdmin ? 'Issued Certificates' : 'My Certificates'}
            </h1>
            <p className="text-slate-600 mt-1">
              {isAdmin ? 'View and manage all program certificates' : 'View your earned program certificates'}
            </p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <Award className="w-4 h-4 mr-2" />
            {filteredCertificates?.length || 0} Certificates
          </Badge>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Search by name, email, program, or certificate number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Certificates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCertificates?.length === 0 ? (
          <div className="col-span-2 text-center py-12">
            <Award className="w-16 h-16 mx-auto text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">No Certificates Found</h3>
            <p className="text-slate-500">
              {searchTerm ? 'Try adjusting your search' : 'Certificates will appear here once programs are completed'}
            </p>
          </div>
        ) : (
          filteredCertificates?.map((cert) => {
            const program = programs?.find(p => p.id === cert.cohort_id);
            return (
              <Card key={cert.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#E5C089]" />
                        {cert.program_name}
                      </CardTitle>
                      <p className="text-sm text-slate-600 mt-1">{cert.participant_name}</p>
                    </div>
                    {cert.is_verified && (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-slate-500">Issue Date</p>
                        <p className="font-medium">
                          {cert.issue_date ? format(new Date(cert.issue_date), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Completion Date</p>
                        <p className="font-medium">
                          {cert.completion_date ? format(new Date(cert.completion_date), 'MMM dd, yyyy') : 'N/A'}
                        </p>
                      </div>
                      {cert.total_hours && (
                        <div>
                          <p className="text-xs text-slate-500">Total Hours</p>
                          <p className="font-medium">{cert.total_hours} hours</p>
                        </div>
                      )}
                      {cert.certificate_number && (
                        <div>
                          <p className="text-xs text-slate-500">Certificate #</p>
                          <p className="font-medium text-xs">{cert.certificate_number}</p>
                        </div>
                      )}
                    </div>

                    {cert.modules_completed && cert.modules_completed.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-2">Completed Modules</p>
                        <div className="flex flex-wrap gap-1">
                          {cert.modules_completed.map((moduleId, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              Module {idx + 1}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-slate-500">Participant Email</p>
                        <p className="text-sm">{cert.participant_email}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-3 border-t">
                      {cert.certificate_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(cert.certificate_url)}
                          className="flex-1"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                      )}
                      {cert.verification_url && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(cert)}
                          className="flex-1"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Verify
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}