export type Template = {
  id: string;
  name: string;
  type: 'default' | 'custom';
  ownerId?: string;
  sessionId: string;

  sections: {
    name: string;
    type: 'text' | 'array';
    required: boolean;
    description: string;
    prompt: string;
    subsections?: Section[];
  }[];

  prompts: {
    system: string;
    structure: string;
  };
};

export type Section = {
  name: string;
  type: 'text' | 'array';
  required: boolean;
  description: string;
  prompt: string;
};
