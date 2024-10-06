'use client';

import React, { useState } from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Template } from '@/types/templates';

type TemplateManagementInterfaceProps = {
  initialTemplates: Template[];
};

export function TemplateManagementInterface({ initialTemplates }: TemplateManagementInterfaceProps) {
  const [templates, setTemplates] = useState<Template[]>(initialTemplates);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState<number | null>(null);

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplateName(template.name);
    setNewTemplateContent(template.content);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingTemplate && newTemplateName && newTemplateContent) {
      try {
        const response = await fetch('/api/templates', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingTemplate.id,
            name: newTemplateName,
            content: newTemplateContent,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update template');
        }
        const updatedTemplate = await response.json();
        setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
        setIsEditDialogOpen(false);
        setEditingTemplate(null);
        setNewTemplateName('');
        setNewTemplateContent('');
      } catch (error) {
        console.error('Error updating template:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingTemplateId !== null) {
      try {
        const response = await fetch('/api/templates', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: deletingTemplateId }),
        });
        if (!response.ok) {
          throw new Error('Failed to delete template');
        }
        setTemplates(templates.filter(t => t.id !== deletingTemplateId));
      } catch (error) {
        console.error('Error deleting template:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsDeleteDialogOpen(false);
        setDeletingTemplateId(null);
      }
    }
  };

  const handleDelete = (id: number) => {
    setDeletingTemplateId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleAddNewTemplate = async () => {
    if (newTemplateName && newTemplateContent) {
      try {
        const response = await fetch('/api/templates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newTemplateName,
            content: newTemplateContent,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to add template');
        }
        const newTemplate = await response.json();
        setTemplates([...templates, newTemplate]);
        setNewTemplateName('');
        setNewTemplateContent('');
      } catch (error) {
        console.error('Error adding template:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="mb-2 text-xl font-semibold">Add New Template</h2>
        <Input
          placeholder="Template Name"
          value={newTemplateName}
          onChange={e => setNewTemplateName(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder="Template Content"
          value={newTemplateContent}
          onChange={e => setNewTemplateContent(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleAddNewTemplate}>Add Template</Button>
      </div>

      <h2 className="text-2xl font-bold">Existing Templates</h2>
      {templates && templates.length > 0
        ? (
            templates.map(template => (
              <div key={template.id} className="flex items-center justify-between rounded border p-4">
                <div>
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-gray-500">
                    {template.content.substring(0, 100)}
                    ...
                  </p>
                </div>
                <div>
                  <Button onClick={() => handleEdit(template)} className="mr-2">Edit</Button>
                  <Button onClick={() => handleDelete(template.id)} variant="destructive">Delete</Button>
                </div>
              </div>
            ))
          )
        : (
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

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
