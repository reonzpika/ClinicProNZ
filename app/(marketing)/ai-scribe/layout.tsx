import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ClinicPro - AI Medical Scribing for NZ GPs',
  description:
    'Finish on time. Capture the consult; get a clean draft note fast. AI scribe for NZ GPs — faster notes, less cognitive load, consistent structure. Built by a practicing GP.',
  keywords:
    'AI medical scribe, New Zealand GP, clinical notes, medical automation, healthcare efficiency, general practice, GP scribe, consultation notes',
  openGraph: {
    title: 'ClinicPro - AI Medical Scribing for NZ GPs',
    description:
      'AI scribe for NZ GPs: capture the consult, get structured notes fast. Built by a practicing GP.',
    type: 'website',
    locale: 'en_NZ',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ClinicPro - AI Medical Scribing for NZ GPs',
    description:
      'Finish on time. Capture the consult; get a clean draft note fast. Built by a practicing GP.',
  },
};

export default function AiScribeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
