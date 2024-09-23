import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { PromptManagementInterface } from '@/components/PromptManagementInterface';
import { Button } from '@/components/ui/button';

export default function PromptManagementPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Prompt Management</h1>
        <Link href="/">
          <Button variant="outline" size="sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
      <PromptManagementInterface />
    </div>
  );
}