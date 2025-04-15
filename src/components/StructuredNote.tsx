'use client';

import { Loader2, Save } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { GeneratedNote, NoteTemplate } from '@/types';

interface StructuredNoteProps {
  note: GeneratedNote | null;
  template: NoteTemplate | null;
  isLoading?: boolean;
  onSave: (note: GeneratedNote) => void;
}

export function StructuredNote({
  note,
  template,
  isLoading,
  onSave,
}: StructuredNoteProps) {
  const [editedSections, setEditedSections] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!note || !template) return null;

  const handleSectionEdit = (key: string, content: string) => {
    setEditedSections(prev => ({ ...prev, [key]: content }));
  };

  const handleSave = () => {
    const updatedSections = note.sections.map(section => ({
      ...section,
      content: editedSections[section.key] ?? section.content,
    }));
    onSave({ sections: updatedSections });
  };

  return (
    <Card className="p-4">
      <Tabs defaultValue="edit" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="edit">Edit Sections</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4">
          {note.sections.map(section => {
            const templateSection = template.structure.sections.find(
              s => s.key === section.key
            );
            return (
              <div key={section.key} className="space-y-2">
                <h3 className="font-medium">{templateSection?.label}</h3>
                <Textarea
                  value={editedSections[section.key] ?? section.content}
                  onChange={e => handleSectionEdit(section.key, e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            );
          })}
          <Button onClick={handleSave} className="w-full">
            <Save className="mr-2 size-4" />
            Save Changes
          </Button>
        </TabsContent>

        <TabsContent value="preview">
          <div className="space-y-4">
            {note.sections.map(section => {
              const templateSection = template.structure.sections.find(
                s => s.key === section.key
              );
              const content = editedSections[section.key] ?? section.content;
              return (
                <div key={section.key} className="space-y-1">
                  <h3 className="font-medium">{templateSection?.label}</h3>
                  <div className="whitespace-pre-wrap rounded-md bg-muted p-3">
                    {content}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
} 