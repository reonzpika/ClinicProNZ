// Dosing engine and helpers
import Decimal from 'decimal.js-light';

import type { PaediatricMedication, PaediatricMedicationData } from 'database/schema/paediatric_medications';

export type CalculatorInputs = {
  weightKg?: number; // always kg
  ageMonths?: number; // toggle years->months handled in UI
};

export type DoseOutput = {
  label: string; // e.g., "15 mg/kg" or "fixed"
  perDoseMg: number;
  perDoseMl?: Array<{ concentrationLabel: string; ml: number }>;
  tablets?: { strengthMg: number; tablets: number; split: 'none' | 'half' }[];
  frequency: string; // e.g., "every 4 hours"
  maxDaily: string; // formatted, includes caps
  capped?: boolean; // true if per-dose capped applied
  notes?: string[];
};

export type MedicineResult = {
  nzfUrl: string;
  notices: { type: string; text: string }[];
  lines: DoseOutput[];
};

const fmtNumber = (n: number, dp = 0) => new Decimal(n).toDecimalPlaces(dp).toNumber();

function roundVolume(ml: number, rounding?: { lt10ml?: number; lt20ml?: number; ge20ml?: number }) {
  const step = ml < 10 ? (rounding?.lt10ml ?? 0.1) : ml < 20 ? (rounding?.lt20ml ?? 0.5) : (rounding?.ge20ml ?? 1);
  return new Decimal(ml).div(step).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).mul(step).toNumber();
}

function formatFrequency(freq?: { intervalHours?: number | [number, number]; perDayDoses?: number }): string {
  if (!freq) return '';
  if (typeof freq.intervalHours === 'number') return `every ${freq.intervalHours} hours`;
  if (Array.isArray(freq.intervalHours)) return `every ${freq.intervalHours[0]}–${freq.intervalHours[1]} hours`;
  if (freq.perDayDoses) return `${freq.perDayDoses} times daily`;
  return '';
}

function formatMaxDaily(max?: any): string {
  if (!max) return '';
  if (max.first48h || max.thereafter) {
    const first = max.first48h ? `${max.first48h.mgPerKgDay} mg/kg/day (≤${max.first48h.absoluteMaxMg} mg) for first 48 h` : '';
    const after = max.thereafter ? `${max.thereafter.mgPerKgDay} mg/kg/day (≤${max.thereafter.absoluteMaxMg} mg) thereafter` : '';
    return [first, after].filter(Boolean).join('; ');
  }
  if (max.mgPerKgDay && max.absoluteMaxMg) return `${max.mgPerKgDay} mg/kg/day (≤${max.absoluteMaxMg} mg)`;
  if (max.fixedMgPerDay) return `${max.fixedMgPerDay} mg/day`;
  return '';
}

export function computeMedicineOutputs(med: PaediatricMedication, inputs: CalculatorInputs): MedicineResult {
  const data = med.data as PaediatricMedicationData;
  const { weightKg, ageMonths } = inputs;

  const notices = (data.notices || []).map((n) => ({ type: n.type, text: n.text }));

  const lines: DoseOutput[] = [];

  for (const rule of data.rules) {
    // Age gating
    if (rule.ageRangeMonths) {
      if (ageMonths == null) {
        if (rule.requires?.includes('age')) continue;
      } else {
        const [min, max] = rule.ageRangeMonths;
        if (ageMonths < min || ageMonths > max) continue;
      }
    }

    // Required inputs
    if (rule.requires?.includes('weight') && weightKg == null) continue;
    if (rule.requires?.includes('age') && ageMonths == null) continue;

    const frequency = formatFrequency(rule.frequency);
    const maxDaily = formatMaxDaily(rule.maxDaily);

    const pushDose = (label: string, perDoseMgRaw: number, perDoseCapMg?: number) => {
      let perDoseMg = perDoseMgRaw;
      let capped = false;
      if (perDoseCapMg && perDoseMg > perDoseCapMg) {
        perDoseMg = perDoseCapMg; // show max if calculated exceeds
        capped = true;
      }

      const perDoseMl: DoseOutput['perDoseMl'] = [];
      const tablets: DoseOutput['tablets'] = [];

      // Liquid concentrations for the target formulation (if any)
      const formulationId = (rule as any).formulationId;
      const formulationIds = (rule as any).formulationIds;
      const relevantFormulations = data.formulations.filter((f) => {
        if (formulationId) return f.id === formulationId;
        if (formulationIds) return (formulationIds as string[]).includes(f.id);
        return true;
        
      });

      for (const form of relevantFormulations) {
        if (form.type === 'liquid') {
          for (const c of form.concentrations) {
            const ml = perDoseMg / c.mgPerMl;
            perDoseMl.push({ concentrationLabel: c.label, ml: roundVolume(ml, form.rounding) });
          }
        }
        if (form.type === 'tablet' || form.type === 'tablet_mr') {
          const split: 'none' | 'half' = (form as any).splitAllowed || (rule as any).tablet?.split || 'none';
          const strengths = (form as any).tabletStrengthsMg || (rule as any).tablet?.strengthsMg || [];
          for (const strength of strengths) {
            let units = perDoseMg / strength;
            if (split === 'half') {
              // Round to nearest 0.5 tablet
              units = new Decimal(units).mul(2).toDecimalPlaces(0, Decimal.ROUND_HALF_UP).div(2).toNumber();
            } else {
              units = Math.round(units);
            }
            tablets.push({ strengthMg: strength, tablets: units, split });
          }
        }
      }

      lines.push({ label, perDoseMg: Math.round(perDoseMg), perDoseMl, tablets, frequency, maxDaily, capped });
    };

    if (rule.doseOptions && rule.doseOptions.length > 0) {
      for (const opt of rule.doseOptions) {
        if (opt.schema === 'mg_per_kg_per_dose') {
          const perDose = (opt.mgPerKg || 0) * (weightKg || 0);
          pushDose(opt.label || `${opt.mgPerKg} mg/kg`, perDose, opt.perDoseCapMg);
        } else if (opt.schema === 'fixed_mg_per_day') {
          pushDose(opt.label || `${opt.mgPerDay} mg/day`, opt.mgPerDay);
        }
      }
    } else if (rule.dose) {
      if (rule.dose.schema === 'mg_per_kg_per_dose') {
        const perDose = (rule.dose.mgPerKg || 0) * (weightKg || 0);
        pushDose(`${rule.dose.mgPerKg} mg/kg`, perDose, rule.dose.perDoseCapMg);
      } else if (rule.dose.schema === 'fixed_mg_per_dose') {
        pushDose('fixed', rule.dose.mg, rule.dose.perDoseCapMg);
      } else if (rule.dose.schema === 'fixed_mg_per_day') {
        pushDose(`${rule.dose.mgPerDay} mg/day`, rule.dose.mgPerDay);
      }
    }

    if (rule.loadingDose && weightKg != null) {
      const perDose = rule.loadingDose.mgPerKg * weightKg;
      pushDose('Loading dose', perDose, rule.loadingDose.perDoseCapMg);
    }
  }

  return { nzfUrl: (med as any).nzfUrl, notices, lines };
}
