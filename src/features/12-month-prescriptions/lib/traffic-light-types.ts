/**
 * Structured content types for the Traffic Light Medication Checker.
 * Used for semantic rendering with explicit spacing (tight heading→content, loose between sections).
 */

export type Block =
  | { type: 'paragraph'; content: string }
  | { type: 'list'; content: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'subsection'; id?: string; title: string; subtitle?: string; blocks: Block[] }
  | { type: 'hr' };

export type Section = {
  id?: string;
  title: string;
  zone?: 'green' | 'amber' | 'red';
  blocks: Block[];
};

export type TrafficLightDocument = {
  updated?: string;
  sections: Section[];
};
