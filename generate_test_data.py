import json
from typing import Dict, List


Urgency = str  # "HIGH" | "ROUTINE" | "FYI"
ItemType = str  # "lab_result" | "radiology_report" | "discharge_summary" | "specialist_letter" | "medication_related"


def _case(
    *,
    case_id: int,
    item_type: ItemType,
    content: str,
    patient_context: str,
    ground_truth_urgency: Urgency,
    ground_truth_reasoning: str,
    ground_truth_action: str,
) -> Dict:
    return {
        "id": case_id,
        "item_type": item_type,
        "content": content.strip(),
        "patient_context": patient_context.strip(),
        "ground_truth_urgency": ground_truth_urgency,
        "ground_truth_reasoning": ground_truth_reasoning.strip(),
        "ground_truth_action": ground_truth_action.strip(),
    }


def generate_test_dataset() -> List[Dict]:
    """
    Generate 50 synthetic GP inbox items with ground truth labels.

    Design goals:
    - No real patient data; entirely synthetic.
    - NZ general practice flavour and clinical plausibility.
    - Exact distribution:
      - Item types: labs 15, radiology 10, discharge 10, specialist 10, medication 5
      - Urgency: HIGH 10, ROUTINE 30, FYI 10
    - Include 3–5 deliberately ambiguous edge cases (noted in reasoning).
    """

    cases: List[Dict] = []
    cid = 1

    # ----------------------------
    # HIGH urgency (10 total)
    # ----------------------------
    cases.append(
        _case(
            case_id=cid,
            item_type="lab_result",
            content="""
PATIENT: Sarah Johnson, 62F
TEST: Troponin I (high sensitivity)
Result: 2.80 ng/mL (CRITICALLY HIGH) [Normal: <0.04]
Time Collected: 08:45 today
Comment: Markedly elevated troponin. Consistent with acute myocardial injury.
""",
            patient_context="""
History: Hypertension, hyperlipidaemia; smoker.
Yesterday phoned: central chest tightness radiating to jaw for ~20 minutes; resolved. Advised ED if recurs.
Medications: Atorvastatin, amlodipine.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
Markedly elevated troponin with recent chest pain is highly concerning for ACS or MI.
Even if asymptomatic now, this requires immediate same-day escalation.
""",
            ground_truth_action="""
URGENT: Contact patient immediately. If any ongoing symptoms call ambulance.
If currently well, arrange same-day ED assessment with pre-alert; advise no driving.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="radiology_report",
            content="""
CT HEAD (NON-CONTRAST)
Patient: Hana Rangi, 76F
Indication: Fall with head strike; on anticoagulation
Findings: Acute left convexity subdural haematoma up to 7 mm with mild mass effect; no midline shift.
Impression: Acute subdural haematoma. URGENT neurosurgical discussion recommended.
Radiologist: Dr M. Patel
""",
            patient_context="""
History: Atrial fibrillation on apixaban; hypertension.
Seen in ED last night; discharged before CT result finalised.
Lives with daughter.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
Acute subdural haematoma on anticoagulation is time-critical; risk of deterioration.
Requires immediate contact and urgent ED/neurosurgical management today.
""",
            ground_truth_action="""
URGENT: Contact patient/family immediately; advise immediate return to ED by ambulance if symptomatic.
Notify ED that CT has a critical finding; coordinate anticoagulation reversal plan with hospital.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="lab_result",
            content="""
PATIENT: Grace Liu, 19F
TEST: Potassium
Result: 2.1 mmol/L (CRITICALLY LOW) [Normal: 3.5–5.0]
Repeat sample: 2.2 mmol/L (confirmed)
Comment: Severe hypokalaemia; consider urgent replacement. Risk of arrhythmia.
""",
            patient_context="""
Recent consult: "tired, dizzy". BMI 16.8.
Reports using laxatives "for constipation". Periods irregular.
No known cardiac history.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
Severe hypokalaemia is potentially life-threatening; arrhythmia risk.
Requires same-day assessment and treatment, likely ED for IV replacement and monitoring.
""",
            ground_truth_action="""
URGENT: Contact patient immediately. Arrange same-day ED assessment for ECG and potassium replacement.
Assess for eating disorder/laxative misuse; ensure safety supports.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="discharge_summary",
            content="""
EMERGENCY DEPARTMENT DISCHARGE SUMMARY
Patient: Robert Thompson, 71M
Presentation: Collapse at home; ~30 min loss of consciousness
ECG: Mobitz Type II AV block
Diagnosis: Syncope, likely cardiac
Disposition: Discharged home
Plan: URGENT cardiology review for pacing assessment
Signed: Dr A. Singh (ED Registrar)
""",
            patient_context="""
Lives alone; history of IHD and CABG.
Medications: Aspirin, atorvastatin, ramipril.
No GP follow-up booked.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
Mobitz II with syncope is high-risk for progression to complete heart block and sudden deterioration.
Requires urgent same-day follow-up and likely re-presentation for monitoring/pacing.
""",
            ground_truth_action="""
URGENT: Contact patient today to assess symptoms; advise no driving.
Arrange urgent cardiology review within 24–48h; consider immediate return to ED if symptomatic.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="lab_result",
            content="""
PATIENT: Emma Williams, 28F
TEST: Serum β-hCG
Result: Positive 2,450 IU/L
Medication note: Patient currently prescribed methotrexate 15 mg weekly.
""",
            patient_context="""
Rheumatoid arthritis on methotrexate for 6 months.
LMP unclear. No contraception documented. Last GP review 3 weeks ago.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
Methotrexate is highly teratogenic and contraindicated in pregnancy.
Immediate action is required to stop the drug and arrange urgent specialist input.
""",
            ground_truth_action="""
URGENT: Contact patient today; stop methotrexate immediately.
Arrange urgent obstetric advice and rheumatology review; start high-dose folic acid as advised; book urgent dating scan.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="lab_result",
            content="""
PATIENT: Moana Te Whaiti, 66F
TEST: INR (on warfarin)
INR: 8.5 (CRITICAL) [Target: 2.0–3.0]
Comment: Result phoned to practice nurse at 11:05. Patient reports gum bleeding this morning.
""",
            patient_context="""
Indication: Mechanical mitral valve; warfarin regimen recently adjusted.
Also started trimethoprim-sulfamethoxazole by after-hours 3 days ago for UTI.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
INR 8.5 with bleeding is high risk of major haemorrhage; interacting antibiotic likely contributor.
Requires same-day management and possible hospital assessment.
""",
            ground_truth_action="""
URGENT: Contact patient immediately; hold warfarin; assess bleeding.
Arrange same-day ED or urgent GP assessment; consider vitamin K per protocol; stop interacting antibiotic and liaise with anticoagulation clinic.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="radiology_report",
            content="""
CHEST X-RAY REPORT
Patient: Michael Chen, 45M
Indication: Persistent cough and weight loss
Findings: 4.5 cm irregular right upper lobe mass with spiculated margins; right hilar lymphadenopathy.
Impression: Highly suspicious for primary lung malignancy. Urgent CT staging recommended.
""",
            patient_context="""
Seen 2 weeks ago: 6-week dry cough, 5 kg weight loss, night sweats.
Non-smoker. Patient unaware of report.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
Likely malignancy requires prompt communication and urgent referral pathway activation.
Same-day action is appropriate because delay increases harm and patient needs urgent next steps arranged.
""",
            ground_truth_action="""
URGENT: Contact patient today to arrange face-to-face review within 48h.
Initiate urgent suspected cancer referral; arrange CT chest/abdomen; document safety-netting and support.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="lab_result",
            content="""
PATIENT: Peter van Dijk, 72M
TEST: Urea & Electrolytes
Creatinine: 452 µmol/L (CRIT) [Baseline: 92 µmol/L 4 months ago]
eGFR: 10 mL/min/1.73m²
Potassium: 5.6 mmol/L (H)
Comment: Acute kidney injury; please clinically correlate urgently.
""",
            patient_context="""
History: CKD stage 2 previously, hypertension.
Started naproxen OTC for back pain 1 week ago; also on ramipril.
Reports reduced urine output and nausea per triage note yesterday.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
Severe AKI with hyperkalaemia is potentially life-threatening and may need urgent inpatient management.
Requires same-day contact and likely ED/hospital assessment.
""",
            ground_truth_action="""
URGENT: Contact patient immediately; stop NSAIDs and ACE inhibitor pending review.
Arrange same-day ED assessment for AKI workup, ECG, repeat labs; manage hyperkalaemia risk.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="discharge_summary",
            content="""
EMERGENCY DEPARTMENT DISCHARGE SUMMARY
Patient: Aroha Ngatai, 54F
Presentation: Transient right arm weakness and speech difficulty (~15 minutes), resolved
Working diagnosis: TIA
CT head: No acute bleed
Treatment: Aspirin 300 mg stat in ED; discharged on aspirin 100 mg daily
Plan: Urgent TIA clinic referral; GP to arrange risk factor management
""",
            patient_context="""
History: Hypertension, type 2 diabetes; not on statin.
BP in ED 186/98. Smoker.
Lives rurally; limited transport.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
TIA is a warning sign for imminent stroke risk, highest in first 24–48h.
Same-day GP action is warranted to ensure referral, BP management, and safety-netting.
""",
            ground_truth_action="""
URGENT: Contact patient today. Ensure urgent TIA clinic referral is actioned and transport plan.
Optimise BP and start high-intensity statin unless contraindicated; provide stroke red-flag advice and return precautions.
""",
        )
    )
    cid += 1

    cases.append(
        _case(
            case_id=cid,
            item_type="lab_result",
            content="""
PATIENT: Liam O'Connor, 38M
TEST: Full Blood Count
WCC: 0.9 x10^9/L (LOW)
Neutrophils: 0.2 x10^9/L (CRITICAL)
Hb: 132 g/L
Platelets: 210 x10^9/L
Lab note: Please contact patient urgently if febrile or unwell.
""",
            patient_context="""
On carbimazole for Graves' disease; dose increased 4 weeks ago.
Triage note from yesterday: "sore throat and chills overnight"; no appointment booked.
""",
            ground_truth_urgency="HIGH",
            ground_truth_reasoning="""
Severe neutropenia/agranulocytosis on carbimazole with systemic symptoms is an emergency.
Requires immediate cessation of medication and urgent same-day hospital assessment.
""",
            ground_truth_action="""
URGENT: Contact patient now; stop carbimazole immediately; advise immediate ED assessment for sepsis workup and IV antibiotics if febrile.
Inform endocrinology; document drug reaction alert.
""",
        )
    )
    cid += 1

    # ----------------------------
    # ROUTINE urgency (30 total)
    # ----------------------------
    # Labs (9 routine)
    cases.extend(
        [
            _case(
                case_id=cid + 0,
                item_type="lab_result",
                content="""
PATIENT: David Brown, 55M
TEST: HbA1c
Result: 68 mmol/mol (8.4%) [Target: <58]
Previous: 64 mmol/mol 3 months ago
Comment: Suboptimal diabetes control; mild worsening.
""",
                patient_context="""
Type 2 diabetes x 5 years. Meds: metformin 1 g BD.
Next booked review in 2 weeks.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
HbA1c is elevated but not acutely dangerous; can be managed at planned review within 1–3 days or next booked slot.
""",
                ground_truth_action="""
ROUTINE: Discuss at next review; consider adding SGLT2 inhibitor or GLP-1 agonist; reinforce lifestyle; check complications and screening.
""",
            ),
            _case(
                case_id=cid + 1,
                item_type="lab_result",
                content="""
PATIENT: Priya Singh, 43F
TEST: Thyroid function
TSH: 6.8 mIU/L (H) [0.4–4.0]
Free T4: 12 pmol/L [10–22]
TPO antibodies: Pending
""",
                patient_context="""
Symptoms: tiredness and weight gain. No pregnancy. No goitre on last exam.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Subclinical hypothyroidism; requires follow-up but not same-day. Can be reviewed within days.
""",
                ground_truth_action="""
ROUTINE: Book follow-up within 1–3 weeks; repeat TFTs and review symptoms; consider trial levothyroxine if persistent and symptomatic or TPO positive.
""",
            ),
            _case(
                case_id=cid + 2,
                item_type="lab_result",
                content="""
PATIENT: Thomas Reilly, 61M
TEST: Lipid profile
Total cholesterol: 6.2 mmol/L (H)
LDL-C: 4.1 mmol/L (H)
HDL-C: 1.0 mmol/L
Triglycerides: 2.0 mmol/L (H)
""",
                patient_context="""
No known CVD. Family history: father MI at 54.
BP borderline. Non-smoker. Considering primary prevention.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Cardiovascular risk management is important but not urgent. Suitable for routine follow-up.
""",
                ground_truth_action="""
ROUTINE: Calculate CVD risk; discuss lifestyle; consider statin depending on risk; recheck fasting lipids if needed.
""",
            ),
            _case(
                case_id=cid + 3,
                item_type="lab_result",
                content="""
PATIENT: Mei Lin, 29F
TEST: Liver function tests
ALT: 78 U/L (H) [<40]
AST: 52 U/L (H) [<40]
ALP: 95 U/L
Bilirubin: 10 µmol/L
Comment: Mild transaminitis.
""",
                patient_context="""
Recent viral URTI. Started combined oral contraceptive 2 months ago.
Alcohol: 6–8 standard drinks/week.
No jaundice, no abdominal pain.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Mild ALT/AST elevation without red flags is not a same-day issue; warrants planned follow-up and repeat testing.
""",
                ground_truth_action="""
ROUTINE: Repeat LFTs in 4–6 weeks; review alcohol/medications; consider hepatitis serology if persistent or risk factors.
""",
            ),
            _case(
                case_id=cid + 4,
                item_type="lab_result",
                content="""
PATIENT: George Miller, 70M
TEST: Complete Blood Count
Hb: 108 g/L (L) [130–170]
MCV: 74 fL (L)
Ferritin: 9 µg/L (L)
WCC/Platelets: within range
""",
                patient_context="""
Fatigue. No overt bleeding. On aspirin.
Last colonoscopy 8 years ago (normal).
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
AMBIGUOUS: Iron deficiency anaemia needs timely workup. Some clinicians would prioritise faster contact due to malignancy risk,
while others manage within routine time frames if the patient is clinically stable and haemoglobin is only moderately reduced.
""",
                ground_truth_action="""
ROUTINE: Contact patient within 1–3 days; arrange iron studies review, start oral iron if appropriate; investigate for GI blood loss (FIT, endoscopy referral depending on age/risk).
""",
            ),
            _case(
                case_id=cid + 5,
                item_type="lab_result",
                content="""
PATIENT: Isla MacDonald, 36F
TEST: Urea & Electrolytes
Sodium: 131 mmol/L (L) [135–145]
Potassium: 4.2 mmol/L
Creatinine: 62 µmol/L
Comment: Mild hyponatraemia.
""",
                patient_context="""
On sertraline 100 mg daily. Recently increased water intake during heatwave.
No confusion, no seizures. Eating normally.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Mild asymptomatic hyponatraemia can be managed with outpatient review and repeat labs.
""",
                ground_truth_action="""
ROUTINE: Advise moderate fluid intake; repeat sodium in 1–2 weeks; review meds and symptoms; assess for SIADH risk if persistent.
""",
            ),
            _case(
                case_id=cid + 6,
                item_type="lab_result",
                content="""
PATIENT: Nikhil Sharma, 48M
TEST: Renal profile
Creatinine: 128 µmol/L (H) [60–110]
eGFR: 58 mL/min/1.73m²
Previous creatinine: 118 µmol/L 12 months ago
""",
                patient_context="""
Hypertension; on losartan. Muscular build; exercises.
No urinary symptoms. BP controlled.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Mild CKD stage 3a; stable trend. Routine monitoring and cardiovascular risk management.
""",
                ground_truth_action="""
ROUTINE: Repeat U&E and urine ACR in 3–6 months; optimise BP; avoid NSAIDs; provide CKD education.
""",
            ),
            _case(
                case_id=cid + 7,
                item_type="lab_result",
                content="""
PATIENT: Olivia Stewart, 22F
TEST: D-dimer
Result: 620 ng/mL FEU (H) [Normal: <500]
Comment: Mild elevation; interpret in clinical context.
""",
                patient_context="""
Seen yesterday for pleuritic chest pain after a long flight; no dyspnoea; oxygen saturation 98% on room air.
No calf swelling. On combined oral contraceptive. Pain improved with paracetamol.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
AMBIGUOUS: Mildly raised D-dimer can be false positive; however thromboembolic risk factors exist.
Reasonable clinicians may choose HIGH for safety if clinical suspicion is moderate or symptoms worsen.
""",
                ground_truth_action="""
ROUTINE: Reassess clinically within 1–3 days. If any dyspnoea, syncope, tachycardia, haemoptysis, or worsening pain, send to ED same day.
Consider ED-based imaging (CTPA/VQ) if suspicion increases.
""",
            ),
            _case(
                case_id=cid + 8,
                item_type="lab_result",
                content="""
PATIENT: Ben Wilson, 58M
TEST: PSA
PSA: 6.1 µg/L (H) [Age-specific reference: <4.5]
Free PSA: Not performed
""",
                patient_context="""
Lower urinary tract symptoms; no weight loss. No UTI symptoms.
On tamsulosin started recently.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
AMBIGUOUS: Moderately raised PSA can reflect BPH, prostatitis, recent ejaculation/cycling, or malignancy.
Most clinicians would not treat this as same-day, but opinions vary depending on symptoms and risk factors.
""",
                ground_truth_action="""
ROUTINE: Repeat PSA in 6 weeks avoiding ejaculation/cycling; check DRE; rule out UTI; discuss urology referral depending on repeat and risk.
""",
            ),
        ]
    )
    cid += 9

    # Radiology (6 routine, 2 FYI; remaining 2 radiology are HIGH already)
    cases.extend(
        [
            _case(
                case_id=cid + 0,
                item_type="radiology_report",
                content="""
ABDOMINAL ULTRASOUND
Patient: Stephanie King, 39F
Indication: RUQ discomfort
Findings: Multiple gallstones. No gallbladder wall thickening. CBD 4 mm. No intrahepatic duct dilatation.
Impression: Cholelithiasis without sonographic cholecystitis.
""",
                patient_context="""
Intermittent RUQ pain after fatty meals; afebrile; no jaundice.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Symptomatic gallstones without cholecystitis can be managed routinely with planned surgical referral if persistent.
""",
                ground_truth_action="""
ROUTINE: Arrange GP follow-up; provide dietary advice and red flags; consider elective surgical referral if recurrent biliary colic.
""",
            ),
            _case(
                case_id=cid + 1,
                item_type="radiology_report",
                content="""
CHEST X-RAY
Patient: Ajay Kumar, 27M
Indication: Cough 10 days
Findings: Mild patchy left lower zone opacity.
Impression: Changes consistent with mild community-acquired pneumonia.
""",
                patient_context="""
Seen 2 days ago; started amoxicillin. Improving fever; still coughing.
No comorbidities.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Expected finding aligning with current management; follow-up can be routine.
""",
                ground_truth_action="""
ROUTINE: Continue antibiotics; review clinically if worsening; consider repeat CXR in 6 weeks if smoker or persistent symptoms.
""",
            ),
            _case(
                case_id=cid + 2,
                item_type="radiology_report",
                content="""
BRAIN MRI
Patient: Emily Hart, 33F
Indication: Headaches and visual aura
Findings: No mass lesion. No acute infarct. Mild non-specific white matter changes.
Impression: No acute intracranial abnormality.
""",
                patient_context="""
Migraine history. Neuro exam normal.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Reassuring imaging; requires routine follow-up for symptom management.
""",
                ground_truth_action="""
ROUTINE: Inform patient; manage migraine triggers and prophylaxis if needed; consider ophthalmology review if visual symptoms change.
""",
            ),
            _case(
                case_id=cid + 3,
                item_type="radiology_report",
                content="""
RENAL ULTRASOUND
Patient: Colin Edwards, 64M
Indication: Reduced eGFR
Findings: Kidneys normal size. No hydronephrosis. Mild increased cortical echogenicity.
Impression: No obstruction. Features may reflect chronic parenchymal disease.
""",
                patient_context="""
CKD 3a. No urinary symptoms.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
No obstruction; chronic disease features support routine management.
""",
                ground_truth_action="""
ROUTINE: Continue CKD monitoring; manage BP; check urine ACR and metabolic parameters.
""",
            ),
            _case(
                case_id=cid + 4,
                item_type="radiology_report",
                content="""
KNEE X-RAY
Patient: James Parker, 58M
Indication: Knee pain
Findings: Mild medial compartment osteoarthritic change. No fracture.
Impression: Mild osteoarthritis.
""",
                patient_context="""
Chronic knee pain; wants options.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Non-urgent degenerative finding.
""",
                ground_truth_action="""
ROUTINE: Discuss conservative management, weight, exercise, physio; consider topical NSAIDs; review analgesia plan.
""",
            ),
            _case(
                case_id=cid + 5,
                item_type="radiology_report",
                content="""
ABDOMINAL ULTRASOUND
Patient: Leilani Fong, 46F
Indication: Abnormal LFTs
Findings: Mild fatty infiltration of the liver. No focal lesion. Biliary tree normal.
Impression: Hepatic steatosis.
""",
                patient_context="""
BMI 32. Drinks 1–2 glasses of wine most nights. Prediabetes.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Fatty liver is common and managed outpatient.
""",
                ground_truth_action="""
ROUTINE: Counsel on weight loss and alcohol reduction; assess metabolic syndrome; repeat LFTs; consider Fib-4 risk stratification.
""",
            ),
            _case(
                case_id=cid + 6,
                item_type="radiology_report",
                content="""
CHEST X-RAY
Patient: Zoe Fraser, 31F
Indication: Pre-employment screening
Findings: Normal heart size. Clear lungs. No focal consolidation or effusion.
Impression: Normal chest radiograph.
""",
                patient_context="""
No symptoms. Required for employment paperwork.
""",
                ground_truth_urgency="FYI",
                ground_truth_reasoning="""
Normal screening result; no clinical action required.
""",
                ground_truth_action="""
FYI: File result; provide copy to patient/employer if requested.
""",
            ),
            _case(
                case_id=cid + 7,
                item_type="radiology_report",
                content="""
ABDOMINAL X-RAY
Patient: Isaac Ng, 9M
Indication: Constipation
Findings: Moderate faecal loading. No obstruction.
Impression: Constipation pattern.
""",
                patient_context="""
Ongoing constipation. No vomiting. Eating and drinking.
""",
                ground_truth_urgency="FYI",
                ground_truth_reasoning="""
Expected finding; no urgent action beyond usual constipation management plan.
""",
                ground_truth_action="""
FYI: Add result to record; continue constipation plan; review if red flags.
""",
            ),
        ]
    )
    cid += 8

    # Discharge summaries (8 routine; remaining 2 discharge are HIGH already)
    cases.extend(
        [
            _case(
                case_id=cid + 0,
                item_type="discharge_summary",
                content="""
HOSPITAL DISCHARGE SUMMARY
Patient: Karen Watts, 63F
Admission: Elective laparoscopic cholecystectomy
Course: Uncomplicated. Discharged day 1.
Medications: Paracetamol, ibuprofen PRN. Continue usual meds.
Follow-up: GP to remove port-site dressings in 5–7 days.
""",
                patient_context="""
Type 2 diabetes, well controlled. No anticoagulants.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Post-op follow-up tasks are routine and can be booked within days.
""",
                ground_truth_action="""
ROUTINE: Arrange nurse appointment for wound check/dressing removal; remind about infection signs and when to seek care.
""",
            ),
            _case(
                case_id=cid + 1,
                item_type="discharge_summary",
                content="""
ED DISCHARGE SUMMARY
Patient: Tariq Ali, 24M
Presentation: Asthma exacerbation
Treatment: Salbutamol nebs; prednisone 5-day course.
Disposition: Discharged; improved.
Follow-up: GP review in 2–3 days to optimise preventer therapy.
""",
                patient_context="""
Known asthma; inconsistent preventer use.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Follow-up within a few days is appropriate; not same-day given improvement.
""",
                ground_truth_action="""
ROUTINE: Book GP review; check inhaler technique; start/step-up ICS; provide action plan and triggers advice.
""",
            ),
            _case(
                case_id=cid + 2,
                item_type="discharge_summary",
                content="""
HOSPITAL DISCHARGE SUMMARY
Patient: Noel Bennett, 79M
Admission: Community-acquired pneumonia
Treatment: IV antibiotics; switched to oral amoxicillin-clavulanate to complete 5 days.
Disposition: Discharged with home supports.
Follow-up: GP review in 1 week; repeat CXR in 6 weeks.
""",
                patient_context="""
COPD; ex-smoker. Lives with spouse.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Standard post-discharge care; review within days to a week.
""",
                ground_truth_action="""
ROUTINE: Ensure medication course; arrange follow-up; confirm supports; organise repeat imaging if indicated.
""",
            ),
            _case(
                case_id=cid + 3,
                item_type="discharge_summary",
                content="""
ED DISCHARGE SUMMARY
Patient: Chloe Martin, 31F
Presentation: Renal colic
CT KUB: 4 mm distal ureteric stone.
Plan: Conservative management; tamsulosin for 2 weeks.
Follow-up: GP to ensure symptom resolution; urology referral if persistent pain or no passage in 4 weeks.
""",
                patient_context="""
No fever. Pain controlled with NSAIDs.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Small stone managed conservatively; follow-up routine with safety-netting.
""",
                ground_truth_action="""
ROUTINE: Review in 1–2 weeks; advise red flags (fever, uncontrolled pain, anuria); consider repeat imaging if symptoms persist.
""",
            ),
            _case(
                case_id=cid + 4,
                item_type="discharge_summary",
                content="""
HOSPITAL DISCHARGE SUMMARY
Patient: Marcel Dupont, 52M
Admission: New diagnosis heart failure (HFrEF)
Echo: LVEF 35%
Medications on discharge: bisoprolol, ACE inhibitor, furosemide.
Follow-up: GP in 1 week for blood pressure, renal function, and symptom check.
""",
                patient_context="""
Previously untreated hypertension; works as builder.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Important follow-up but can be arranged within days. No acute instability described.
""",
                ground_truth_action="""
ROUTINE: Arrange GP review in 3–7 days; organise U&E in 1 week; counsel on daily weights, fluid, and red flags.
""",
            ),
            _case(
                case_id=cid + 5,
                item_type="discharge_summary",
                content="""
ED DISCHARGE SUMMARY
Patient: Sophie Evans, 18F
Presentation: Alcohol intoxication
Course: Observed overnight; medically well.
Plan: GP follow-up for mental health and alcohol support.
""",
                patient_context="""
University student; prior anxiety noted.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Requires follow-up and support but not a same-day medical emergency based on this note alone.
""",
                ground_truth_action="""
ROUTINE: Offer appointment within 1–3 days; assess mental health, safety, and substance use; provide resources and supports.
""",
            ),
            _case(
                case_id=cid + 6,
                item_type="discharge_summary",
                content="""
HOSPITAL DISCHARGE SUMMARY
Patient: Helen Grant, 67F
Admission: Cellulitis of lower leg
Treatment: IV antibiotics then oral cefalexin to complete 7 days.
Follow-up: GP review in 2–3 days to check response.
""",
                patient_context="""
Diabetes. No systemic symptoms at discharge.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Routine clinical review in a few days is appropriate to ensure improvement.
""",
                ground_truth_action="""
ROUTINE: Book review; check for spreading, fever, glycaemic control; mark borders and safety-net.
""",
            ),
            _case(
                case_id=cid + 7,
                item_type="discharge_summary",
                content="""
ED DISCHARGE SUMMARY
Patient: Daniel Wu, 40M
Presentation: Back pain with sciatica
Exam: No neurological deficit. No red flags.
Plan: Analgesia, activity advice, physiotherapy.
Follow-up: GP as needed.
""",
                patient_context="""
Warehouse worker. Wants time off work note.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Non-urgent discharge; manage in routine care.
""",
                ground_truth_action="""
ROUTINE: Provide advice, consider physio referral, review if red flags develop (saddle anaesthesia, urinary retention, weakness).
""",
            ),
        ]
    )
    cid += 8

    # Specialist letters (7 routine, 3 FYI; total specialist letters must be 10)
    cases.extend(
        [
            _case(
                case_id=cid + 0,
                item_type="specialist_letter",
                content="""
CARDIOLOGY OUTPATIENT LETTER
Patient: Mark Davies, 60M
Reason: Palpitations
Holter: Frequent PACs; no sustained arrhythmia
Plan: Reassurance. Reduce caffeine. Consider beta blocker if symptomatic.
Follow-up: Discharged back to GP care.
""",
                patient_context="""
Anxious about symptoms; otherwise well.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Specialist advice requires routine follow-up and patient reassurance; no urgent action.
""",
                ground_truth_action="""
ROUTINE: Inform patient; discuss triggers; consider low-dose beta blocker if ongoing symptoms and no contraindications.
""",
            ),
            _case(
                case_id=cid + 1,
                item_type="specialist_letter",
                content="""
ENDOCRINOLOGY LETTER
Patient: Lucy Patel, 47F
Condition: Type 2 diabetes
Plan: Start empagliflozin 10 mg daily; continue metformin.
Discussed sick day rules and genital infection risk.
Follow-up: Endocrinology in 6 months.
""",
                patient_context="""
HbA1c recently 72. eGFR 75.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Medication initiation should be actioned in routine time frame with counselling.
""",
                ground_truth_action="""
ROUTINE: Arrange prescription; counsel re sick day rules, hydration, and infection symptoms; check baseline renal function and BP.
""",
            ),
            _case(
                case_id=cid + 2,
                item_type="specialist_letter",
                content="""
GASTROENTEROLOGY LETTER
Patient: Alan McKenzie, 52M
Procedure: Colonoscopy
Findings: 2 small adenomatous polyps removed; no cancer.
Plan: Surveillance colonoscopy in 5 years.
""",
                patient_context="""
Prior positive FIT.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Benign findings; routine communication and record update.
""",
                ground_truth_action="""
ROUTINE: Inform patient; update recall for surveillance in 5 years; reinforce bowel symptom safety-netting.
""",
            ),
            _case(
                case_id=cid + 3,
                item_type="specialist_letter",
                content="""
RESPIRATORY CLINIC LETTER
Patient: Nora Bell, 69F
Diagnosis: COPD
Plan: Continue tiotropium; start pulmonary rehab referral.
Exacerbation plan discussed; influenza and pneumococcal vaccination recommended.
""",
                patient_context="""
Ex-smoker; 2 exacerbations last year.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Care optimisation steps are important but routine.
""",
                ground_truth_action="""
ROUTINE: Arrange vaccinations; support pulmonary rehab enrolment; review inhaler technique and action plan.
""",
            ),
            _case(
                case_id=cid + 4,
                item_type="specialist_letter",
                content="""
RHEUMATOLOGY LETTER
Patient: Sione Taufa, 41M
Condition: Gout
Plan: Titrate allopurinol to target urate <0.36 mmol/L.
Provided flare plan (naproxen if no contraindication; colchicine alternative).
""",
                patient_context="""
On allopurinol 100 mg daily; urate 0.48.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Medication titration and monitoring can be done routinely.
""",
                ground_truth_action="""
ROUTINE: Arrange urate check in 4 weeks after dose changes; counsel re flare prophylaxis; review renal function and interactions.
""",
            ),
            _case(
                case_id=cid + 5,
                item_type="specialist_letter",
                content="""
NEUROLOGY LETTER
Patient: Kim Robertson, 26F
Reason: Episodes of dizziness
Assessment: Benign paroxysmal positional vertigo (BPPV) likely.
Plan: Epley manoeuvre; physio vestibular exercises. No red flags.
""",
                patient_context="""
No hearing loss; neuro exam normal.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Benign diagnosis with conservative plan; routine follow-up.
""",
                ground_truth_action="""
ROUTINE: Offer physio referral; provide BPPV advice and red flags (new neuro symptoms, severe headache).
""",
            ),
            _case(
                case_id=cid + 6,
                item_type="specialist_letter",
                content="""
ORTHOPAEDICS LETTER
Patient: Ian Scott, 57M
Condition: Shoulder impingement
Plan: Subacromial steroid injection performed; physiotherapy recommended.
Follow-up: PRN.
""",
                patient_context="""
Manual worker. Wants return-to-work guidance.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Routine advice and physio coordination.
""",
                ground_truth_action="""
ROUTINE: Arrange physio; advise graded activity; provide work certificate if required.
""",
            ),
            _case(
                case_id=cid + 7,
                item_type="specialist_letter",
                content="""
DERMATOLOGY OUTPATIENT LETTER
Patient: Jennifer Smith, 34F
Referral: Eczema
Assessment: Mild atopic eczema; well controlled.
Plan: Continue emollients; intermittent topical steroid PRN.
Discharged back to GP care.
""",
                patient_context="""
Referral 3 months ago for flares; improved recently.
""",
                ground_truth_urgency="FYI",
                ground_truth_reasoning="""
Specialist discharge letter without required actions; information only.
""",
                ground_truth_action="""
FYI: File in record; no action needed unless patient re-presents.
""",
            ),
            _case(
                case_id=cid + 8,
                item_type="specialist_letter",
                content="""
OPHTHALMOLOGY LETTER
Patient: Robert King, 58M
Reason: Diabetic retinopathy screening
Findings: No retinopathy. Mild cataract.
Plan: Routine screening in 24 months.
""",
                patient_context="""
Type 2 diabetes; HbA1c improving.
""",
                ground_truth_urgency="FYI",
                ground_truth_reasoning="""
Routine screening outcome with no action required.
""",
                ground_truth_action="""
FYI: Record result; set recall for 24 months.
""",
            ),
            _case(
                case_id=cid + 9,
                item_type="specialist_letter",
                content="""
ENT LETTER
Patient: Maria Lopez, 45F
Reason: Recurrent sinusitis
Assessment: Allergic rhinitis predominant; no surgical indication.
Plan: Continue intranasal steroid; saline rinses. Discharged.
""",
                patient_context="""
Seasonal symptoms; no asthma.
""",
                ground_truth_urgency="FYI",
                ground_truth_reasoning="""
Information only; no urgent clinical action required.
""",
                ground_truth_action="""
FYI: File; reinforce management if patient asks.
""",
            ),
        ]
    )
    cid += 10

    # Medication-related (4 routine, 1 FYI; 1 medication-related HIGH already via INR lab result,
    # but that was a lab item type. We still need 5 medication_related items total.)
    cases.extend(
        [
            _case(
                case_id=cid + 0,
                item_type="medication_related",
                content="""
PHARMACY QUERY
Patient: Riley Thompson, 14M
Medication: Methylphenidate LA
Request: Early repeat requested, 10 days before due. Pharmacy asks if OK to dispense.
""",
                patient_context="""
ADHD. Stable on current dose. Previous early repeat 2 months ago.
Lives with mum; school holidays currently.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Requires clinical review of adherence/diversion but not same-day medical urgency.
""",
                ground_truth_action="""
ROUTINE: Contact caregiver within 1–3 days; clarify reason for early request; check stock loss vs dose change; consider controlled drug policy and schedule review.
""",
            ),
            _case(
                case_id=cid + 1,
                item_type="medication_related",
                content="""
DRUG INTERACTION ALERT
Patient: Aria Wilson, 67F
Alert: Clarithromycin prescribed by after-hours; patient on simvastatin 40 mg nightly.
Interaction: Increased risk of myopathy/rhabdomyolysis.
""",
                patient_context="""
Simvastatin for secondary prevention.
Clarithromycin started for presumed chest infection; day 2 of course.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Clinically important interaction requiring timely action, but if asymptomatic can be managed promptly within days (hold statin and/or change antibiotic).
""",
                ground_truth_action="""
ROUTINE: Contact patient within 1–3 days; advise hold simvastatin while on clarithromycin and for 3 days after; consider alternative antibiotic if appropriate; document interaction counselling.
""",
            ),
            _case(
                case_id=cid + 2,
                item_type="medication_related",
                content="""
REPEAT PRESCRIPTION REQUEST
Patient: Mason Carter, 51M
Medication: Omeprazole 20 mg daily
Note: Long-term use >2 years; request continuation. Pharmacy asks if review needed.
""",
                patient_context="""
History of reflux. No alarm symptoms documented.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Long-term PPI warrants review, but not urgent.
""",
                ground_truth_action="""
ROUTINE: Approve short supply; book medication review; consider step-down, lifestyle measures, and check indications.
""",
            ),
            _case(
                case_id=cid + 3,
                item_type="medication_related",
                content="""
DRUG INTERACTION ALERT
Patient: Kiri Wallace, 35F
Alert: Ibuprofen purchased OTC regularly; patient prescribed lithium carbonate.
Interaction: NSAIDs may increase lithium levels and risk toxicity (tremor, nausea, confusion).
""",
                patient_context="""
Bipolar disorder; stable on lithium for 3 years.
Recent back pain; taking ibuprofen 400 mg TDS most days for 1 week.
No current symptoms of toxicity documented.
""",
                ground_truth_urgency="ROUTINE",
                ground_truth_reasoning="""
Clinically important interaction that should be addressed promptly, but if asymptomatic can be managed within 1–3 days with advice and monitoring.
""",
                ground_truth_action="""
ROUTINE: Contact patient within 1–3 days; advise avoid NSAIDs; suggest alternative analgesia.
Arrange lithium level and renal function if NSAID use occurred; safety-net for toxicity symptoms.
""",
            ),
            _case(
                case_id=cid + 4,
                item_type="medication_related",
                content="""
MEDICATION CHANGE NOTICE (Hospital)
Patient: Linda Moore, 74F
Notice: Metoprolol changed to bisoprolol during admission.
Reason: Heart failure guideline therapy.
Discharge meds attached.
""",
                patient_context="""
Seen in hospital last week for heart failure optimisation; feeling better.
""",
                ground_truth_urgency="FYI",
                ground_truth_reasoning="""
Administrative notice of a medication change already implemented; no immediate action required beyond record update.
""",
                ground_truth_action="""
FYI: Update medication list; ensure patient has correct script supply; address at next routine review.
""",
            ),
        ]
    )
    cid += 5

    # ----------------------------
    # Final distribution adjustments
    # ----------------------------

    # Convert 4 existing ROUTINE cases to FYI to reach FYI=10 without changing item-type counts.
    fyi_converted = 0
    for c in cases:
        if fyi_converted >= 4:
            break
        if c["ground_truth_urgency"] != "ROUTINE":
            continue
        content_upper = c["content"].upper()
        if "KNEE X-RAY" in content_upper and "OSTEOARTHRITIC" in content_upper:
            c["ground_truth_urgency"] = "FYI"
            c["ground_truth_reasoning"] = (
                "Mild osteoarthritis on imaging; no urgent action required. "
                "Can be filed and addressed at routine musculoskeletal review."
            )
            c["ground_truth_action"] = "FYI: File result; discuss management options at next routine visit if the patient requests."
            fyi_converted += 1
            continue
        if "CARDIOLOGY OUTPATIENT LETTER" in content_upper and "DISCHARGED BACK TO GP CARE" in content_upper:
            c["ground_truth_urgency"] = "FYI"
            c["ground_truth_reasoning"] = (
                "Reassurance letter with discharge back to GP; no immediate action required."
            )
            c["ground_truth_action"] = "FYI: File; mention at next contact if patient remains concerned."
            fyi_converted += 1
            continue
        if "BRAIN MRI" in content_upper and "NO ACUTE INTRACRANIAL ABNORMALITY" in content_upper:
            c["ground_truth_urgency"] = "FYI"
            c["ground_truth_reasoning"] = (
                "Reassuring imaging with no acute abnormality; can be filed and discussed at routine follow-up if needed."
            )
            c["ground_truth_action"] = "FYI: File result; optional brief message to patient that imaging is reassuring."
            fyi_converted += 1
            continue
        if "BACK PAIN WITH SCIATICA" in content_upper and "NO RED FLAGS" in content_upper:
            c["ground_truth_urgency"] = "FYI"
            c["ground_truth_reasoning"] = (
                "Non-urgent ED discharge summary with advice already provided; no immediate action required unless the patient re-presents."
            )
            c["ground_truth_action"] = "FYI: File; follow-up if patient requests review or develops red flags."
            fyi_converted += 1
            continue

    if fyi_converted != 4:
        raise ValueError(f"Internal generator error: expected to convert 4 cases to FYI, converted {fyi_converted}")

    # Reassign IDs sequentially 1..N for cleanliness.
    for idx, c in enumerate(cases, start=1):
        c["id"] = idx

    # Final sanity checks.
    if len(cases) != 50:
        raise ValueError(f"Expected 50 cases, got {len(cases)}")

    type_counts: Dict[str, int] = {}
    urgency_counts: Dict[str, int] = {}
    ambiguous_count = 0
    for c in cases:
        type_counts[c["item_type"]] = type_counts.get(c["item_type"], 0) + 1
        urgency_counts[c["ground_truth_urgency"]] = urgency_counts.get(c["ground_truth_urgency"], 0) + 1
        if "AMBIGUOUS" in c["ground_truth_reasoning"].upper():
            ambiguous_count += 1

    expected_type_counts = {
        "lab_result": 15,
        "radiology_report": 10,
        "discharge_summary": 10,
        "specialist_letter": 10,
        "medication_related": 5,
    }
    expected_urgency_counts = {"HIGH": 10, "ROUTINE": 30, "FYI": 10}

    if type_counts != expected_type_counts:
        raise ValueError(f"Item type distribution mismatch: {type_counts} != {expected_type_counts}")
    if urgency_counts != expected_urgency_counts:
        raise ValueError(
            f"Urgency distribution mismatch: {urgency_counts} != {expected_urgency_counts}"
        )
    if not (3 <= ambiguous_count <= 5):
        raise ValueError(f"Expected 3–5 ambiguous cases, got {ambiguous_count}")

    return cases


if __name__ == "__main__":
    dataset = generate_test_dataset()

    with open("test_dataset.json", "w", encoding="utf-8") as f:
        json.dump(dataset, f, indent=2, ensure_ascii=False)

    # Print distribution summary.
    urgency_dist: Dict[str, int] = {}
    type_dist: Dict[str, int] = {}
    ambiguous = 0
    for case in dataset:
        urgency = case["ground_truth_urgency"]
        urgency_dist[urgency] = urgency_dist.get(urgency, 0) + 1
        t = case["item_type"]
        type_dist[t] = type_dist.get(t, 0) + 1
        if "AMBIGUOUS" in case["ground_truth_reasoning"].upper():
            ambiguous += 1

    print(f"Generated {len(dataset)} test cases")
    print("\nItem Type Distribution:")
    for k, v in sorted(type_dist.items()):
        print(f"  {k}: {v}")
    print("\nUrgency Distribution:")
    for k, v in sorted(urgency_dist.items()):
        print(f"  {k}: {v} ({v/len(dataset)*100:.0f}%)")
    print(f"\nAmbiguous cases: {ambiguous}")
