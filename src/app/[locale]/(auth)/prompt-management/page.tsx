'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { usePromptManagement } from '@/hooks/usePromptManagement';

export default function PromptManagementPage() {
  const router = useRouter();
  const { prompts, addPrompt, editPrompt, deletePrompt } = usePromptManagement();
  const [newPromptName, setNewPromptName] = React.useState('');
  const [newPromptContent, setNewPromptContent] = React.useState('');
  const [editingPrompt, setEditingPrompt] = React.useState<string | null>(null);

  const handleAddPrompt = () => {
    if (newPromptName && newPromptContent) {
      addPrompt({ name: newPromptName, content: newPromptContent });
      setNewPromptName('');
      setNewPromptContent('');
    }
  };

  const handleEditPrompt = (id: string) => {
    const prompt = prompts.find(p => p.id === id);
    if (prompt) {
      setEditingPrompt(id);
      setNewPromptName(prompt.name);
      setNewPromptContent(prompt.content);
    }
  };

  const handleUpdatePrompt = () => {
    if (editingPrompt && newPromptName && newPromptContent) {
      editPrompt(editingPrompt, { name: newPromptName, content: newPromptContent });
      setEditingPrompt(null);
      setNewPromptName('');
      setNewPromptContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingPrompt(null);
    setNewPromptName('');
    setNewPromptContent('');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Prompt Management</h1>
        <Button onClick={() => router.push('/')}>Go Back</Button>
      </div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>{editingPrompt ? 'Edit Prompt' : 'Add New Prompt'}</CardTitle>
        </CardHeader>
        <CardContent>
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
          {editingPrompt ? (
            <div>
              <Button onClick={handleUpdatePrompt} className="mr-2">Update Prompt</Button>
              <Button onClick={handleCancelEdit} variant="outline">Cancel</Button>
            </div>
          ) : (
            <Button onClick={handleAddPrompt}>Add Prompt</Button>
          )}
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <Card key={prompt.id}>
            <CardHeader>
              <CardTitle>{prompt.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-2">{prompt.content}</p>
              <Button variant="outline" onClick={() => handleEditPrompt(prompt.id)} className="mr-2">
                Edit
              </Button>
              <Button variant="outline" onClick={() => deletePrompt(prompt.id)}>
                Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
