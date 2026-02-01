'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Container } from '@/src/shared/components/layout/Container';
import { Button } from '@/src/shared/components/ui/button';

export default function ContactPage() {
  const { isSignedIn } = useAuth();
  const { user } = useUser();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-populate user data when component mounts or user changes
  useEffect(() => {
    if (isSignedIn && user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || user.fullName || '',
        email: prev.email || user.primaryEmailAddress?.emailAddress || '',
      }));
    }
  }, [isSignedIn, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus('success');
        // Reset form except user data
        setFormData(prev => ({
          name: prev.name,
          email: prev.email,
          subject: '',
          message: '',
        }));
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.error || 'Failed to send message');
        setSubmitStatus('error');
      }
    } catch {
      setErrorMessage('Network error. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <Container size="md">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="text-xl font-bold text-text-primary">
              ClinicPro
            </Link>
          </div>
        </Container>
      </header>

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        <div className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="mx-auto max-w-4xl">
              <h1 className="mb-8 text-4xl font-bold text-gray-900">Contact Us</h1>

              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-2xl font-semibold text-gray-900">Get in Touch</h2>
                  <p className="mb-6 text-gray-600">
                    Have questions about ClinicPro? We'd love to hear from you.
                    Send us a message and we'll respond as soon as possible.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">Email</h3>
                      <p className="text-gray-600">ryo@clinicpro.co.nz</p>
                    </div>
                  </div>
                </div>

                <div>
                  {submitStatus === 'success' && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-5 text-green-600" />
                        <span className="font-medium text-green-800">Message sent successfully!</span>
                      </div>
                      <p className="mt-1 text-sm text-green-700">
                        We'll get back to you within 48 hours during business days.
                      </p>
                    </div>
                  )}

                  {submitStatus === 'error' && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-5 text-red-600" />
                        <span className="font-medium text-red-800">Error sending message</span>
                      </div>
                      <p className="mt-1 text-sm text-red-700">{errorMessage}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="mb-2 block text-sm font-medium text-gray-700">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="mb-2 block text-sm font-medium text-gray-700">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="subject" className="mb-2 block text-sm font-medium text-gray-700">
                        Subject *
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="mb-2 block text-sm font-medium text-gray-700">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={6}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isLoading ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Footer - matches homepage */}
      <footer className="py-12 bg-background text-center">
        <Container size="md">
          <p className="mb-2 font-medium text-text-primary">Questions?</p>
          <a
            href="mailto:ryo@clinicpro.co.nz"
            className="font-medium text-primary hover:underline focus:rounded focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            ryo@clinicpro.co.nz
          </a>
          <div className="mt-6 text-sm text-text-secondary">
            <Link href="/contact" className="transition-colors hover:text-text-primary">
              Work with me
            </Link>
            <span className="mx-2">|</span>
            <Link href="/terms" className="transition-colors hover:text-text-primary">
              Terms
            </Link>
            <span className="mx-2">|</span>
            <Link href="/privacy" className="transition-colors hover:text-text-primary">
              Privacy
            </Link>
          </div>
          <p className="mt-4 text-sm text-text-secondary">
            Built in Auckland, NZ
            <br />
            © 2026 ClinicPro
          </p>
        </Container>
      </footer>
      </div>
    </div>
  );
}
