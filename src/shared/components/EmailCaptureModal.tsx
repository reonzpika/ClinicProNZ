'use client';

import { Check, Loader2, Mail } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select';
import { Textarea } from '@/src/shared/components/ui/textarea';

type EmailCaptureModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const EmailCaptureModal = ({ isOpen, onClose }: EmailCaptureModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    practiceName: '',
    practiceSize: '',
    biggestChallenge: '',
    hasUsedAIScribing: '',
    whichAITool: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email) {
      setError('Email is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/email-capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit');
      }

      setIsSuccess(true);
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          email: '',
          name: '',
          practiceName: '',
          practiceSize: '',
          biggestChallenge: '',
          hasUsedAIScribing: '',
          whichAITool: '',
        });
      }, 2000);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="border bg-white shadow-2xl sm:max-w-md">
          <div className="flex flex-col items-center space-y-4 py-8">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="size-8 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">You're In!</h3>
              <p className="text-gray-600">
                Thanks for joining our early access program. We'll be in touch soon!
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border bg-white shadow-2xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="size-5 text-blue-600" />
            <span>Get Free Access (Limited Time)</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Be among the first 30 NZ GPs to try ClinicPro. We're offering free access in exchange for your valuable feedback before our public launch.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name (Optional)</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Your Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="practiceName">Practice Name (Optional)</Label>
            <Input
              id="practiceName"
              value={formData.practiceName}
              onChange={e => handleChange('practiceName', e.target.value)}
              placeholder="Your Practice Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="practiceSize">Practice Size (Optional)</Label>
            <Select value={formData.practiceSize} onValueChange={value => handleChange('practiceSize', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select practice size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="solo">Solo GP</SelectItem>
                <SelectItem value="2-5">2-5 GPs</SelectItem>
                <SelectItem value="6-10">6-10 GPs</SelectItem>
                <SelectItem value="10+">10+ GPs</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="biggestChallenge">What's your biggest documentation challenge? (Optional)</Label>
            <Textarea
              id="biggestChallenge"
              value={formData.biggestChallenge}
              onChange={e => handleChange('biggestChallenge', e.target.value)}
              placeholder="e.g., Takes too long, hard to read, missing important details..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hasUsedAIScribing">Have you used AI scribing tools before? (Optional)</Label>
            <Select value={formData.hasUsedAIScribing} onValueChange={value => handleChange('hasUsedAIScribing', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your experience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No, I haven't used any</SelectItem>
                <SelectItem value="yes">Yes, I have experience with AI scribing</SelectItem>
                <SelectItem value="considering">I'm considering trying one</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.hasUsedAIScribing === 'yes' && (
            <div className="space-y-2">
              <Label htmlFor="whichAITool">Which AI scribing tool(s) have you used? (Optional)</Label>
              <Input
                id="whichAITool"
                value={formData.whichAITool}
                onChange={e => handleChange('whichAITool', e.target.value)}
                placeholder="e.g., Heidi, Nuance Dragon, Abridge, etc."
              />
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Maybe Later
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Joining...
                    </>
                  )
                : (
                    'Join Early Access'
                  )}
            </Button>
          </div>

          <p className="text-center text-xs text-gray-500">
            No commitment. We'll keep you updated on our progress and contact you when ready.
          </p>
        </form>

        {/* Extra bottom padding for mobile keyboard scrolling */}
        <div className="h-32 sm:h-0"></div>
      </DialogContent>
    </Dialog>
  );
};
