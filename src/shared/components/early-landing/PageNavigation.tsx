'use client';

export const PageNavigation = () => {
  const sections = [
    { id: 'story', label: 'Dr. Ryo\'s Story' },
    { id: 'ai-scribe', label: 'AI Scribe' },
    { id: 'feature-image', label: 'Clinical Image' },
    { id: 'feature-chat', label: 'Search/Chat' },
    { id: 'start', label: 'Start Today' },
  ];

  const navItems = sections.filter(s => s.id !== 'start');
  const startItem = sections.find(s => s.id === 'start');

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
          {/* Left: logo + menu */}
          <div className="flex min-w-0 items-center gap-4">
            <span className="shrink-0 font-oswald text-lg font-bold text-nz-green-600">ClinicPro</span>
            <div className="flex items-center gap-2 overflow-x-auto">
              {navItems.map(section => (
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

          {/* Right: Start Today */}
          <div className="hidden shrink-0 md:block">
            <button
              onClick={() => startItem && scrollToSection(startItem.id)}
              className="rounded-full bg-nz-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-nz-green-700"
            >
              Start Today
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
