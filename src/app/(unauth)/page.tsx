import { ConsultationApp } from '@/components/consultation-app';
import { Header } from '@/components/Header';

export const metadata = {
  title: 'Consultation App',
  description: 'AI-powered consultation assistant for healthcare professionals',
};

export default function Index() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto grow p-4">
        <ConsultationApp />
      </main>
    </div>
  );
}
