'use client';

import React, { useState } from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Prompt } from '@/types/prompts';

type PromptManagementInterfaceProps = {
  initialPrompts: Prompt[];
};

export function PromptManagementInterface({ initialPrompts }: PromptManagementInterfaceProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(initialPrompts);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingPromptId, setDeletingPromptId] = useState<number | null>(null);

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setNewPromptName(prompt.name);
    setNewPromptContent(prompt.content);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (editingPrompt && newPromptName && newPromptContent) {
      try {
        const response = await fetch('/api/prompts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingPrompt.id,
            name: newPromptName,
            content: newPromptContent,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to update prompt');
        }
        const updatedPrompt = await response.json();
        setPrompts(prompts.map(p => p.id === updatedPrompt.id ? updatedPrompt : p));
        setIsEditDialogOpen(false);
        setEditingPrompt(null);
        setNewPromptName('');
        setNewPromptContent('');
      } catch (error) {
        console.error('Error updating prompt:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  const handleDeleteConfirmation = (id: number) => {
    setDeletingPromptId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletingPromptId) {
      try {
        const response = await fetch('/api/prompts', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: deletingPromptId }),
        });
        if (!response.ok) {
          throw new Error('Failed to delete prompt');
        }
        setPrompts(prompts.filter(p => p.id !== deletingPromptId));
        setIsDeleteDialogOpen(false);
        setDeletingPromptId(null);
      } catch (error) {
        console.error('Error deleting prompt:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  const handleAddNewPrompt = async () => {
    if (newPromptName && newPromptContent) {
      try {
        const response = await fetch('/api/prompts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: newPromptName,
            content: newPromptContent,
          }),
        });
        if (!response.ok) {
          throw new Error('Failed to add prompt');
        }
        const newPrompt = await response.json();
        setPrompts([...prompts, newPrompt]);
        setNewPromptName('');
        setNewPromptContent('');
      } catch (error) {
        console.error('Error adding prompt:', error);
        // Handle error (e.g., show error message to user)
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Add New Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Prompt Name"
            value={newPromptName}
            onChange={e => setNewPromptName(e.target.value)}
            className="mb-2"
          />
          <Textarea
            placeholder="Prompt Content"
            value={newPromptContent}
            onChange={e => setNewPromptContent(e.target.value)}
            className="mb-2"
          />
          <Button onClick={handleAddNewPrompt}>Add Prompt</Button>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold">Existing Prompts</h2>
      {prompts.length > 0
        ? (
            prompts.map(prompt => (
              <Card key={prompt.id}>
                <CardHeader>
                  <CardTitle>{prompt.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">{prompt.content}</p>
                  <Button onClick={() => handleEdit(prompt)} className="mr-2">Edit</Button>
                  <Button onClick={() => handleDeleteConfirmation(prompt.id)} variant="destructive">Delete</Button>
                </CardContent>
              </Card>
            ))
          )
        : (
            <p>No prompts available. Create your first prompt above.</p>
          )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="name" className="text-right">Name</label>
              <Input
                id="name"
                value={newPromptName}
                onChange={e => setNewPromptName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="prompt" className="text-right">Content</label>
              <Textarea
                id="prompt"
                value={newPromptContent}
                onChange={e => setNewPromptContent(e.target.value)}
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
              This action cannot be undone. This will permanently delete the prompt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
