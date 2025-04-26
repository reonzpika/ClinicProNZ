import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About',
  description: 'About our application',
};

export default function About() {
  return (
    <>
      <p>Welcome to our application. This is the about page.</p>

      <div className="mt-2 text-center text-sm">
        Translation powered by
        <a
          className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          href="https://l.crowdin.com/next-js"
        >
          Crowdin
        </a>
      </div>

      <a href="https://l.crowdin.com/next-js">
        <Image
          className="mx-auto mt-2"
          src="/assets/images/crowdin-dark.png"
          alt="Crowdin Translation Management System"
          width={130}
          height={112}
        />
      </a>
    </>
  );
}
