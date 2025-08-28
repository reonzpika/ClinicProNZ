import { Suspense } from 'react';
import SignUpBox from './SignUpBox';

export default async function SurveyThankYouPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const fromSurvey = typeof params.from_survey === 'string' ? params.from_survey : undefined;
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-2 text-2xl font-semibold">Thanks — that’s a huge help.</h1>
      <p className="mb-6 text-gray-700">
        ClinicPro’s AI scribe is <strong>free to use now</strong>, and we’re rolling out more features shortly.
        Create your account below to get access now.
      </p>
      {fromSurvey && (
        <p className="mb-4 text-sm text-gray-600">Personalised for: {fromSurvey}</p>
      )}
      <Suspense>
        <SignUpBox />
      </Suspense>
    </main>
  );
}

