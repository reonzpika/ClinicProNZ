import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default function AuthLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { userId } = auth();

  if (!userId) {
    redirect(`/${locale}/sign-in`);
  }

  return <>{children}</>;
}
