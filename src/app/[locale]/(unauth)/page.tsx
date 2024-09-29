import { unstable_setRequestLocale } from 'next-intl/server';

import { ConsultationApp } from '@/components/consultation-app';

export async function generateMetadata() {
  return {
    title: 'meta_title',
    description: ('meta_description'),
  };
}

export default function Index({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);

  return (
    <ConsultationApp />
  );
}
