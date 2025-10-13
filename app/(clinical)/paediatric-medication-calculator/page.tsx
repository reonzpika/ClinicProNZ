"use client";

import { useEffect, useMemo, useState } from 'react';

import { Input } from '@/src/shared/components/ui/input';
import { Label } from '@/src/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/shared/components/ui/select';
import { Alert, AlertDescription } from '@/src/shared/components/ui/alert';
import { ScrollArea } from '@/src/shared/components/ui/scroll-area';

import { computeMedicineOutputs, type CalculatorInputs } from '@/src/features/paeds/engine';

export default function PaediatricMedicationCalculatorPage() {
  const [ageUnit, setAgeUnit] = useState<'years' | 'months'>('years');
  const [ageValue, setAgeValue] = useState<string>('');
  const [weightKg, setWeightKg] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [meds, setMeds] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch('/api/paediatric-medications');
      if (res.ok) {
        const data = await res.json();
        setMeds(data);
      }
    };
    load();
  }, []);

  const ageMonths: number | undefined = useMemo(() => {
    const n = Number(ageValue);
    if (!ageValue || isNaN(n) || n < 0) return undefined;
    return ageUnit === 'years' ? Math.round(n * 12) : Math.round(n);
  }, [ageUnit, ageValue]);

  const weightNum: number | undefined = useMemo(() => {
    const n = Number(weightKg);
    if (!weightKg || isNaN(n) || n <= 0) return undefined;
    return n;
  }, [weightKg]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return meds;
    return meds.filter((m) => m.name.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q));
  }, [search, meds]);

  const inputs: CalculatorInputs = { weightKg: weightNum, ageMonths };

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-semibold">Paediatric medication calculator</h1>

      {/* Top inputs */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <Label>Age</Label>
          <div className="flex gap-2">
            <Input
              inputMode="decimal"
              placeholder={ageUnit === 'years' ? 'Years' : 'Months'}
              value={ageValue}
              onChange={(e) => setAgeValue(e.target.value)}
            />
            <Select value={ageUnit} onValueChange={(v) => setAgeUnit(v as any)}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="years">Years</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div>
          <Label>Weight (kg)</Label>
          <Input inputMode="decimal" placeholder="kg" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
        </div>
        <div>
          <Label>Search medication</Label>
          <Input placeholder="Start typing…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Neonatal notice always visible */}
      <Alert className="mb-4">
        <AlertDescription>Neonatal dosing exists; please refer to NZF for neonates.</AlertDescription>
      </Alert>

      {/* List + outputs */}
      <ScrollArea className="h-[60vh] rounded border p-3">
        <div className="space-y-6">
          {filtered.map((m) => {
            const result = computeMedicineOutputs(m as any, inputs);
            return (
              <div key={m.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-medium">{m.name}</div>
                  <a className="text-sm text-blue-600 underline" href={result.nzfUrl} target="_blank" rel="noreferrer">
                    NZF
                  </a>
                </div>
                <div className="text-sm text-muted-foreground">
                  {result.notices.map((n, i) => (
                    <span key={i} className="mr-3">{n.text}</span>
                  ))}
                </div>
                {/* Simple lines (no cards) */}
                <div className="space-y-1 text-sm">
                  {result.lines.length === 0 && (
                    <div className="text-muted-foreground">Enter required inputs for this medicine.</div>
                  )}
                  {result.lines.map((line: any, idx: number) => (
                    <div key={idx} className="">
                      <div className="font-medium">
                        {line.label}: {line.perDoseMg} mg per dose {line.capped ? '(capped to max)' : ''}
                      </div>
                      {line.perDoseMl && line.perDoseMl.length > 0 && (
                        <div>
                          {line.perDoseMl.map((v: any, i: number) => (
                            <div key={i}>- {v.concentrationLabel}: {v.ml.toFixed(v.ml < 10 ? 1 : v.ml < 20 ? 1 : 0)} mL</div>
                          ))}
                        </div>
                      )}
                      {line.tablets && line.tablets.length > 0 && (
                        <div>
                          {line.tablets.map((t: any, i: number) => (
                            <div key={i}>- {t.strengthMg} mg tablets: {t.tablets}{t.split === 'half' ? ' (halves allowed)' : ''}</div>
                          ))}
                        </div>
                      )}
                      <div className="text-muted-foreground">{line.frequency}{line.maxDaily ? `; Max daily: ${line.maxDaily}` : ''}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
