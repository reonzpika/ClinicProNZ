'use client';

import { useState } from 'react';
import { 
  Search, 
  Brain, 
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Clock,
  Star,
  Lightbulb,
  Loader2
} from 'lucide-react';

import { Container } from '@/shared/components/layout/Container';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';

interface Symptom {
  id: string;
  name: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
}

interface DifferentialDiagnosis {
  id: string;
  condition: string;
  probability: number;
  keyFeatures: string[];
  redFlags: string[];
  nextSteps: string[];
}

export default function DifferentialDiagnosisPage() {
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [diagnoses, setDiagnoses] = useState<DifferentialDiagnosis[]>([]);

  const addSymptom = () => {
    if (!newSymptom.trim()) return;
    
    const symptom: Symptom = {
      id: Date.now().toString(),
      name: newSymptom.trim(),
      severity: 'moderate',
      duration: 'Recent'
    };
    
    setSymptoms(prev => [...prev, symptom]);
    setNewSymptom('');
  };

  const removeSymptom = (id: string) => {
    setSymptoms(prev => prev.filter(s => s.id !== id));
  };

  const generateDifferentials = async () => {
    if (symptoms.length === 0) return;
    
    setIsAnalyzing(true);
    
    // Mock analysis - in real implementation, this would call an API
    setTimeout(() => {
      const mockDiagnoses: DifferentialDiagnosis[] = [
        {
          id: '1',
          condition: 'Viral Upper Respiratory Infection',
          probability: 75,
          keyFeatures: ['Gradual onset', 'Runny nose', 'Mild fever', 'Cough'],
          redFlags: ['High fever >39°C', 'Severe headache', 'Neck stiffness'],
          nextSteps: ['Supportive care', 'Paracetamol for fever', 'Return if worsening']
        },
        {
          id: '2',
          condition: 'Bacterial Sinusitis',
          probability: 45,
          keyFeatures: ['Purulent discharge', 'Facial pain', 'Symptoms >10 days'],
          redFlags: ['Periorbital swelling', 'Severe headache', 'Visual changes'],
          nextSteps: ['Consider antibiotics', 'Nasal decongestants', 'Review in 5-7 days']
        },
        {
          id: '3',
          condition: 'Allergic Rhinitis',
          probability: 30,
          keyFeatures: ['Seasonal pattern', 'Itchy eyes', 'Clear discharge'],
          redFlags: ['Severe asthma', 'Anaphylaxis history'],
          nextSteps: ['Allergen avoidance', 'Antihistamines', 'Nasal corticosteroids']
        }
      ];
      
      setDiagnoses(mockDiagnoses);
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <Container size="full" className="h-full">
      <div className="flex h-full flex-col py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Brain className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Differential Diagnosis
              </h1>
              <p className="text-sm text-slate-600">
                AI-powered clinical decision support
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="bg-amber-100 px-3 py-1 rounded-full">
              <span className="text-sm font-medium text-amber-800">Coming Soon</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-1 gap-6">
          {/* Input Panel */}
          <div className="flex-1 space-y-6">
            {/* Symptom Input */}
            <Card>
              <CardHeader>
                <CardTitle>Enter Patient Symptoms</CardTitle>
                <CardDescription>
                  Add symptoms to generate differential diagnoses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
              
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSymptom}
                    onChange={(e) => setNewSymptom(e.target.value)}
                    placeholder="e.g., headache, fever, cough..."
                    className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
                  />
                  <Button
                    onClick={addSymptom}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700"
                  >
                    Add
                  </Button>
                </div>

                {/* Symptom List */}
                <div className="space-y-2">
                  {symptoms.map((symptom) => (
                    <div
                      key={symptom.id}
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="h-3 w-3 rounded-full bg-purple-500"></div>
                        <span className="font-medium text-slate-900">{symptom.name}</span>
                      </div>
                      <button
                        onClick={() => removeSymptom(symptom.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {symptoms.length > 0 && (
                  <Button
                    onClick={generateDifferentials}
                    disabled={isAnalyzing}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analysing...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Generate Differentials
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Feature Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lightbulb className="mr-2 h-5 w-5 text-amber-500" />
                  Planned Features
                </CardTitle>
                <CardDescription>
                  Upcoming enhancements to differential diagnosis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-700">NZ clinical guidelines integration</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-700">Red flag identification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-700">Risk stratification</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-700">Investigation recommendations</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-slate-700">Referral pathways</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="w-96 space-y-6">
            {diagnoses.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle>Differential Diagnoses</CardTitle>
                  <CardDescription>
                    AI-generated differential diagnoses with confidence levels
                  </CardDescription>
                </CardHeader>
                <CardContent>
                
                <div className="space-y-4">
                  {diagnoses.map((diagnosis) => (
                    <div
                      key={diagnosis.id}
                      className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                                              <div className="mb-3 flex items-center justify-between">
                          <h3 className="font-semibold text-slate-900">
                            {diagnosis.condition}
                          </h3>
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-16 rounded-full bg-slate-200">
                              <div
                                className="h-2 rounded-full bg-purple-500"
                                style={{ width: `${diagnosis.probability}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {diagnosis.probability}%
                            </span>
                          </div>
                        </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <h4 className="mb-1 font-medium text-green-700">
                            <CheckCircle className="mr-1 inline h-3 w-3" />
                            Key Features
                          </h4>
                          <ul className="space-y-1 text-slate-600">
                            {diagnosis.keyFeatures.map((feature, index) => (
                              <li key={index}>• {feature}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="mb-1 font-medium text-red-700">
                            <AlertCircle className="mr-1 inline h-3 w-3" />
                            Red Flags
                          </h4>
                          <ul className="space-y-1 text-slate-600">
                            {diagnosis.redFlags.map((flag, index) => (
                              <li key={index}>• {flag}</li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="mb-1 font-medium text-blue-700">
                            <ArrowRight className="mr-1 inline h-3 w-3" />
                            Next Steps
                          </h4>
                          <ul className="space-y-1 text-slate-600">
                            {diagnosis.nextSteps.map((step, index) => (
                              <li key={index}>• {step}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-slate-900">
                      No Analysis Yet
                    </h3>
                    <p className="mb-4 text-slate-600">
                      Add patient symptoms to generate differential diagnoses
                    </p>
                    <div className="text-sm text-slate-500">
                      <Clock className="mr-1 inline h-4 w-4" />
                      This feature is currently in development
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
} 