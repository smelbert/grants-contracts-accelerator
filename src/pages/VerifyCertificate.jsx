import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, Award, Download, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function VerifyCertificatePage() {
  const [certificateNumber, setCertificateNumber] = useState('');

  useEffect(() => {
    // Get certificate number from URL
    const path = window.location.pathname;
    const parts = path.split('/');
    const certNum = parts[parts.length - 1];
    if (certNum && certNum !== 'VerifyCertificate') {
      setCertificateNumber(certNum);
    }
  }, []);

  const { data: certificate, isLoading, error } = useQuery({
    queryKey: ['verify-certificate', certificateNumber],
    queryFn: async () => {
      const certs = await base44.entities.ProgramCertificate.filter({
        certificate_number: certificateNumber
      });
      return certs[0] || null;
    },
    enabled: !!certificateNumber
  });

  if (!certificateNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-center">Invalid Certificate URL</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-slate-600">Please use a valid certificate verification URL.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardContent className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#143A50] mx-auto mb-4"></div>
            <p className="text-slate-600">Verifying certificate...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isValid = certificate && certificate.is_verified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <Link to={createPageUrl('Home')}>
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="text-center border-b">
            <div className="flex justify-center mb-4">
              {isValid ? (
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
              ) : (
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-12 h-12 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl">
              {isValid ? 'Valid Certificate' : 'Certificate Not Found'}
            </CardTitle>
            <p className="text-slate-600 mt-2">
              Certificate #: <span className="font-mono text-sm">{certificateNumber}</span>
            </p>
          </CardHeader>

          {isValid ? (
            <CardContent className="py-8">
              <div className="space-y-6">
                {/* Certificate Details */}
                <div className="grid grid-cols-2 gap-6 p-6 bg-slate-50 rounded-lg">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Participant</p>
                    <p className="font-semibold text-lg">{certificate.participant_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Program</p>
                    <p className="font-semibold text-lg">{certificate.program_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Issue Date</p>
                    <p className="font-medium">
                      {certificate.issue_date ? format(new Date(certificate.issue_date), 'MMMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Completion Date</p>
                    <p className="font-medium">
                      {certificate.completion_date ? format(new Date(certificate.completion_date), 'MMMM dd, yyyy') : 'N/A'}
                    </p>
                  </div>
                  {certificate.total_hours && (
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Total Program Hours</p>
                      <p className="font-medium">{certificate.total_hours} hours</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Status</p>
                    <Badge variant="default" className="bg-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                </div>

                {/* Modules Completed */}
                {certificate.modules_completed && certificate.modules_completed.length > 0 && (
                  <div className="p-6 border rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="w-5 h-5 text-[#E5C089]" />
                      <h3 className="font-semibold">Completed Modules</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {certificate.modules_completed.map((moduleId, idx) => (
                        <Badge key={idx} variant="outline">
                          Module {idx + 1}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Download Button */}
                {certificate.certificate_url && (
                  <div className="text-center pt-4">
                    <Button
                      onClick={() => window.open(certificate.certificate_url, '_blank')}
                      className="bg-[#143A50]"
                      size="lg"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Certificate
                    </Button>
                  </div>
                )}

                {/* Verification Info */}
                <div className="pt-6 border-t text-center text-sm text-slate-500">
                  <p>
                    This certificate has been verified as authentic by Elbert Innovative Solutions.
                  </p>
                  <p className="mt-2">
                    Verified on {format(new Date(), 'MMMM dd, yyyy')} at {format(new Date(), 'HH:mm')} UTC
                  </p>
                </div>
              </div>
            </CardContent>
          ) : (
            <CardContent className="py-8 text-center">
              <p className="text-slate-600 mb-4">
                This certificate could not be verified. It may be invalid, revoked, or the certificate number is incorrect.
              </p>
              <p className="text-sm text-slate-500">
                If you believe this is an error, please contact the program administrator.
              </p>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}