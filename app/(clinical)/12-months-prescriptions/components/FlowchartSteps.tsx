export function FlowchartSteps() {
  return (
    <div className="space-y-6 bg-white border border-border rounded-lg p-8">
      <div className="pb-6 border-b border-border">
        <h3 className="text-xl font-semibold mb-3 text-text-primary">
          STEP 1: Controlled Drug Check
        </h3>
        <p className="text-text-secondary mb-3">
          Is this a controlled drug? (opioids, benzodiazepines, tramadol, methylphenidate, etc.)
        </p>
        <div className="ml-6 space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-red-600 font-medium">→ YES:</span>
            <span className="text-text-secondary">
              <strong className="text-red-600">STOP</strong> - Maximum 1-3 months (legal limit)
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-medium">→ NO:</span>
            <span className="text-text-secondary">Continue to Step 2</span>
          </div>
        </div>
      </div>

      <div className="pb-6 border-b border-border">
        <h3 className="text-xl font-semibold mb-3 text-text-primary">
          STEP 2: Medication Zone Check
        </h3>
        <p className="text-text-secondary mb-3">
          Open Traffic Light Medication Checker to find the medication
        </p>
        <div className="ml-6 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-red-600 font-medium">→ RED Zone:</span>
            <span className="text-text-secondary">
              <strong className="text-red-600">NOT SUITABLE</strong> - Maximum 3 months (needs monitoring)
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-600 font-medium">→ AMBER Zone:</span>
            <span className="text-text-secondary">
              Continue to Step 3 (check criteria)
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-medium">→ GREEN Zone:</span>
            <span className="text-text-secondary">
              Continue to Step 4 (patient assessment)
            </span>
          </div>
        </div>
      </div>

      <div className="pb-6 border-b border-border">
        <h3 className="text-xl font-semibold mb-3 text-text-primary">
          STEP 3: AMBER Zone Assessment
        </h3>
        <p className="text-text-secondary mb-3">
          Check AMBER Summary Table in medication checker
        </p>
        <div className="ml-6 space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-medium">→ Criteria met:</span>
            <span className="text-text-secondary">12 months OK - Continue to Step 4</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-600 font-medium">→ Criteria NOT met:</span>
            <span className="text-text-secondary">Use 3-6 months instead</span>
          </div>
        </div>
      </div>

      <div className="pb-6 border-b border-border">
        <h3 className="text-xl font-semibold mb-3 text-text-primary">
          STEP 4: Patient Stability
        </h3>
        <p className="text-text-secondary mb-3">
          Is patient stable on current medication?
        </p>
        <div className="ml-6 space-y-2">
          <div className="flex items-start gap-3">
            <span className="text-green-600 font-medium">→ YES:</span>
            <span className="text-text-secondary">Continue to Step 5</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-amber-600 font-medium">→ NO:</span>
            <span className="text-text-secondary">Consider shorter duration (3-6 months)</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-3 text-text-primary">
          STEP 5: Clinical Judgment
        </h3>
        <p className="text-text-secondary mb-3">
          Choose duration you&apos;re comfortable with:
        </p>
        <div className="ml-6 space-y-2">
          <div className="text-text-secondary">• 3 months (current standard)</div>
          <div className="text-text-secondary">• 6 months (RNZCGP recommended)</div>
          <div className="text-text-secondary">• 12 months (new option)</div>
        </div>
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <strong className="text-green-800">✓ Issue prescription</strong>
          <p className="text-sm text-green-700 mt-1">
            Document: duration + rationale + monitoring plan
          </p>
        </div>
      </div>
    </div>
  );
}
