'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { usePromptManagement } from '@/hooks/usePromptManagement';
import type { Prompt } from '@/types/prompts';

export function PromptManagementInterface() {
  const { prompts, addPrompt, editPrompt, deletePrompt } = usePromptManagement();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [newPromptName, setNewPromptName] = useState('');
  const [newPromptContent, setNewPromptContent] = useState('');

  const handleEdit = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setNewPromptName(prompt.name);
    setNewPromptContent(prompt.content);
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (editingPrompt && newPromptName && newPromptContent) {
      editPrompt(editingPrompt.id, {
        ...editingPrompt,
        name: newPromptName,
        content: newPromptContent,
      });
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
      setNewPromptName('');
      setNewPromptContent('');
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(id);
    }
  };

  const handleAddNewPrompt = () => {
    if (newPromptName && newPromptContent) {
      addPrompt({
        name: newPromptName,
        content: newPromptContent,
      });
      setNewPromptName('');
      setNewPromptContent('');
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h2 className="mb-2 text-xl font-semibold">Add New Prompt</h2>
        <Input
          placeholder="Prompt Name"
          value={newPromptName}
          onChange={(e) => setNewPromptName(e.target.value)}
          className="mb-2"
        />
        <Textarea
          placeholder="Prompt Content"
          value={newPromptContent}
          onChange={(e) => setNewPromptContent(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleAddNewPrompt}>Add Prompt</Button>
      </div>

      <h2 className="text-2xl font-bold">Existing Prompts</h2>
      {prompts.map(prompt => (
        <div key={prompt.id} className="flex items-center justify-between rounded border p-4">
          <div>
            <h3 className="font-semibold">{prompt.name}</h3>
            <p className="text-sm text-gray-500">{prompt.content}</p>
          </div>
          <div>
            <Button onClick={() => handleEdit(prompt)} className="mr-2">Edit</Button>
            <Button onClick={() => handleDelete(prompt.id)} variant="destructive">Delete</Button>
          </div>
        </div>
      ))}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Task</DialogTitle>
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
              <label htmlFor="prompt" className="text-right">Task Description</label>
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
    </div>
  );
}