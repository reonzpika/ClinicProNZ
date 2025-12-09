
type ComingSoonPlaceholderProps = {
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
};

export const ComingSoonPlaceholder: React.FC<ComingSoonPlaceholderProps> = ({
  title,
  description,
  icon: Icon,
}) => {
  return (
    <div className="flex h-full flex-col items-center justify-center space-y-4 p-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-slate-100">
        <Icon size={32} className="text-slate-400" />
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
        <p className="max-w-xs text-sm leading-relaxed text-slate-500">
          {description}
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 px-4 py-2">
        <span className="text-sm font-medium text-blue-600">Coming Soon</span>
      </div>
    </div>
  );
};
