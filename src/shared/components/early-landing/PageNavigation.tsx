'use client';

export const PageNavigation = () => {
  const sections = [
    { id: 'hero', label: 'Why ClinicPro' },
    { id: 'story', label: 'Dr. Ryo\'s Story' },
    { id: 'problems', label: 'GP Struggles' },
    { id: 'vision', label: 'What\'s Possible' },
    { id: 'features', label: 'Features & Benefits' },
    { id: 'start', label: 'Start Today' },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/95 shadow-sm backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <span className="font-oswald text-lg font-bold text-nz-green-600">ClinicPro</span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-nz-green-50 hover:text-nz-green-700 sm:px-4 sm:py-2 sm:text-sm"
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};
