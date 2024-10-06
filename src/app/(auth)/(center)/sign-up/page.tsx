import { SignUp } from '@clerk/nextjs';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create a new account',
};

const SignUpPage = () => (
  <SignUp path="/sign-up" />
);

export default SignUpPage;
