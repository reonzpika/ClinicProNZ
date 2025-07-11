/* eslint-disable style/multiline-ternary */
'use client';

import { ChevronDown, ChevronRight, X } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Card, CardContent, CardHeader } from '@/src/shared/components/ui/card';
import { Checkbox } from '@/src/shared/components/ui/checkbox';
import { Textarea } from '@/src/shared/components/ui/textarea';
import { useConsultation } from '@/src/shared/ConsultationContext';

type DiagnosisItem = {
  id: string;
  condition: string;
  probability: 'high' | 'medium' | 'low';
  selected: boolean;
};

type Problem = {
  id: string;
  title: string;
  diagnoses: DiagnosisItem[];
  customDdx: string;
};

const mockProblems: Problem[] = [
  {
    id: 'problem-1',
    title: 'Headache',
    customDdx: '',
    diagnoses: [
      {
        id: 'dx-1-1',
        condition: 'Tension-type headache',
        probability: 'high',
        selected: false,
      },
      {
        id: 'dx-1-2',
        condition: 'Migraine',
        probability: 'medium',
        selected: false,
      },
      {
        id: 'dx-1-3',
        condition: 'Cluster headache',
        probability: 'low',
        selected: false,
      },
    ],
  },
  {
    id: 'problem-2',
    title: 'Abdominal pain',
    customDdx: '',
    diagnoses: [
      {
        id: 'dx-2-1',
        condition: 'Viral gastroenteritis',
        probability: 'high',
        selected: false,
      },
      {
        id: 'dx-2-2',
        condition: 'Peptic ulcer disease',
        probability: 'medium',
        selected: false,
      },
      {
        id: 'dx-2-3',
        condition: 'Appendicitis',
        probability: 'low',
        selected: false,
      },
    ],
  },
];

export const DifferentialDiagnosisTab: React.FC = () => {
  // Use ConsultationContext for adding items
  const { addConsultationItem } = useConsultation();

  const [problems, setProblems] = useState<Problem[]>(mockProblems);
  const [expandedProblems, setExpandedProblems] = useState<string[]>(['problem-1', 'problem-2']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(true); // Set to true since we have mock data

  const handleGenerateProblems = async () => {
    setIsGenerating(true);

    // Simulate AI generation delay
    setTimeout(() => {
      // In real implementation, this would call an API to analyse consultation data
      // For now, just shuffle the existing problems
      const shuffled = [...mockProblems].sort(() => Math.random() - 0.5);
      setProblems(shuffled.map(problem => ({
        ...problem,
        diagnoses: problem.diagnoses.map(dx => ({ ...dx, selected: false })),
        customDdx: '',
      })));
      setExpandedProblems(shuffled.map(p => p.id));
      setHasGenerated(true);
      setIsGenerating(false);
    }, 2000);
  };

  const handleProblemToggle = (problemId: string) => {
    setExpandedProblems(prev =>
      prev.includes(problemId)
        ? prev.filter(id => id !== problemId)
        : [...prev, problemId],
    );
  };

  const handleRemoveProblem = (problemId: string) => {
    setProblems(prev => prev.filter(p => p.id !== problemId));
    setExpandedProblems(prev => prev.filter(id => id !== problemId));
  };

  const handleDiagnosisToggle = (problemId: string, diagnosisId: string) => {
    setProblems(prev =>
      prev.map(problem =>
        problem.id === problemId
          ? {
              ...problem,
              diagnoses: problem.diagnoses.map(dx =>
                dx.id === diagnosisId ? { ...dx, selected: !dx.selected } : dx,
              ),
            }
          : problem,
      ),
    );
  };

  const handleCustomDdxChange = (problemId: string, value: string) => {
    setProblems(prev =>
      prev.map(problem =>
        problem.id === problemId
          ? { ...problem, customDdx: value }
          : problem,
      ),
    );
  };

  const handleAddToConsultation = (problemId: string) => {
    const problem = problems.find(p => p.id === problemId);
    if (problem) {
      const selectedDiagnoses = problem.diagnoses
        .filter(dx => dx.selected)
        .map(dx => dx.condition);

      const customDdx = problem.customDdx.trim();

      // Combine selected diagnoses and custom DDx
      const allDiagnoses = [...selectedDiagnoses];
      if (customDdx) {
        allDiagnoses.push(customDdx);
      }

      if (allDiagnoses.length > 0) {
        // Add to consultation context
        addConsultationItem({
          type: 'differential-diagnosis',
          title: `Differential Diagnosis: ${problem.title}`,
          content: allDiagnoses.join(', '),
        });

        // Reset selections for this problem
        setProblems(prev =>
          prev.map(p =>
            p.id === problemId
              ? {
                  ...p,
                  diagnoses: p.diagnoses.map(dx => ({ ...dx, selected: false })),
                  customDdx: '',
                }
              : p,
          ),
        );
      }
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-orange-600 bg-orange-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  return (
    <div className="space-y-3">
      {/* Generate/Regenerate Problems Button */}
      <Button
        onClick={handleGenerateProblems}
        disabled={isGenerating}
        className="w-full bg-blue-600 text-white hover:bg-blue-700"
      >
        {isGenerating ? 'Generating...' : hasGenerated ? 'Regenerate' : 'Generate'}
        {' '}
        Problems
      </Button>

      {/* Problems List */}
      {problems.length > 0 ? (
        <div className="space-y-2">
          {problems.map((problem) => {
            const isExpanded = expandedProblems.includes(problem.id);
            const selectedCount = problem.diagnoses.filter(dx => dx.selected).length;
            const hasCustomDdx = problem.customDdx.trim().length > 0;

            return (
              <Card key={problem.id} className="border-slate-200 bg-white shadow-sm">
                {/* Problem Header */}
                <CardHeader
                  className="cursor-pointer border-b border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100"
                  onClick={() => handleProblemToggle(problem.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isExpanded
                        ? (
                            <ChevronDown size={16} className="text-slate-600" />
                          )
                        : (
                            <ChevronRight size={16} className="text-slate-600" />
                          )}
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-slate-700">
                          {problem.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-slate-400">
                        {problem.diagnoses.length}
                        {' '}
                        DDx
                        {selectedCount > 0 && (
                          <span className="ml-1 text-blue-600">
                            (
                            {selectedCount}
                            {' '}
                            selected)
                          </span>
                        )}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveProblem(problem.id);
                        }}
                        className="size-6 p-0 text-slate-400 hover:text-red-600"
                      >
                        <X size={12} />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {/* Problem Content */}
                {isExpanded && (
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Differential Diagnoses */}
                      <div className="space-y-2">
                        {problem.diagnoses.map(dx => (
                          <div
                            key={dx.id}
                            className="flex items-start space-x-3 rounded border border-slate-200 p-2"
                          >
                            <Checkbox
                              id={`${problem.id}-${dx.id}`}
                              checked={dx.selected}
                              onCheckedChange={() => handleDiagnosisToggle(problem.id, dx.id)}
                              className="mt-0.5"
                            />
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center space-x-2">
                                <label
                                  htmlFor={`${problem.id}-${dx.id}`}
                                  className="flex-1 cursor-pointer text-sm text-slate-700"
                                >
                                  {dx.condition}
                                </label>
                                <span
                                  className={`rounded px-2 py-0.5 text-xs font-medium ${getProbabilityColor(dx.probability)}`}
                                >
                                  {dx.probability}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Custom DDx Input */}
                      <div className="border-t border-slate-100 pt-3">
                        <label className="mb-2 block text-sm font-medium text-slate-600">
                          Add Custom DDx for
                          {' '}
                          {problem.title}
                          :
                        </label>
                        <Textarea
                          value={problem.customDdx}
                          onChange={e => handleCustomDdxChange(problem.id, e.target.value)}
                          placeholder="Add your own differential diagnosis..."
                          className="text-sm"
                          rows={2}
                        />
                      </div>

                      {/* Add to Consultation Button */}
                      <Button
                        onClick={() => handleAddToConsultation(problem.id)}
                        disabled={selectedCount === 0 && !hasCustomDdx}
                        className="w-full bg-green-600 text-sm text-white hover:bg-green-700"
                      >
                        Add to Consultation (
                        {selectedCount + (hasCustomDdx ? 1 : 0)}
                        {' '}
                        items)
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        // Empty State
        <div className="py-8 text-center">
          <p className="mb-3 text-sm text-slate-500">No problems identified</p>
          <p className="text-xs text-slate-400">Click "Generate Problems" to analyse consultation data</p>
        </div>
      )}

    </div>
  );
};
