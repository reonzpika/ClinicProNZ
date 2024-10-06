'use client';

import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { Prompt } from '@/types/prompts';

type PromptManagementInterfaceProps = {
  prompts: Prompt[];
  addPrompt: (prompt: Omit<Prompt, 'id'>) => void;
  editPrompt: (id: number, prompt: Omit<Prompt, 'id'>) => void;
  deletePrompt: (id: number) => void;
};

export function PromptManagementInterface({ prompts, addPrompt, editPrompt, deletePrompt }: PromptManagementInterfaceProps) {
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
        name: newPromptName,
        content: newPromptContent,
        userId: editingPrompt.userId,
        updatedAt: new Date(),
        createdAt: editingPrompt.createdAt,
      });
      setIsEditDialogOpen(false);
      setEditingPrompt(null);
      setNewPromptName('');
      setNewPromptContent('');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(id);
    }
  };

  const handleAddNewPrompt = () => {
    if (newPromptName && newPromptContent) {
      addPrompt({
        name: newPromptName,
        content: newPromptContent,
        userId: '', // TODO: Add the actual userId here
        updatedAt: new Date(),
        createdAt: new Date(),
      });
      setNewPromptName('');
      setNewPromptContent('');
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
                  <Button onClick={() => handleDelete(prompt.id)} variant="destructive">Delete</Button>
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
    </div>
  );
}
