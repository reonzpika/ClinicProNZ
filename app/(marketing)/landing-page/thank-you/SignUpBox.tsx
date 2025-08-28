'use client';

import dynamic from 'next/dynamic';

const SignUp = dynamic(() => import('@clerk/nextjs').then(m => m.SignUp), { ssr: false });

export default function SignUpBox() {
  return (
    <div className="rounded border p-4">
      <SignUp routing="hash" redirectUrl="/consultation" />
    </div>
  );
}

