import { pgTable, uuid, text, boolean, jsonb, timestamp } from 'drizzle-orm/pg-core';

// Minimal typed shape for the JSONB `data` column used by the calculator/engine
export type PaediatricMedicationData = {
  synonyms?: string[];
  notices?: Array<{ type: string; text: string; alwaysShow?: boolean }>;
  formulations: Array<
    | {
        id: string;
        label: string;
        route: 'oral' | 'rectal';
        type: 'liquid';
        concentrations: Array<{ label: string; mgPerMl: number; default?: boolean }>;
        rounding?: { lt10ml?: number; lt20ml?: number; ge20ml?: number };
      }
    | {
        id: string;
        label: string;
        route: 'oral' | 'rectal';
        type: 'tablet' | 'tablet_mr' | 'rectal';
        tabletStrengthsMg?: number[];
        splitAllowed?: 'none' | 'half';
      }
  >;
  rules: Array<{
    formulationId?: string; // single-formulation rule
    formulationIds?: string[]; // multi-formulation rule
    ageRangeMonths?: [number, number];
    requires?: Array<'age' | 'weight'>;
    constraints?: { minWeightKg?: number };
    // Dosing variants
    dose?:
      | { schema: 'mg_per_kg_per_dose'; mgPerKg: number; perDoseCapMg?: number }
      | { schema: 'fixed_mg_per_dose'; mg: number; perDoseCapMg?: number }
      | { schema: 'fixed_mg_per_day'; mgPerDay: number };
    doseOptions?: Array<
      | { schema: 'mg_per_kg_per_dose'; label?: string; mgPerKg: number; perDoseCapMg?: number }
      | { schema: 'fixed_mg_per_day'; label?: string; mgPerDay: number }
    >;
    loadingDose?: { mgPerKg: number; perDoseCapMg?: number; note?: string };
    frequency?: { intervalHours?: number | [number, number]; perDayDoses?: number };
    maxDaily?:
      | { mgPerKgDay?: number; absoluteMaxMg?: number; fixedMgPerDay?: number }
      | {
          first48h?: { mgPerKgDay: number; absoluteMaxMg?: number };
          thereafter?: { mgPerKgDay: number; absoluteMaxMg?: number };
        };
    tablet?: { strengthsMg: number[]; split: 'none' | 'half' };
    note?: string;
  }>;
};

export const paediatricMedications = pgTable('paediatric_medications', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  nzfUrl: text('nzf_url').notNull(),
  active: boolean('active').notNull().default(true),
  data: jsonb('data').$type<PaediatricMedicationData>().notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type PaediatricMedication = typeof paediatricMedications.$inferSelect;
export type NewPaediatricMedication = typeof paediatricMedications.$inferInsert;
