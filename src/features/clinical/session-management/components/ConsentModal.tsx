'use client';

import { useState } from 'react';

import { Button } from '@/src/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/components/ui/dialog';

type ConsentModalProps = {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

const CONSENT_SCRIPT = `"Just to let you know, I'll be using a digital assistant to help me take notes during our conversation today. It records and writes down what we discuss to make sure I don't miss anything important. Your information is kept secure and private, and you can ask me to pause or stop the recording at any time — no worries at all. Does that sound okay to you?"`;

export function ConsentModal({ isOpen, onConfirm, onCancel }: ConsentModalProps) {
  const [isChecked, setIsChecked] = useState(false);

  const handleConfirm = () => {
    if (isChecked) {
      onConfirm();
      setIsChecked(false); // Reset for next time
    }
  };

  const handleCancel = () => {
    onCancel();
    setIsChecked(false); // Reset for next time
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && handleCancel()}>
      <DialogContent className="max-w-2xl border border-gray-200 bg-white shadow-xl">
        <DialogHeader>
          <DialogTitle className="text-gray-900">Patient Consent Confirmation</DialogTitle>
          <DialogDescription className="text-gray-600">
            Please confirm that you have informed the patient and obtained their verbal consent before starting the recording.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <h4 className="mb-2 font-medium text-blue-900">Verbal Consent Script:</h4>
            <p className="text-sm leading-relaxed text-blue-800">
              {CONSENT_SCRIPT}
            </p>
          </div>

          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="consent-checkbox"
              checked={isChecked}
              onChange={e => setIsChecked(e.target.checked)}
              className="mt-1 size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label
              htmlFor="consent-checkbox"
              className="cursor-pointer text-sm leading-relaxed text-gray-700"
            >
              I have informed the patient using the above script and confirmed their verbal consent.
            </label>
          </div>

          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-600">
              For more information about how we handle patient data and privacy, please see our
              {' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline hover:text-blue-800"
              >
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isChecked}
            className="bg-green-600 text-white hover:bg-green-700"
          >
            Confirm and Start Recording
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
