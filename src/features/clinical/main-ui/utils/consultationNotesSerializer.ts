export type SectionedNotes = {
  problems: string;
  objective: string;
  assessment: string;
  plan: string;
};

const DEFAULT_SECTIONS: SectionedNotes = {
  problems: '',
  objective: '',
  assessment: '',
  plan: '',
};

export function parseSectionedNotes(input: string | null | undefined): SectionedNotes {
  const raw = (input || '').trim();
  if (!raw) {
    return { ...DEFAULT_SECTIONS };
  }
  // Try JSON parse first
  if (raw.startsWith('{')) {
    try {
      const obj = JSON.parse(raw);
      return {
        problems: String(obj.problems || ''),
        objective: String(obj.objective || ''),
        assessment: String(obj.assessment || ''),
        plan: String(obj.plan || ''),
      };
    } catch {
      // fall through to text parse
    }
  }

  // Legacy plain text -> treat as objective
  return {
    ...DEFAULT_SECTIONS,
    objective: raw,
  };
}

export function serializeSectionedNotes(sections: SectionedNotes): string {
  return JSON.stringify({
    problems: sections.problems || '',
    objective: sections.objective || '',
    assessment: sections.assessment || '',
    plan: sections.plan || '',
  });
}

export function formatNotesForPrompt(sections: SectionedNotes): string {
  const blocks: string[] = [];
  blocks.push('additional note:');

  if ((sections.problems || '').trim()) {
    blocks.push('\nProblems:');
    blocks.push(sections.problems.trim());
  }
  if ((sections.objective || '').trim()) {
    blocks.push('\nObjective:');
    blocks.push(sections.objective.trim());
  }
  if ((sections.assessment || '').trim()) {
    blocks.push('\nAssessment:');
    blocks.push(sections.assessment.trim());
  }
  if ((sections.plan || '').trim()) {
    blocks.push('\nPlan:');
    blocks.push(sections.plan.trim());
  }

  return blocks.join('\n');
}

