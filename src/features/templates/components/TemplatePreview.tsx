import { Template, Section } from '@/shared/types/templates';
import { Card } from '@/shared/components/ui/card';

interface TemplatePreviewProps {
  template: Template;
}

function SectionPreview({ section }: { section: Section }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium flex items-center gap-2">
        {section.name}
        {section.required && (
          <span className="text-xs text-red-500">*Required</span>
        )}
      </h3>
      <p className="text-sm text-muted-foreground">{section.description}</p>
      {section.type === 'array' && (
        <div className="text-xs text-muted-foreground italic">
          Multiple entries allowed
        </div>
      )}
      {section.subsections && section.subsections.length > 0 && (
        <div className="pl-4 border-l space-y-4 mt-4">
          {section.subsections.map((subsection) => (
            <SectionPreview key={subsection.name} section={subsection} />
          ))}
        </div>
      )}
    </div>
  );
}

export function TemplatePreview({ template }: TemplatePreviewProps) {
  return (
    <Card className="p-6 space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{template.name}</h2>
        <p className="text-sm text-muted-foreground">
          Type: {template.type.charAt(0).toUpperCase() + template.type.slice(1)}
        </p>
      </div>

      {template.sections.length > 0 ? (
        <div className="space-y-6">
          <h3 className="text-sm font-medium">Template Sections</h3>
          <div className="space-y-4">
            {template.sections.map((section) => (
              <Card key={section.name} className="p-4">
                <SectionPreview section={section} />
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No sections defined</p>
      )}

      {template.prompts && (
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Prompts</h3>
          <div className="space-y-2">
            <div>
              <h4 className="text-xs font-medium">System Prompt</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {template.prompts.system}
              </p>
            </div>
            <div>
              <h4 className="text-xs font-medium">Structure Prompt</h4>
              <p className="text-sm font-mono bg-muted p-2 rounded">
                {template.prompts.structure}
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 