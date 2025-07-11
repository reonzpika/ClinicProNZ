'use client';

import { Check, CreditCard, Loader2 } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/shared/components/ui/dialog';
import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select';

type First30ModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const First30Modal = ({ isOpen, onClose }: First30ModalProps) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    practiceName: '',
    practiceSize: '',
    mcpdNumber: '',
    phoneNumber: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.name) {
      setError('Email and name are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/first30-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tier: 'first_30',
          priceNZD: 30,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit');
      }

      setIsSuccess(true);
      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFormData({
          email: '',
          name: '',
          practiceName: '',
          practiceSize: '',
          mcpdNumber: '',
          phoneNumber: '',
        });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
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
          <div className="flex flex-col items-center space-y-6 py-8">
            <div className="rounded-full bg-nz-green-100 p-4">
              <Check className="size-10 text-nz-green-600" />
            </div>
            <div className="text-center">
              <h3 className="mb-2 text-xl font-bold text-gray-900">Welcome to the First 30!</h3>
              <p className="text-gray-600">
                You've secured your spot at NZ$30/month. We'll contact you within 24 hours with payment details and next steps.
              </p>
              <p className="mt-3 text-sm font-medium text-nz-blue-600">
                Your early adopter rate is locked in for 12 months!
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
          <DialogTitle className="flex items-center space-x-3">
            <div className="rounded-full bg-nz-green-100 p-2">
              <CreditCard className="size-5 text-nz-green-600" />
            </div>
            <div>
              <span className="text-lg">Join the First 30 GPs</span>
              <div className="text-sm font-normal text-gray-600">NZ$30/month • 60% off standard rate</div>
            </div>
          </DialogTitle>
          <div className="rounded-lg bg-nz-green-50 p-4">
            <p className="text-sm text-nz-green-800">
              <strong>Limited spots:</strong>
              {' '}
              Only 30 GPs will get this founding member price.
              After payment confirmation, you'll get immediate beta access and your rate is locked for 12 months.
            </p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
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
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="Dr. Your Name"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="practiceName">Practice Name</Label>
            <Input
              id="practiceName"
              value={formData.practiceName}
              onChange={e => handleChange('practiceName', e.target.value)}
              placeholder="Your Practice Name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="practiceSize">Practice Size</Label>
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
              <Label htmlFor="mcpdNumber">MCPD Number</Label>
              <Input
                id="mcpdNumber"
                value={formData.mcpdNumber}
                onChange={e => handleChange('mcpdNumber', e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phoneNumber">Phone Number</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              onChange={e => handleChange('phoneNumber', e.target.value)}
              placeholder="For payment verification (optional)"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="rounded-lg bg-nz-blue-50 p-4">
            <h4 className="mb-2 font-semibold text-nz-blue-900">What happens next:</h4>
            <ol className="space-y-1 text-sm text-nz-blue-800">
              <li>1. We'll send you payment details within 24 hours</li>
              <li>2. Once payment is confirmed, you get immediate beta access</li>
              <li>3. Your NZ$30/month rate is locked for 12 months</li>
              <li>4. Help shape the future of GP documentation in NZ</li>
            </ol>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-nz-green-600 text-white hover:bg-nz-green-700"
          >
            {isSubmitting
              ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Securing Your Spot...
                  </>
                )
              : (
                  'Secure My Founding Member Spot'
                )}
          </Button>

          <p className="text-center text-xs text-gray-500">
            No payment required now • We'll contact you with payment details
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
};
