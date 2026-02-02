import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Shield, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PlatformGuidelinesDialog({ open, onAccepted, userEmail }) {
  const [accepted, setAccepted] = useState(false);
  const queryClient = useQueryClient();

  const acceptMutation = useMutation({
    mutationFn: async () => {
      const profiles = await base44.entities.UserProfile.filter({ user_email: userEmail });
      if (profiles[0]) {
        return base44.entities.UserProfile.update(profiles[0].id, {
          platform_guidelines_accepted: true,
          guidelines_accepted_date: new Date().toISOString()
        });
      } else {
        return base44.entities.UserProfile.create({
          user_email: userEmail,
          platform_guidelines_accepted: true,
          guidelines_accepted_date: new Date().toISOString()
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userProfile']);
      toast.success('Guidelines accepted');
      onAccepted();
    }
  });

  const handleAccept = () => {
    if (accepted) {
      acceptMutation.mutate();
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-[#143A50]" />
            Community Guidelines & Code of Conduct
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-96 pr-4">
          <div className="space-y-4 text-sm text-slate-700">
            <section>
              <h3 className="font-semibold text-[#143A50] text-base mb-2">Welcome to Our Community</h3>
              <p>
                Our platform is dedicated to fostering a supportive, respectful, and productive environment for all members. 
                By using this platform, you agree to follow these guidelines.
              </p>
            </section>

            <section>
              <h3 className="font-semibold text-[#143A50] text-base mb-2">1. Be Respectful</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>Treat all community members with respect and professionalism</li>
                <li>No harassment, bullying, or discriminatory behavior of any kind</li>
                <li>Respect different perspectives and experiences</li>
                <li>Use inclusive language and be mindful of cultural differences</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-[#143A50] text-base mb-2">2. Keep Content Appropriate</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>No offensive, explicit, or inappropriate content</li>
                <li>Stay on topic and relevant to funding and organizational development</li>
                <li>No spam, advertising, or self-promotion without permission</li>
                <li>Respect intellectual property and give proper attribution</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-[#143A50] text-base mb-2">3. Protect Privacy</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>Do not share others' personal information without consent</li>
                <li>Respect confidentiality of coaching sessions and private discussions</li>
                <li>Use direct messages appropriately and respectfully</li>
                <li>Report any privacy concerns to administrators immediately</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-[#143A50] text-base mb-2">4. Contribute Positively</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>Share knowledge and insights that help others</li>
                <li>Ask questions and seek help when needed</li>
                <li>Provide constructive feedback</li>
                <li>Support fellow community members in their journey</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-[#143A50] text-base mb-2">5. Reporting & Enforcement</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>Report any violations of these guidelines using the report feature</li>
                <li>False reports may result in account restrictions</li>
                <li>Violations may result in warnings, temporary suspension, or permanent ban</li>
                <li>Decisions by moderators and administrators are final</li>
              </ul>
            </section>

            <section>
              <h3 className="font-semibold text-[#143A50] text-base mb-2">6. AI-Generated Content</h3>
              <ul className="list-disc ml-5 space-y-1">
                <li>AI-assisted content must be reviewed and verified before use</li>
                <li>You are responsible for all content you submit, whether AI-generated or not</li>
                <li>Disclose when sharing AI-generated insights or recommendations</li>
              </ul>
            </section>

            <section className="bg-[#E5C089]/20 border border-[#E5C089] rounded-lg p-4">
              <h3 className="font-semibold text-[#143A50] text-base mb-2">Our Commitment</h3>
              <p>
                We are committed to maintaining a safe, inclusive, and supportive community. 
                Your participation and adherence to these guidelines help us achieve this goal. 
                Thank you for being a valued member of our community.
              </p>
            </section>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <Checkbox 
              checked={accepted} 
              onCheckedChange={setAccepted}
              className="mt-1"
            />
            <span className="text-sm text-slate-700">
              I have read and agree to follow the Community Guidelines and Code of Conduct outlined above. 
              I understand that violations may result in account restrictions or termination.
            </span>
          </label>

          <Button 
            onClick={handleAccept}
            disabled={!accepted || acceptMutation.isPending}
            className="w-full bg-[#143A50] hover:bg-[#1E4F58]"
          >
            {acceptMutation.isPending ? (
              'Accepting...'
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Accept Guidelines & Continue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}