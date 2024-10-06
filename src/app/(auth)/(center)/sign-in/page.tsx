import { SignIn } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account',
};

const SignInPage = () => (
  <SignIn path="/sign-in" />
);

export default SignInPage;
