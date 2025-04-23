'use client';

import { useState } from 'react';

import type { TemplateSection, TemplateVariable, TemplateWithSections } from '@/types/templates';

import { SectionBuilder } from './SectionBuilder';
import { VariableManager } from './VariableManager';

type TemplateEditorProps = {
  template?: TemplateWithSections;
  isNew?: boolean;
  onSave: (template: TemplateWithSections) => Promise<void>;
  onCancel: () => void;
};

export function TemplateEditor({ template, isNew = false, onSave, onCancel }: TemplateEditorProps) {
  // Template basic info
  const [name, setName] = useState(template?.name ?? '');
  const [description, setDescription] = useState(template?.description ?? '');

  // Sections management
  const [sections, setSections] = useState<TemplateSection[]>(template?.sections ?? []);

  // Variables management
  const [variables, setVariables] = useState<Record<string, TemplateVariable>>(
    template?.variables ?? {},
  );

  // Form state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (sections.length === 0) {
      newErrors.sections = 'At least one section is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave({
        ...template,
        name,
        description,
        sections,
        variables,
      } as TemplateWithSections);
    } catch (error) {
      console.error('Failed to save template:', error);
      setErrors({ submit: 'Failed to save template. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSectionUpdate = (updatedSection: TemplateSection, index: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      newSections[index] = updatedSection;
      return newSections;
    });
  };

  const handleSectionAdd = () => {
    setSections(prev => [
      ...prev,
      {
        title: '',
        content: '',
        order: prev.length,
      } as TemplateSection,
    ]);
  };

  const handleSectionDelete = (index: number) => {
    setSections((prev) => {
      const newSections = prev.filter((_, i) => i !== index);
      // Update order of remaining sections
      return newSections.map((section, i) => ({
        ...section,
        order: i,
      }));
    });
  };

  const handleSectionReorder = (fromIndex: number, toIndex: number) => {
    setSections((prev) => {
      const newSections = [...prev];
      const [movedSection] = newSections.splice(fromIndex, 1);
      newSections.splice(toIndex, 0, movedSection);
      // Update order of all sections
      return newSections.map((section, i) => ({
        ...section,
        order: i,
      }));
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Template Name *
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            className={`mt-1 block w-full rounded-md border ${
              errors.name ? 'border-red-500' : 'border-gray-300'
            } px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Variables */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Variables</h2>
        <VariableManager
          variables={variables}
          onChange={setVariables}
        />
      </div>

      {/* Sections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Sections</h2>
          <button
            type="button"
            onClick={handleSectionAdd}
            className="text-blue-500 hover:text-blue-600"
          >
            Add Section
          </button>
        </div>

        {errors.sections && (
          <p className="text-sm text-red-500">{errors.sections}</p>
        )}

        <div className="space-y-4">
          {sections.map((section, index) => (
            <SectionBuilder
              key={index}
              section={section}
              onChange={(updatedSection: TemplateSection) => handleSectionUpdate(updatedSection, index)}
              onDelete={() => handleSectionDelete(index)}
              onMoveUp={index > 0 ? () => handleSectionReorder(index, index - 1) : undefined}
              onMoveDown={
                index < sections.length - 1
                  ? () => handleSectionReorder(index, index + 1)
                  : undefined
              }
            />
          ))}
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="text-sm text-red-500">{errors.submit}</div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isNew ? 'Create Template' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
