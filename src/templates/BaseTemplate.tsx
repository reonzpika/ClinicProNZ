import { useTranslations } from 'next-intl';

import { AppConfig } from '@/utils/AppConfig';

const BaseTemplate = (props: {
  leftNav: React.ReactNode;
  rightNav?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const t = useTranslations('BaseTemplate');

  return (
    <div className="w-full px-1 text-gray-700 antialiased">
      <div className="mx-auto max-w-screen-md">
        <header className="border-b border-gray-300">
          <div className="flex items-center justify-between py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              GP Workstation
            </h1>
            <div className="flex items-center space-x-4">
              <nav>
                <ul className="flex space-x-4 text-sm">
                  {props.leftNav}
                </ul>
              </nav>
              <nav>
                <ul className="flex space-x-4 text-sm">
                  {props.rightNav}
                </ul>
              </nav>
            </div>
          </div>
        </header>

        <main>{props.children}</main>

        <footer className="border-t border-gray-300 py-4 text-center text-xs">
          {`© Copyright ${new Date().getFullYear()} ${AppConfig.name}. ${t('made_with')} `}
          <a
            href="https://creativedesignsguru.com"
            className="text-blue-700 hover:border-b-2 hover:border-blue-700"
          >
            CreativeDesignsGuru
          </a>
          .
        </footer>
      </div>
    </div>
  );
};

export { BaseTemplate };
