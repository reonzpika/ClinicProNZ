'use client';

import { Brain, Calculator, ChevronDown, ChevronLeft, FileText, Heart, List, Mic, Plus, RefreshCw, Search, Settings, Stethoscope, Thermometer, Zap } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useConsultAssist } from '@/hooks/useConsultAssist';
import { usePromptManagement } from '@/hooks/usePromptManagement';

// Summary:
// This file contains the ConsultationApp component, which is a complex medical consultation application.
// Main features:
// 1. Patient summary input with template selection and voice recording
// 2. AI-assisted consultation with custom prompts
// 3. Differential diagnosis generation
// 4. Medical resource search functionality
// 5. GP tools organized by categories
// 6. Responsive layout with resizable columns

// Main functions:
// - handleConsultAssist: Generates AI-assisted consultation suggestions
// - handleDifferentialDiagnosis: Generates differential diagnosis
// - handleSearch: Performs search across medical resources
// - startRecording / stopRecording: Manages voice input for patient summary
// - handleCustomPrompt: Processes custom AI prompts
// - resetAll: Resets all state variables to their initial values

// Overview:
// The app is divided into two main columns: the left for patient information input and the right for AI assistance, search, and tools.
// It uses various UI components from Shadcn UI and implements a tabbed interface for the right column.
// The app maintains multiple state variables to manage different aspects of the consultation process.

export function ConsultationApp() {
  // State variables
  const [patientSummary, setPatientSummary] = useState('');
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState([]);
  const [columnRatio, setColumnRatio] = useState(50);
  const [rightColumnTab, setRightColumnTab] = useState('ai');
  const [searchCategories, setSearchCategories] = useState({
    drugs: false,
    guidelines: false,
    pathways: false,
    tests: false,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState({ drugs: [], guidelines: [], pathways: [], tests: [] });
  const [activeToolsCategory, setActiveToolsCategory] = useState('');
  const [toolsSearchQuery, setToolsSearchQuery] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('general');
  const [customPromptResults, setCustomPromptResults] = useState({});
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  // Ref for tabs scrolling
  const tabsRef = useRef(null);

  // State for tab scroll buttons visibility
  const [showLeftScroll, setShowLeftScroll] = useState(false);
  const [showRightScroll, setShowRightScroll] = useState(false);

  // Effect for checking tab scroll
  useEffect(() => {
    const checkScroll = () => {
      if (tabsRef.current) {
        setShowLeftScroll(tabsRef.current.scrollLeft > 0);
        setShowRightScroll(
          tabsRef.current.scrollLeft < tabsRef.current.scrollWidth - tabsRef.current.clientWidth,
        );
      }
    };

    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  // Function to scroll tabs
  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -100 : 100;
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  // Templates for patient summary
  const [templates, setTemplates] = useState({
    general: `Chief Complaint:

History of Present Illness:

Past Medical History:

Medications:

Allergies:

Social History:

Family History:

Review of Systems:

Physical Examination:

Assessment:

Plan:`,
    followup: `Reason for Follow-up:

Progress Since Last Visit:

Current Symptoms:

Medication Review:

New Concerns:

Physical Examination:

Assessment:

Plan:`,
    chronic: `Chronic Condition:

Current Status:

Symptom Review:

Medication Adherence:

Lifestyle Modifications:

Physical Examination:

Disease-Specific Metrics:

Complications Screening:

Assessment:

Management Plan:`,
  });

  // GP tools organized by category
  const gpTools = {
    pediatric: [
      { name: 'Pediatric Drug Calculator', icon: Calculator },
      { name: 'Growth Charts', icon: FileText },
      { name: 'Fever Management', icon: Thermometer },
      { name: 'Developmental Milestones', icon: List },
    ],
    cardiovascular: [
      { name: 'Cardiovascular Risk Calculator', icon: Heart },
      { name: 'ECG Interpretation Guide', icon: FileText },
      { name: 'Lipid Management', icon: Calculator },
      { name: 'Hypertension Guidelines', icon: List },
    ],
    mentalHealth: [
      { name: 'Depression Screening', icon: Brain },
      { name: 'Anxiety Assessment', icon: FileText },
      { name: 'ADHD Evaluation', icon: List },
      { name: 'Substance Abuse Screening', icon: Stethoscope },
    ],
    general: [
      { name: 'BMI Calculator', icon: Calculator },
      { name: 'Immunization Schedules', icon: FileText },
      { name: 'Drug Interactions Checker', icon: List },
      { name: 'Symptom Checker', icon: Stethoscope },
    ],
  };

  // Function to handle template change
  const handleTemplateChange = (value) => {
    setSelectedTemplate(value);
    setPatientSummary(templates[value]);
  };

  const {
    consultAssistResults,
    differentialDiagnosisResults,
    handleConsultAssist,
    handleDifferentialDiagnosis: handleDifferentialDiagnosisFromHook,
    isLoading,
    error,
  } = useConsultAssist();

  // Function to handle differential diagnosis
  const handleDifferentialDiagnosisClick = () => {
    console.log('handleDifferentialDiagnosisClick called');
    console.log('Current patient summary:', patientSummary);
    handleDifferentialDiagnosisFromHook(patientSummary);
    setSelectedAITask('differential');
    setRightColumnTab('ai');
  };

  // Function to handle column resizing
  const handleColumnResize = (e) => {
    const containerWidth = e.target.parentElement.offsetWidth;
    const newRatio = (e.clientX / containerWidth) * 100;
    setColumnRatio(newRatio);
  };

  // Function to handle search category changes
  const handleSearchCategoryChange = (category) => {
    setSearchCategories(prev => ({ ...prev, [category]: !prev[category] }));
  };

  // Function to handle search
  const handleSearch = () => {
    const results = {
      drugs: searchCategories.drugs ? ['Drug A', 'Drug B', 'Drug C'] : [],
      guidelines: searchCategories.guidelines ? ['Guideline 1', 'Guideline 2', 'Guideline 3'] : [],
      pathways: searchCategories.pathways ? ['Pathway X', 'Pathway Y', 'Pathway Z'] : [],
      tests: searchCategories.tests ? ['Test Alpha', 'Test Beta', 'Test Gamma'] : [],
    };
    setSearchResults(results);

    // Set the first non-empty category as the selected one
    const firstNonEmptyCategory = Object.entries(results).find(([_, values]) => values.length > 0)?.[0];
    setSelectedSearchCategory(firstNonEmptyCategory || '');
  };

  // Function to start voice recording
  const startRecording = () => {
    setIsRecording(true);
    // Simulated AI transcription
    setTimeout(() => {
      setIsRecording(false);
      const transcription = 'Patient reports experiencing frequent headaches and fatigue for the past two weeks. No recent changes in medication or lifestyle. Family history of migraines.';

      // Format transcription according to the selected template
      const formattedTranscription = formatTranscription(transcription, selectedTemplate);
      setPatientSummary(formattedTranscription);
    }, 3000);
  };

  // Function to stop voice recording
  const stopRecording = () => {
    setIsRecording(false);
  };

  // Function to format transcription
  const formatTranscription = (transcription, template) => {
    const lines = templates[template].split('\n');
    let formattedText = '';

    lines.forEach((line) => {
      if (line.trim() !== '') {
        formattedText += `${line}\n`;
        if (line.endsWith(':')) {
          formattedText += `${transcription}\n\n`;
        }
      }
    });

    return formattedText.trim();
  };

  // Function to reset all state
  const resetAll = () => {
    setPatientSummary('');
    setDifferentialDiagnosis([]);
    setSelectedAITask('consult');
    setCustomPromptResults({});
    setSearchQuery('');
    setSearchResults({ drugs: [], guidelines: [], pathways: [], tests: [] });
    setToolsSearchQuery('');
  };

  // Filter GP tools based on search query
  const filteredTools = Object.entries(gpTools).reduce((acc, [category, tools]) => {
    const filteredTools = tools.filter(tool =>
      tool.name.toLowerCase().includes(toolsSearchQuery.toLowerCase()),
    );
    if (filteredTools.length > 0) {
      acc[category] = filteredTools;
    }
    return acc;
  }, {});

  // State for selected AI task
  const [selectedAITask, setSelectedAITask] = useState('consult');

  // State for selected search result category
  const [selectedSearchCategory, setSelectedSearchCategory] = useState('');

  // Replace the existing customPrompts state with the usePromptManagement hook
  const { prompts, addPrompt, editPrompt, deletePrompt } = usePromptManagement();

  // Update the handleCustomPrompt function
  const handleCustomPrompt = (promptId: string) => {
    const selectedPrompt = prompts.find(p => p.id === promptId);
    if (selectedPrompt) {
      // Simulated AI response (replace with actual API call in production)
      const aiResponse = `AI response to: ${selectedPrompt.prompt}

This is a simulated response to the custom prompt. In a real application, this would be generated by an AI model based on the patient summary and the specific prompt.`;
      setCustomPromptResults(prev => ({ ...prev, [promptId]: aiResponse }));
      setSelectedAITask(promptId);
      setRightColumnTab('ai');
    }
  };

  // Update the addNewPrompt function
  const addNewPrompt = () => {
    if (newPromptName && newPromptContent) {
      const newPrompt = {
        id: `prompt${Date.now()}`, // Use a timestamp for a unique ID
        name: newPromptName,
        prompt: newPromptContent,
      };
      addPrompt(newPrompt);
      setNewPromptName('');
      setNewPromptContent('');
    }
  };

  // Function to add a new template
  const addNewTemplate = () => {
    if (newTemplateName && newTemplateContent) {
      setTemplates(prev => ({
        ...prev,
        [newTemplateName.toLowerCase().replace(/\s+/g, '_')]: newTemplateContent,
      }));
      setNewTemplateName('');
      setNewTemplateContent('');
    }
  };

  // Update the AIInsightsDropdown
  const AIInsightsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Zap className="mr-1 size-3" />
          AI Insights
          <ChevronDown className="ml-1 size-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {prompts.map(prompt => (
          <DropdownMenuItem key={prompt.id} onSelect={() => handleCustomPrompt(prompt.id)}>
            {prompt.name}
          </DropdownMenuItem>
        ))}
        <Separator />
        <DropdownMenuItem asChild>
          <Link href="/prompt-management" className="flex items-center">
            <Settings className="mr-2 size-4" />
            Manage AI Tasks
          </Link>
        </DropdownMenuItem>
        <Dialog>
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={e => e.preventDefault()}>
              <Plus className="mr-2 size-4" />
              Add New AI Task
            </DropdownMenuItem>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New AI Task</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newPromptName}
                  onChange={e => setNewPromptName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prompt" className="text-right">
                  Task Description
                </Label>
                <Textarea
                  id="prompt"
                  value={newPromptContent}
                  onChange={e => setNewPromptContent(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={addNewPrompt}>Add AI Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="flex h-screen max-h-screen flex-col bg-background">
      <main className="grow overflow-hidden">
        <div className="mx-auto h-full max-w-7xl p-4 sm:px-6 lg:px-8">
          <div className="flex h-full gap-4">
            <div className="flex w-1/2 flex-col">
              <Card className="flex grow flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg">Consultation</CardTitle>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)}
                          {' '}
                          Template
                          <ChevronDown className="ml-1 size-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.keys(templates).map(template => (
                          <DropdownMenuItem key={template} onSelect={() => handleTemplateChange(template)}>
                            {template.charAt(0).toUpperCase() + template.slice(1)}
                          </DropdownMenuItem>
                        ))}
                        <Separator />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={e => e.preventDefault()}>
                              <Plus className="mr-2 size-4" />
                              Add New Template
                            </DropdownMenuItem>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Template</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="templateName" className="text-right">
                                  Name
                                </Label>
                                <Input
                                  id="templateName"
                                  value={newTemplateName}
                                  onChange={e => setNewTemplateName(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="templateContent" className="text-right">
                                  Content
                                </Label>
                                <Textarea
                                  id="templateContent"
                                  value={newTemplateContent}
                                  onChange={e => setNewTemplateContent(e.target.value)}
                                  className="col-span-3"
                                  rows={10}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button onClick={addNewTemplate}>Add Template</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant={isRecording ? 'destructive' : 'secondary'}
                      size="icon"
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      <Mic className={`size-4 ${isRecording ? 'animate-pulse' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex grow flex-col pt-2">
                  <Textarea
                    placeholder="Enter patient notes here..."
                    className="min-h-0 grow resize-none"
                    value={patientSummary}
                    onChange={e => setPatientSummary(e.target.value)}
                  />
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        console.log('Consult Assist button clicked');
                        handleConsultAssist(patientSummary);
                      }}
                      size="sm"
                    >
                      <Stethoscope className="mr-1 size-3" />
                      Consult Assist
                    </Button>
                    <Button
                      onClick={() => {
                        console.log('Differential Diagnosis button clicked');
                        handleDifferentialDiagnosisClick();
                      }}
                      size="sm"
                    >
                      <List className="mr-1 size-3" />
                      Differential Diagnosis
                    </Button>
                    <AIInsightsDropdown />
                    <Button onClick={resetAll} variant="outline" size="sm">
                      <RefreshCw className="mr-1 size-3" />
                      Reset All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="w-1/2 overflow-y-auto">
              <Tabs value={rightColumnTab} onValueChange={setRightColumnTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ai">AI Assistance</TabsTrigger>
                  <TabsTrigger value="search">Search</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                </TabsList>
                <TabsContent value="ai" className="mt-2">
                  <Card>
                    <CardContent className="pt-4">
                      <Select value={selectedAITask} onValueChange={setSelectedAITask}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select AI task" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="consult">Consult Assist</SelectItem>
                          <SelectItem value="differential">Differential Diagnosis</SelectItem>
                          {prompts.map(prompt => (
                            <SelectItem key={prompt.id} value={prompt.id}>{prompt.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="mt-4">
                        {isLoading && <p>Loading...</p>}
                        {error && (
                          <p className="text-red-500">
                            Error:
                            {error}
                          </p>
                        )}
                        {!isLoading && !error && (
                          <>
                            {selectedAITask === 'consult' && (
                              <>
                                <h4 className="mb-2 font-medium">Consultation Summary:</h4>
                                <div className="mb-4" dangerouslySetInnerHTML={{ __html: consultAssistResults.response }} />
                                {console.log('Rendering Consult Assist results:', consultAssistResults.response)}
                              </>
                            )}
                            {selectedAITask === 'differential' && (
                              <>
                                <h4 className="mb-2 font-medium">Possible Diagnoses:</h4>
                                <div className="mb-4" dangerouslySetInnerHTML={{ __html: differentialDiagnosisResults.response }} />
                                {console.log('Rendering Differential Diagnosis results:', differentialDiagnosisResults.response)}
                              </>
                            )}
                            {prompts.map(prompt => (
                              selectedAITask === prompt.id && (
                                <div key={prompt.id}>
                                  <h4 className="mb-2 font-medium">{prompt.name}</h4>
                                  <p className="mb-4 text-sm text-gray-500">{prompt.prompt}</p>
                                  {customPromptResults[prompt.id] && (
                                    <div className="whitespace-pre-wrap">{customPromptResults[prompt.id]}</div>
                                  )}
                                </div>
                              )
                            ))}
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="search" className="mt-2">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <Input
                          type="search"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(searchCategories).map(([category, checked]) => (
                            <div className="flex items-center space-x-2" key={category}>
                              <Checkbox
                                id={category}
                                checked={checked}
                                onCheckedChange={() => handleSearchCategoryChange(category)}
                              />
                              <Label htmlFor={category} className="text-sm">
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full" onClick={handleSearch} size="sm">
                          <Search className="mr-1 size-3" />
                          Search
                        </Button>
                      </div>
                      {Object.values(searchResults).some(arr => arr.length > 0) && (
                        <div className="mt-4">
                          <Select value={selectedSearchCategory} onValueChange={setSelectedSearchCategory}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(searchResults).map(([category, results]) => (
                                results.length > 0 && (
                                  <SelectItem key={category} value={category}>
                                    {category.charAt(0).toUpperCase() + category.slice(1)}
                                  </SelectItem>
                                )
                              ))}
                            </SelectContent>
                          </Select>
                          <div className="mt-2">
                            {selectedSearchCategory && (
                              <ul className="list-disc space-y-1 pl-5">
                                {searchResults[selectedSearchCategory].map((result, index) => (
                                  <li key={index}>{result}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tools" className="mt-2">
                  <Card>
                    <CardContent className="pt-4">
                      <Input
                        type="search"
                        placeholder="Search tools..."
                        value={toolsSearchQuery}
                        onChange={e => setToolsSearchQuery(e.target.value)}
                        className="mb-2"
                      />
                      {activeToolsCategory
                        ? (
                            <>
                              <Button variant="outline" onClick={() => setActiveToolsCategory('')} size="sm" className="mb-2">
                                <ChevronLeft className="mr-1 size-3" />
                                Back to Categories
                              </Button>
                              <div className="grid grid-cols-2 gap-2">
                                {filteredTools[activeToolsCategory]?.map((tool, index) => (
                                  <Button key={index} variant="outline" className="flex h-16 flex-col items-center justify-center text-xs" size="sm">
                                    <tool.icon className="mb-1 size-4" />
                                    {tool.name}
                                  </Button>
                                ))}
                              </div>
                            </>
                          )
                        : (
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(filteredTools).map(([category, tools]) => (
                                <Button
                                  key={category}
                                  variant="outline"
                                  className="flex h-16 flex-col items-center justify-center text-xs"
                                  onClick={() => setActiveToolsCategory(category)}
                                  size="sm"
                                >
                                  {category.charAt(0).toUpperCase() + category.slice(1)}
                                  <span className="mt-1 text-xs text-muted-foreground">
                                    {tools.length}
                                    {' '}
                                    tools
                                  </span>
                                </Button>
                              ))}
                            </div>
                          )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
