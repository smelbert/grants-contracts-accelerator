import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, AlertCircle, Edit, Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import moment from 'moment';

const QUESTIONS = {
  grants_vs_contracts: [
    {
      id: 'q1',
      question: 'What is the primary difference between grants and contracts?',
      options: [
        { value: 'a', text: 'Grants are for nonprofits only, contracts are for businesses' },
        { value: 'b', text: 'Grants fund your mission, contracts pay for specific deliverables', correct: true },
        { value: 'c', text: 'Grants are easier to get than contracts' },
        { value: 'd', text: 'There is no real difference' }
      ]
    },
    {
      id: 'q2',
      question: 'Who typically reviews grant applications?',
      options: [
        { value: 'a', text: 'Procurement officers' },
        { value: 'b', text: 'Program officers and review committees', correct: true },
        { value: 'c', text: 'Legal departments' },
        { value: 'd', text: 'Not sure' }
      ]
    }
  ],
  legal_readiness: [
    {
      id: 'q3',
      question: 'What is your current business legal structure?',
      options: [
        { value: 'a', text: '501(c)(3) nonprofit with EIN' },
        { value: 'b', text: 'LLC or Corporation with EIN' },
        { value: 'c', text: 'Sole proprietor with EIN' },
        { value: 'd', text: 'No formal structure yet' }
      ]
    },
    {
      id: 'q4',
      question: 'Do you have a governing board or advisory committee?',
      options: [
        { value: 'a', text: 'Yes, with regular meetings and minutes' },
        { value: 'b', text: 'Yes, but informal' },
        { value: 'c', text: 'Working on forming one' },
        { value: 'd', text: 'No' }
      ]
    }
  ],
  financial_readiness: [
    {
      id: 'q5',
      question: 'Do you have financial statements (budget, balance sheet)?',
      options: [
        { value: 'a', text: 'Yes, professionally prepared and current' },
        { value: 'b', text: 'Yes, but need updating' },
        { value: 'c', text: 'I have basic tracking' },
        { value: 'd', text: 'No formal financial documents' }
      ]
    },
    {
      id: 'q6',
      question: 'Can you track expenses by program or project?',
      options: [
        { value: 'a', text: 'Yes, with accounting software' },
        { value: 'b', text: 'Yes, using spreadsheets' },
        { value: 'c', text: 'Somewhat' },
        { value: 'd', text: 'No' }
      ]
    }
  ],
  confidence: [
    { id: 'q7', question: 'How confident are you in explaining your business mission to a funder?', type: 'scale' },
    { id: 'q8', question: 'How confident are you in preparing a grant proposal?', type: 'scale' }
  ]
};

const POST_QUESTIONS = {
  grants_vs_contracts: [
    {
      id: 'pq1',
      question: 'After the program, what is the primary difference between grants and contracts?',
      options: [
        { value: 'a', text: 'Grants are for nonprofits only, contracts are for businesses' },
        { value: 'b', text: 'Grants fund your mission, contracts pay for specific deliverables', correct: true },
        { value: 'c', text: 'Grants are easier to get than contracts' },
        { value: 'd', text: 'There is no real difference' }
      ]
    },
    {
      id: 'pq2',
      question: 'What type of funding is best suited for your organization right now?',
      options: [
        { value: 'a', text: 'Grants only' },
        { value: 'b', text: 'Contracts only' },
        { value: 'c', text: 'A mix of both grants and contracts' },
        { value: 'd', text: 'Neither — not ready yet' }
      ]
    }
  ],
  legal_readiness: [
    {
      id: 'pq3',
      question: 'Has your understanding of your legal readiness for funding changed?',
      options: [
        { value: 'a', text: 'Yes, significantly — I know exactly what I need' },
        { value: 'b', text: 'Yes, somewhat — I have a clearer picture' },
        { value: 'c', text: 'A little — still uncertain' },
        { value: 'd', text: 'No change' }
      ]
    },
    {
      id: 'pq4',
      question: 'What is your biggest remaining legal/structural gap?',
      options: [
        { value: 'a', text: 'Need to incorporate / formalize structure' },
        { value: 'b', text: 'Need to get EIN or update registrations' },
        { value: 'c', text: 'Board or governance documentation' },
        { value: 'd', text: 'No significant gaps remaining' }
      ]
    }
  ],
  financial_readiness: [
    {
      id: 'pq5',
      question: 'After the program, rate your financial document readiness:',
      options: [
        { value: 'a', text: 'Fully ready — all documents current and professional' },
        { value: 'b', text: 'Mostly ready — minor updates needed' },
        { value: 'c', text: 'Partially ready — significant work still needed' },
        { value: 'd', text: 'Not ready yet' }
      ]
    },
    {
      id: 'pq6',
      question: 'What is your next financial action step?',
      options: [
        { value: 'a', text: 'Update or create financial statements' },
        { value: 'b', text: 'Set up accounting software' },
        { value: 'c', text: 'Work with an accountant' },
        { value: 'd', text: 'Already on track — maintain current systems' }
      ]
    }
  ],
  confidence: [
    { id: 'pq7', question: 'How confident are you NOW in explaining your business mission to a funder?', type: 'scale' },
    { id: 'pq8', question: 'How confident are you NOW in preparing a grant proposal?', type: 'scale' }
  ]
};

function QuestionAnswer({ question, answer, isPre }) {
  if (!question) return null;
  const isScale = question.type === 'scale';

  if (isScale) {
    return (
      <div className="py-2 border-b last:border-0">
        <p className="text-xs font-medium text-slate-600 mb-1">{question.question}</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[1,2,3,4,5,6,7,8,9,10].map(n => (
              <div key={n} className={`w-6 h-6 rounded text-xs flex items-center justify-center font-medium ${
                answer === n.toString() ? 'bg-[#143A50] text-white' : 'bg-slate-100 text-slate-400'
              }`}>{n}</div>
            ))}
          </div>
          {answer && <Badge className="bg-[#143A50] text-white ml-2">{answer}/10</Badge>}
          {!answer && <span className="text-xs text-slate-400 italic">No answer</span>}
        </div>
      </div>
    );
  }

  return (
    <div className="py-2 border-b last:border-0">
      <p className="text-xs font-medium text-slate-600 mb-1">{question.question}</p>
      <div className="space-y-1">
        {question.options.map(opt => {
          const isSelected = answer === opt.value;
          return (
            <div key={opt.value} className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs ${
              isSelected ? 'bg-[#143A50] text-white font-medium' : 'text-slate-500'
            }`}>
              <span className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center text-[10px] ${
                isSelected ? 'border-white bg-white text-[#143A50]' : 'border-slate-300'
              }`}>{opt.value.toUpperCase()}</span>
              {opt.text}
              {opt.correct && !isSelected && <span className="text-green-400 ml-auto">✓ best answer</span>}
            </div>
          );
        })}
        {!answer && <p className="text-xs text-slate-400 italic px-2">No answer recorded</p>}
      </div>
    </div>
  );
}

function EvalAnswer({ question, answer }) {
  return (
    <div className="py-2 border-b last:border-0">
      <p className="text-xs font-medium text-slate-600 mb-1">{question}</p>
      {answer !== undefined && answer !== null && answer !== '' ? (
        <p className="text-sm text-slate-800 bg-slate-50 rounded px-2 py-1">{answer}</p>
      ) : (
        <p className="text-xs text-slate-400 italic">No answer</p>
      )}
    </div>
  );
}

export default function AssessmentDetailModal({ assessment, participantName, onClose }) {
  const [editMode, setEditMode] = useState(false);
  const [editedScores, setEditedScores] = useState({});
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.ProgramAssessment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-program-assessments']);
      toast.success('Assessment updated successfully');
      setEditMode(false);
    }
  });

  if (!assessment) return null;

  const type = assessment.assessment_type;
  const responses = assessment.responses || {};
  const isPre = type === 'pre';
  const isPost = type === 'post';
  const isEval = type === 'evaluation';
  const isPreFilled = assessment.prefilled;

  const questionSets = isPre ? QUESTIONS : POST_QUESTIONS;
  const allQuestions = [
    ...(questionSets.grants_vs_contracts || []),
    ...(questionSets.legal_readiness || []),
    ...(questionSets.financial_readiness || []),
    ...(questionSets.confidence || [])
  ];

  const typeLabel = isPre ? 'Pre-Assessment' : isPost ? 'Post-Assessment' : 'Program Evaluation';
  const typeColor = isPre ? 'bg-blue-100 text-blue-800' : isPost ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800';
  const notSubmitted = isPreFilled && !assessment.id;

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 flex-wrap">
            <span>{participantName || assessment.participant_email}</span>
            <Badge className={typeColor}>{typeLabel}</Badge>
            {notSubmitted && <Badge className="bg-red-100 text-red-700">Not Yet Submitted</Badge>}
          </DialogTitle>
        </DialogHeader>

        {notSubmitted && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
            This participant has not yet submitted their {typeLabel}. No responses are available.
            {assessment.jotform_data && (
              <div className="mt-3">
                <p className="font-semibold mb-1">Registration data on file:</p>
                <div className="space-y-1">
                  {Object.entries(assessment.jotform_data).filter(([,v]) => v).map(([k, v]) => (
                    <div key={k} className="flex gap-2 text-xs">
                      <span className="font-medium text-amber-900 capitalize">{k.replace(/_/g, ' ')}:</span>
                      <span className="text-amber-800">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {/* Score summary */}
          {!notSubmitted && (isPre || isPost) && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Total Score', value: assessment.total_score },
                { label: 'Grants/Contracts', value: assessment.grants_vs_contracts_score },
                { label: 'Legal Readiness', value: assessment.legal_readiness_score },
                { label: 'Financial', value: assessment.financial_readiness_score },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-2 bg-slate-50 rounded-lg">
                  <p className="text-lg font-bold text-[#143A50]">{value ?? '—'}</p>
                  <p className="text-xs text-slate-500">{label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Submitted date */}
          {!notSubmitted && assessment.created_date && (
            <p className="text-xs text-slate-400">
              Submitted: {moment(assessment.created_date).format('MMM D, YYYY [at] h:mm A')}
            </p>
          )}

          {/* Pre or Post: show questions */}
          {!notSubmitted && (isPre || isPost) && (
            <div className="space-y-4">
              {['grants_vs_contracts', 'legal_readiness', 'financial_readiness', 'confidence'].map(section => {
                const sectionLabel = {
                  grants_vs_contracts: 'Grants vs Contracts Knowledge',
                  legal_readiness: 'Legal Readiness',
                  financial_readiness: 'Financial Readiness',
                  confidence: 'Confidence Level'
                }[section];
                return (
                  <div key={section}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{sectionLabel}</p>
                    {(questionSets[section] || []).map(q => (
                      <QuestionAnswer key={q.id} question={q} answer={responses[q.id]} isPre={isPre} />
                    ))}
                  </div>
                );
              })}
            </div>
          )}

          {/* Evaluation: show all response fields */}
          {!notSubmitted && isEval && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Evaluation Responses</p>
              {[
                { key: 'overall_rating', label: 'Overall Rating (/10)' },
                { key: 'content_quality', label: 'Content Quality (/10)' },
                { key: 'facilitator_effectiveness', label: 'Facilitator Effectiveness (/10)' },
                { key: 'would_recommend', label: 'Would Recommend?' },
                { key: 'most_valuable', label: 'Most Valuable Part' },
                { key: 'suggestions', label: 'Suggestions for Improvement' },
                { key: 'goals_met', label: 'Were Program Goals Met?' },
                { key: 'additional_comments', label: 'Additional Comments' },
              ].map(({ key, label }) => (
                <EvalAnswer key={key} question={label} answer={responses[key]} />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}