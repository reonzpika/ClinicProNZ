'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Search, Zap, Stethoscope, List, Calculator, Mic, Heart, Brain, Thermometer, Plus, Settings, ChevronLeft, ChevronRight, ChevronDown, UserCircle, Info, RefreshCw } from 'lucide-react'

export function ConsultationApp() {
  const [patientSummary, setPatientSummary] = useState('')
  const [consultAssistResults, setConsultAssistResults] = useState({ history: [], examination: [] })
  const [differentialDiagnosis, setDifferentialDiagnosis] = useState([])
  const [activeAITab, setActiveAITab] = useState('consult')
  const [activeAISubTab, setActiveAISubTab] = useState('history')
  const [columnRatio, setColumnRatio] = useState(50)
  const [rightColumnTab, setRightColumnTab] = useState('ai')
  const [searchCategories, setSearchCategories] = useState({
    drugs: false,
    guidelines: false,
    pathways: false,
    tests: false,
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState({ drugs: [], guidelines: [], pathways: [], tests: [] })
  const [activeToolsCategory, setActiveToolsCategory] = useState('')
  const [toolsSearchQuery, setToolsSearchQuery] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState('general')
  const [customPrompts, setCustomPrompts] = useState([
    { id: 'prompt1', name: 'Summarize Patient History', prompt: 'Summarize the patient history in bullet points.' },
    { id: 'prompt2', name: 'Generate Treatment Plan', prompt: 'Generate a treatment plan based on the patient summary.' },
  ])
  const [customPromptResults, setCustomPromptResults] = useState({})
  const [newPromptName, setNewPromptName] = useState('')
  const [newPromptContent, setNewPromptContent] = useState('')
  const [newTemplateName, setNewTemplateName] = useState('')
  const [newTemplateContent, setNewTemplateContent] = useState('')

  const tabsRef = useRef(null)
  const [showLeftScroll, setShowLeftScroll] = useState(false)
  const [showRightScroll, setShowRightScroll] = useState(false)

  useEffect(() => {
    const checkScroll = () => {
      if (tabsRef.current) {
        setShowLeftScroll(tabsRef.current.scrollLeft > 0)
        setShowRightScroll(
          tabsRef.current.scrollLeft < tabsRef.current.scrollWidth - tabsRef.current.clientWidth
        )
      }
    }

    checkScroll()
    window.addEventListener('resize', checkScroll)
    return () => window.removeEventListener('resize', checkScroll)
  }, [])

  const scrollTabs = (direction) => {
    if (tabsRef.current) {
      const scrollAmount = direction === 'left' ? -100 : 100
      tabsRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
    }
  }

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

Management Plan:`
  })

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
  }

  const handleTemplateChange = (value) => {
    setSelectedTemplate(value)
    setPatientSummary(templates[value])
  }

  const handleConsultAssist = () => {
    setConsultAssistResults({
      history: [
        "Clarify onset and progression of symptoms",
        "Ask about any recent lifestyle changes",
        "Inquire about family history of similar conditions"
      ],
      examination: [
        "Check vital signs",
        "Perform focused physical exam based on chief complaint",
        "Consider ordering relevant diagnostic tests"
      ]
    })
    setActiveAITab('consult')
    setActiveAISubTab('history')
    setRightColumnTab('ai')
  }

  const handleDifferentialDiagnosis = () => {
    setDifferentialDiagnosis([
      "Hypertension",
      "Type 2 Diabetes",
      "Anxiety Disorder",
      "Gastroesophageal Reflux Disease (GERD)",
      "Osteoarthritis"
    ])
    setActiveAITab('differential')
    setRightColumnTab('ai')
  }

  const handleColumnResize = (e) => {
    const containerWidth = e.target.parentElement.offsetWidth
    const newRatio = (e.clientX / containerWidth) * 100
    setColumnRatio(newRatio)
  }

  const handleSearchCategoryChange = (category) => {
    setSearchCategories(prev => ({ ...prev, [category]: !prev[category] }))
  }

  const handleSearch = () => {
    setSearchResults({
      drugs: searchCategories.drugs ? ['Drug A', 'Drug B', 'Drug C'] : [],
      guidelines: searchCategories.guidelines ? ['Guideline 1', 'Guideline 2', 'Guideline 3'] : [],
      pathways: searchCategories.pathways ? ['Pathway X', 'Pathway Y', 'Pathway Z'] : [],
      tests: searchCategories.tests ? ['Test Alpha', 'Test Beta', 'Test Gamma'] : [],
    })
  }

  const startRecording = () => {
    setIsRecording(true)
    // Simulated AI transcription
    setTimeout(() => {
      setIsRecording(false)
      const transcription = "Patient reports experiencing frequent headaches and fatigue for the past two weeks. No recent changes in medication or lifestyle. Family history of migraines."
      
      // Format transcription according to the selected template
      const formattedTranscription = formatTranscription(transcription, selectedTemplate)
      setPatientSummary(formattedTranscription)
    }, 3000)
  }

  const stopRecording = () => {
    setIsRecording(false)
  }

  const formatTranscription = (transcription, template) => {
    const lines = templates[template].split('\n')
    let formattedText = ''

    lines.forEach(line => {
      if (line.trim() !== '') {
        formattedText += line + '\n'
        if (line.endsWith(':')) {
          formattedText += transcription + '\n\n'
        }
      }
    })

    return formattedText.trim()
  }

  const handleCustomPrompt = (promptId) => {
    const selectedPrompt = customPrompts.find(p => p.id === promptId)
    // Simulated AI response
    const aiResponse = `AI response to: ${selectedPrompt.prompt}

This is a simulated response to the custom prompt. In a real application, this would be generated by an AI model based on the patient summary and the specific prompt.`
    setCustomPromptResults(prev => ({ ...prev, [promptId]: aiResponse }))
    setActiveAITab(promptId)
    setRightColumnTab('ai')
  }

  const addNewPrompt = () => {
    if (newPromptName && newPromptContent) {
      const newPrompt = {
        id: `prompt${customPrompts.length + 1}`,
        name: newPromptName,
        prompt: newPromptContent
      }
      setCustomPrompts(prev => [...prev, newPrompt])
      setNewPromptName('')
      setNewPromptContent('')
    }
  }

  const addNewTemplate = () => {
    if (newTemplateName && newTemplateContent) {
      setTemplates(prev => ({
        ...prev,
        [newTemplateName.toLowerCase().replace(/\s+/g, '_')]: newTemplateContent
      }))
      setNewTemplateName('')
      setNewTemplateContent('')
    }
  }

  const resetAll = () => {
    setPatientSummary('')
    setConsultAssistResults({ history: [], examination: [] })
    setDifferentialDiagnosis([])
    setActiveAITab('consult')
    setActiveAISubTab('history')
    setCustomPromptResults({})
    setSearchQuery('')
    setSearchResults({ drugs: [], guidelines: [], pathways: [], tests: [] })
    setToolsSearchQuery('')
  }

  const filteredTools = Object.entries(gpTools).reduce((acc, [category, tools]) => {
    const filteredTools = tools.filter(tool => 
      tool.name.toLowerCase().includes(toolsSearchQuery.toLowerCase())
    )
    if (filteredTools.length > 0) {
      acc[category] = filteredTools
    }
    return acc
  }, {})

  return (
    <div className="flex flex-col h-screen max-h-screen bg-gray-100">
      <main className="flex-grow overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-full">
          <div className="flex h-full relative">
            <div style={{ width: `${columnRatio}%` }} className="pr-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Consultation</CardTitle>
                  <div className="flex items-center space-x-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          {selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {Object.keys(templates).map((template) => (
                          <DropdownMenuItem key={template} onSelect={() => handleTemplateChange(template)}>
                            {template.charAt(0).toUpperCase() + template.slice(1)}
                          </DropdownMenuItem>
                        ))}
                        <Separator />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Plus className="mr-2 h-4 w-4" />
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
                                  onChange={(e) => setNewTemplateName(e.target.value)}
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
                                  onChange={(e) => setNewTemplateContent(e.target.value)}
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
                      variant={isRecording ? "destructive" : "secondary"}
                      size="icon"
                      onClick={isRecording ? stopRecording : startRecording}
                    >
                      <Mic className={`h-4 w-4 ${isRecording ? 'animate-pulse' : ''}`} />
                      <span className="sr-only">{isRecording ? 'Stop Recording' : 'Start Recording'}</span>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <Textarea 
                    placeholder="Enter patient notes here..." 
                    className="flex-grow min-h-0"
                    value={patientSummary}
                    onChange={(e) => setPatientSummary(e.target.value)}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 mt-4">
                    <Button onClick={handleConsultAssist}>
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Consult Assist
                    </Button>
                    <Button onClick={handleDifferentialDiagnosis}>
                      <List className="mr-2 h-4 w-4" />
                      Differential Diagnosis
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Zap className="mr-2 h-4 w-4" />
                          AI Insights
                          <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {customPrompts.map(prompt => (
                          <DropdownMenuItem key={prompt.id} onSelect={() => handleCustomPrompt(prompt.id)}>
                            {prompt.name}
                          </DropdownMenuItem>
                        ))}
                        <Separator />
                        <Dialog>
                          <DialogTrigger asChild>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                              <Plus className="mr-2 h-4 w-4" />
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
                                  onChange={(e) => setNewPromptName(e.target.value)}
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
                                  onChange={(e) => setNewPromptContent(e.target.value)}
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
                    <Button onClick={resetAll} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reset All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div 
              className="w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize" 
              onMouseDown={(e) => {
                document.addEventListener('mousemove', handleColumnResize)
                document.addEventListener('mouseup', () => {
                  document.removeEventListener('mousemove', handleColumnResize)
                }, { once: true })
              }}
            />
            
            <div style={{ width: `${100 - columnRatio}%` }} className="pl-4 overflow-y-auto">
              <Tabs value={rightColumnTab} onValueChange={setRightColumnTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="ai">AI Assistance</TabsTrigger>
                  <TabsTrigger value="search">Search</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                </TabsList>
                <TabsContent value="ai">
                  <Card>
                    <CardHeader>
                      <CardTitle>AI Assistance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs value={activeAITab} onValueChange={setActiveAITab}>
                        <div className="relative">
                          {showLeftScroll && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute left-0 top-0 bottom-0 z-10"
                              onClick={() => scrollTabs('left')}
                            >
                              <ChevronLeft className="h-4 w-4" />
                            </Button>
                          )}
                          {showRightScroll && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 bottom-0 z-10"
                              onClick={() => scrollTabs('right')}
                            >
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          )}
                          <ScrollArea className="w-full">
                            <TabsList ref={tabsRef} className="inline-flex w-full justify-start">
                              <TabsTrigger value="consult">Consult Assist</TabsTrigger>
                              <TabsTrigger value="differential">Differential Diagnosis</TabsTrigger>
                              {customPrompts.map(prompt => (
                                <TabsTrigger key={prompt.id} value={prompt.id}>{prompt.name}</TabsTrigger>
                              ))}
                            </TabsList>
                          </ScrollArea>
                        </div>
                        <TabsContent value="consult" className="mt-4">
                          <Tabs value={activeAISubTab} onValueChange={setActiveAISubTab}>
                            <TabsList>
                              <TabsTrigger value="history">History</TabsTrigger>
                              <TabsTrigger value="examination">Examination</TabsTrigger>
                            </TabsList>
                            <TabsContent value="history" className="mt-2">
                              <h4 className="font-medium mb-2">Key History Points:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {consultAssistResults.history.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </TabsContent>
                            <TabsContent value="examination" className="mt-2">
                              <h4 className="font-medium mb-2">Recommended Examination Steps:</h4>
                              <ul className="list-disc pl-5 space-y-1">
                                {consultAssistResults.examination.map((item, index) => (
                                  <li key={index}>{item}</li>
                                ))}
                              </ul>
                            </TabsContent>
                          </Tabs>
                        </TabsContent>
                        <TabsContent value="differential" className="mt-4">
                          <h4 className="font-medium mb-2">Possible Diagnoses:</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {differentialDiagnosis.map((diagnosis, index) => (
                              <li key={index}>{diagnosis}</li>
                            ))}
                          </ul>
                        </TabsContent>
                        {customPrompts.map(prompt => (
                          <TabsContent key={prompt.id} value={prompt.id} className="mt-4">
                            <h4 className="font-medium mb-2">{prompt.name}</h4>
                            <p className="text-sm text-gray-500 mb-4">{prompt.prompt}</p>
                            {customPromptResults[prompt.id] && (
                              <div className="whitespace-pre-wrap">{customPromptResults[prompt.id]}</div>
                            )}
                          </TabsContent>
                        ))}
                      </Tabs>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="search">
                  <Card>
                    <CardHeader>
                      <CardTitle>Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <Input 
                          type="search" 
                          placeholder="Search..." 
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(searchCategories).map(([category, checked]) => (
                            <div className="flex items-center space-x-2" key={category}>
                              <Checkbox
                                id={category}
                                checked={checked}
                                onCheckedChange={() => handleSearchCategoryChange(category)}
                              />
                              <Label htmlFor={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </Label>
                            </div>
                          ))}
                        </div>
                        <Button className="w-full" onClick={handleSearch}>
                          <Search className="mr-2 h-4 w-4" />
                          Search
                        </Button>
                      </div>
                      {Object.values(searchResults).some(arr => arr.length > 0) && (
                        <div className="mt-6">
                          <Tabs defaultValue="drugs">
                            <ScrollArea className="w-full whitespace-nowrap">
                              <TabsList className="inline-flex">
                                {Object.entries(searchResults).map(([category, results]) => (
                                  results.length > 0 && (
                                    <TabsTrigger value={category} key={category}>
                                      {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </TabsTrigger>
                                  )
                                ))}
                              </TabsList>
                            </ScrollArea>
                            {Object.entries(searchResults).map(([category, results]) => (
                              results.length > 0 && (
                                <TabsContent value={category} key={category}>
                                  <ul className="list-disc pl-5 space-y-1">
                                    {results.map((result, index) => (
                                      <li key={index}>{result}</li>
                                    ))}
                                  </ul>
                                </TabsContent>
                              )
                            ))}
                          </Tabs>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tools">
                  <Card>
                    <CardHeader>
                      <CardTitle>GP Tools</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Input 
                        type="search" 
                        placeholder="Search tools..." 
                        value={toolsSearchQuery}
                        onChange={(e) => setToolsSearchQuery(e.target.value)}
                        className="mb-4"
                      />
                      {activeToolsCategory ? (
                        <>
                          <Button variant="outline" onClick={() => setActiveToolsCategory('')} className="mb-4">
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Back to Categories
                          </Button>
                          <div className="grid grid-cols-2 gap-4">
                            {filteredTools[activeToolsCategory]?.map((tool, index) => (
                              <Button key={index} variant="outline" className="h-20 flex flex-col items-center justify-center">
                                <tool.icon className="h-6 w-6 mb-2" />
                                {tool.name}
                              </Button>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(filteredTools).map(([category, tools]) => (
                            <Button
                              key={category}
                              variant="outline"
                              className="h-20 flex flex-col items-center justify-center"
                              onClick={() => setActiveToolsCategory(category)}
                            >
                              {category.charAt(0).toUpperCase() + category.slice(1)}
                              <span className="text-sm text-gray-500 mt-1">{tools.length} tools</span>
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
  )
}