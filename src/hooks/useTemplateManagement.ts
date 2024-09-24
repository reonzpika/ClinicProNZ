import { useState, useEffect } from 'react';

export interface Template {
  id: string;
  name: string;
  content: string;
}

const STORAGE_KEY = 'savedTemplates';

export function useTemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const savedTemplates = localStorage.getItem(STORAGE_KEY);
    if (savedTemplates) {
      setTemplates(JSON.parse(savedTemplates));
    }
  }, []);

  const saveTemplatesToStorage = (updatedTemplates: Template[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTemplates));
  };

  const addTemplate = (newTemplate: Omit<Template, 'id'>) => {
    const updatedTemplates = [...templates, { ...newTemplate, id: Date.now().toString() }];
    setTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
  };

  const editTemplate = (id: string, updatedTemplate: Omit<Template, 'id'>) => {
    const updatedTemplates = templates.map(template => 
      template.id === id ? { ...template, ...updatedTemplate } : template
    );
    setTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
  };

  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    setTemplates(updatedTemplates);
    saveTemplatesToStorage(updatedTemplates);
  };

  return { templates, addTemplate, editTemplate, deleteTemplate };
}