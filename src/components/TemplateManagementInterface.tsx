'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import type { Template } from '@/hooks/useTemplateManagement';

interface TemplateManagementInterfaceProps {
  templates: Template[];
  addTemplate: (template: Omit<Template, 'id'>) => void;
  editTemplate: (id: string, template: Omit<Template, 'id'>) => void;
  deleteTemplate: (id: string) => void;
}

export function TemplateManagementInterface({
  templates,
  addTemplate,
  editTemplate,
  deleteTemplate,
}: TemplateManagementInterfaceProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateContent(template.content);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingTemplate && newTemplateName && newTemplateContent) {
      editTemplate(editingTemplate.id, {
        name: newTemplateName,
        content: newTemplateContent,
      });
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      setNewTemplateName('');
      setNewTemplateContent('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      deleteTemplate(id);
    }
  };

  const handleAddNewTemplate = () => {
    if (newTemplateName && newTemplateContent) {
      addTemplate({
        name: newTemplateName,
        content: newTemplateContent,
      });
      setNewTemplateName('');
      setNewTemplateContent('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="mb-2 text-xl font-semibold">Add New Template</h2>
        <Input
          placeholder="Template Name"
          value={newTemplateName}
          onChange={(e) => setNewTemplateName(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder="Template Content"
          value={newTemplateContent}
          onChange={(e) => setNewTemplateContent(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleAddNewTemplate}>Add Template</Button>
      </div>

      <h2 className="text-2xl font-bold">Existing Templates</h2>
      {templates && templates.length > 0 ? (
        templates.map(template => (
          <div key={template.id} className="flex items-center justify-between rounded border p-4">
            <div>
              <h3 className="font-semibold">{template.name}</h3>
              <p className="text-sm text-gray-500">{template.content.substring(0, 100)}...</p>
            </div>
            <div>
              <Button onClick={() => handleEdit(template)} className="mr-2">Edit</Button>
              <Button onClick={() => handleDelete(template.id)} variant="destructive">Delete</Button>
            </div>
          </div>
        ))
      ) : (
        <p>No templates available. Create your first template above.</p>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">Name</label>
              <Input
                id="name"
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="content" className="text-right">Content</label>
              <Textarea
                id="content"
                value={newTemplateContent}
                onChange={e => setNewTemplateContent(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}