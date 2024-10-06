import { useCallback, useEffect, useState } from 'react';

export type Template = {
  id: number;
  name: string;
  content: string;
};

export function useTemplateManagement() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError('Error fetching templates');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const addTemplate = async (newTemplate: Omit<Template, 'id'>) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });
      if (!response.ok) {
        throw new Error('Failed to add template');
      }
      const addedTemplate = await response.json();
      setTemplates(prevTemplates => [...prevTemplates, addedTemplate]);
    } catch (err) {
      setError('Error adding template');
      console.error(err);
    }
  };

  const editTemplate = async (id: number, updatedTemplate: Omit<Template, 'id'>) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedTemplate }),
      });
      if (!response.ok) {
        throw new Error('Failed to update template');
      }
      const editedTemplate = await response.json();
      setTemplates(templates.map(template =>
        template.id === id ? editedTemplate : template,
      ));
    } catch (err) {
      setError('Error updating template');
      console.error(err);
    }
  };

  const deleteTemplate = async (id: number) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        throw new Error('Failed to delete template');
      }
      setTemplates(templates.filter(template => template.id !== id));
    } catch (err) {
      setError('Error deleting template');
      console.error(err);
    }
  };

  return { templates, isLoading, error, addTemplate, editTemplate, deleteTemplate };
}
