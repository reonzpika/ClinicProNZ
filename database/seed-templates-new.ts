/* eslint-disable no-console */
import type { Template } from '../src/features/templates/types';
import { sql } from './client';

const newTemplates: Omit<Template, 'id'>[] = [
  {
    name: 'GP Consultation Note',
    description: 'Standard GP consultation template following competitor best practices',
    type: 'default',
    templateBody: `(This template is designed for general practice consultations. Only include information explicitly mentioned in the transcript, contextual notes or clinical note. If information is not mentioned, leave the section blank.)

CONSULTATION DETAILS:
[Face to face "F2F" OR telephone "T/C"] [specify whether anyone else is present, e.g., "seen alone" or "seen with..."] [Reason for visit, e.g., current issues or presenting complaint or booking note or follow up]

HISTORY:
- [History of presenting complaints] (only include if explicitly mentioned)
- [ICE: Patient's Ideas, Concerns and Expectations] (only include if explicitly mentioned)
- [Presence or absence of red flag symptoms relevant to the presenting complaint] (only include if explicitly mentioned)
- [Relevant risk factors] (only include if explicitly mentioned)
- [PMH: Past medical history or surgical history] (only include if explicitly mentioned)
- [DH: Drug history/medications] (only include if explicitly mentioned)
- [Allergies] (only include if explicitly mentioned)
- [FH: Relevant family history] (only include if explicitly mentioned)
- [SH: Social history - lives with, occupation, smoking/alcohol/drugs, recent travel] (only include if explicitly mentioned)

EXAMINATION:
- [Vital signs: Temperature, Oxygen saturation, Heart rate, Blood pressure, Respiratory rate] (only include if explicitly mentioned)
- [Physical or mental state examination findings] (only include if explicitly mentioned and use as many bullet points as needed)
- [Investigations with results] (only include if explicitly mentioned)

IMPRESSION:
[1. Issue, problem or request 1] [Assessment or likely diagnosis for Issue 1] (only include if explicitly mentioned)
- [Differential diagnosis for Issue 1] (only include if explicitly mentioned)
[2. Issue, problem or request 2] [Assessment or likely diagnosis for Issue 2] (only include if explicitly mentioned)
- [Differential diagnosis for Issue 2] (only include if explicitly mentioned)

PLAN:
- [Investigations planned for Issue 1] (only include if explicitly mentioned)
- [Treatment planned for Issue 1] (only include if explicitly mentioned)
- [Relevant referrals for Issue 1] (only include if explicitly mentioned)
- [Investigations planned for Issue 2] (only include if explicitly mentioned)
- [Treatment planned for Issue 2] (only include if explicitly mentioned)
- [Relevant referrals for Issue 2] (only include if explicitly mentioned)
- [Follow up plan noting timeframe] (only include if explicitly mentioned)
- [Safety netting advice given] (only include if explicitly mentioned)

(Never come up with your own patient details, assessment, diagnosis, differential diagnosis, plan, interventions, evaluation, plan for continuing care, safety netting advice, etc - use only the transcript, contextual notes or clinical note as a reference for the information you include in your note. If any information related to a placeholder has not been explicitly mentioned in the transcript or contextual notes, just leave the relevant placeholder or section blank.)`,
  },
  {
    name: 'SOAP Note',
    description: 'Standard SOAP (Subjective, Objective, Assessment, Plan) format',
    type: 'default',
    templateBody: `(Standard SOAP format for general consultations. Only include information explicitly mentioned in the consultation data.)

S (SUBJECTIVE):
- [Patient's chief complaint and history as described by the patient] (only include if explicitly mentioned)
- [History of presenting complaint including onset, duration, severity] (only include if explicitly mentioned)
- [Past medical history] (only include if explicitly mentioned)
- [Current medications] (only include if explicitly mentioned)
- [Social history] (only include if explicitly mentioned)

O (OBJECTIVE):
- [Vital signs] (only include if explicitly mentioned)
- [Physical examination findings] (only include if explicitly mentioned and use as many bullet points as needed)
- [Diagnostic test results] (only include if explicitly mentioned)

A (ASSESSMENT):
- [Clinical assessment and diagnosis] (only include if explicitly mentioned)
- [Differential diagnosis] (only include if explicitly mentioned)

P (PLAN):
- [Investigations planned] (only include if explicitly mentioned)
- [Treatment prescribed or recommended] (only include if explicitly mentioned)
- [Follow-up arrangements] (only include if explicitly mentioned)
- [Patient education provided] (only include if explicitly mentioned)

(Only use facts from the consultation data. Do not generate any clinical assessments, diagnoses, or plans not explicitly mentioned in the transcript or contextual notes.)`,
  },
  {
    name: 'Mental Health Assessment',
    description: 'Comprehensive mental health consultation template',
    type: 'default',
    templateBody: `(Mental health assessment template. Only include information explicitly mentioned in the consultation.)

PRESENTING CONCERNS:
- [Patient's main mental health concerns] (only include if explicitly mentioned)
- [Duration and onset of symptoms] (only include if explicitly mentioned)
- [Triggers or precipitating factors] (only include if explicitly mentioned)
- [Impact on daily functioning] (only include if explicitly mentioned)

MENTAL STATE EXAMINATION:
- [Appearance and behaviour] (only include if explicitly mentioned)
- [Speech and communication] (only include if explicitly mentioned)
- [Mood and affect] (only include if explicitly mentioned)
- [Thought content and process] (only include if explicitly mentioned)
- [Perceptual disturbances] (only include if explicitly mentioned)
- [Cognitive function] (only include if explicitly mentioned)
- [Insight and judgment] (only include if explicitly mentioned)

RISK ASSESSMENT:
- [Suicidal ideation or self-harm risk] (only include if explicitly mentioned)
- [Risk to others] (only include if explicitly mentioned)
- [Protective factors] (only include if explicitly mentioned)

PSYCHIATRIC HISTORY:
- [Previous mental health episodes] (only include if explicitly mentioned)
- [Previous treatments and responses] (only include if explicitly mentioned)
- [Family psychiatric history] (only include if explicitly mentioned)

SUBSTANCE USE:
- [Alcohol use] (only include if explicitly mentioned)
- [Drug use] (only include if explicitly mentioned)
- [Impact of substance use] (only include if explicitly mentioned)

ASSESSMENT:
- [Clinical formulation] (only include if explicitly mentioned)
- [Provisional diagnosis] (only include if explicitly mentioned)

PLAN:
- [Therapeutic interventions] (only include if explicitly mentioned)
- [Medication recommendations] (only include if explicitly mentioned)
- [Safety planning] (only include if explicitly mentioned)
- [Referrals] (only include if explicitly mentioned)
- [Follow-up arrangements] (only include if explicitly mentioned)

(Only use information explicitly provided in the consultation data. Do not generate psychiatric assessments, diagnoses, or treatment plans not mentioned in the transcript or notes.)`,
  },
  {
    name: 'Pediatric Consultation',
    description: 'Specialized template for pediatric consultations',
    type: 'default',
    templateBody: `(Pediatric consultation template. Only include information explicitly mentioned in the consultation.)

PATIENT DETAILS:
- [Child's name and age] (only include if explicitly mentioned)
- [Accompanied by] (only include if explicitly mentioned)
- [Reason for visit] (only include if explicitly mentioned)

PRESENTING COMPLAINT:
- [Chief complaint as reported by parent/caregiver] (only include if explicitly mentioned)
- [Duration and characteristics of symptoms] (only include if explicitly mentioned)
- [Child's own description if age appropriate] (only include if explicitly mentioned)

HISTORY:
- [History of presenting complaint] (only include if explicitly mentioned)
- [Birth history] (only include if explicitly mentioned)
- [Developmental milestones] (only include if explicitly mentioned)
- [Immunization status] (only include if explicitly mentioned)
- [Past medical history] (only include if explicitly mentioned)
- [Family history] (only include if explicitly mentioned)
- [Social history] (only include if explicitly mentioned)

EXAMINATION:
- [Growth parameters (height, weight, head circumference)] (only include if explicitly mentioned)
- [Vital signs] (only include if explicitly mentioned)
- [General appearance and behaviour] (only include if explicitly mentioned)
- [System examination findings] (only include if explicitly mentioned and use as many bullet points as needed)

ASSESSMENT:
- [Clinical impression] (only include if explicitly mentioned)
- [Developmental assessment] (only include if explicitly mentioned)

PLAN:
- [Investigations] (only include if explicitly mentioned)
- [Treatment recommendations] (only include if explicitly mentioned)
- [Parent education provided] (only include if explicitly mentioned)
- [Safety advice] (only include if explicitly mentioned)
- [Follow-up arrangements] (only include if explicitly mentioned)

(Use only information explicitly mentioned in the consultation data. Do not generate pediatric assessments or recommendations not stated in the transcript or notes.)`,
  },
  {
    name: 'Emergency Department Note',
    description: 'Template for emergency department consultations',
    type: 'default',
    templateBody: `(Emergency department consultation template. Only include information explicitly mentioned.)

TRIAGE DETAILS:
- [Arrival time and mode] (only include if explicitly mentioned)
- [Triage category] (only include if explicitly mentioned)
- [Initial vital signs] (only include if explicitly mentioned)

PRESENTING COMPLAINT:
- [Chief complaint] (only include if explicitly mentioned)
- [Onset and duration] (only include if explicitly mentioned)
- [Associated symptoms] (only include if explicitly mentioned)
- [Pain score if applicable] (only include if explicitly mentioned)

HISTORY:
- [History of presenting complaint] (only include if explicitly mentioned)
- [Relevant past medical history] (only include if explicitly mentioned)
- [Current medications] (only include if explicitly mentioned)
- [Allergies] (only include if explicitly mentioned)
- [Social history including alcohol/drugs] (only include if explicitly mentioned)

EXAMINATION:
- [Primary survey if trauma] (only include if explicitly mentioned)
- [Vital signs] (only include if explicitly mentioned)
- [Focused examination findings] (only include if explicitly mentioned and use as many bullet points as needed)
- [Neurological assessment if indicated] (only include if explicitly mentioned)

INVESTIGATIONS:
- [Blood tests ordered and results] (only include if explicitly mentioned)
- [Imaging performed and results] (only include if explicitly mentioned)
- [ECG findings] (only include if explicitly mentioned)
- [Other investigations] (only include if explicitly mentioned)

ASSESSMENT:
- [Working diagnosis] (only include if explicitly mentioned)
- [Differential diagnoses] (only include if explicitly mentioned)

MANAGEMENT:
- [Treatments given] (only include if explicitly mentioned)
- [Medications administered] (only include if explicitly mentioned)
- [Procedures performed] (only include if explicitly mentioned)
- [Response to treatment] (only include if explicitly mentioned)

DISPOSITION:
- [Discharge home/admit/transfer] (only include if explicitly mentioned)
- [Discharge instructions] (only include if explicitly mentioned)
- [Follow-up arrangements] (only include if explicitly mentioned)
- [Return precautions] (only include if explicitly mentioned)

(Only document what was explicitly mentioned in the consultation. Do not generate emergency assessments or treatments not stated.)`,
  },
  {
    name: 'Chronic Disease Management',
    description: 'Template for ongoing chronic disease consultations',
    type: 'default',
    templateBody: `(Chronic disease management template. Only include information explicitly mentioned in the consultation.)

CURRENT STATUS:
- [Primary chronic condition being managed] (only include if explicitly mentioned)
- [Current symptoms or concerns] (only include if explicitly mentioned)
- [Functional status] (only include if explicitly mentioned)
- [Quality of life impact] (only include if explicitly mentioned)

DISEASE MONITORING:
- [Recent symptoms or changes] (only include if explicitly mentioned)
- [Medication adherence] (only include if explicitly mentioned)
- [Self-monitoring results] (only include if explicitly mentioned)
- [Lifestyle factors] (only include if explicitly mentioned)

EXAMINATION:
- [Vital signs] (only include if explicitly mentioned)
- [Disease-specific examination findings] (only include if explicitly mentioned)
- [Complications assessment] (only include if explicitly mentioned)

INVESTIGATIONS:
- [Recent blood tests and results] (only include if explicitly mentioned)
- [Imaging results] (only include if explicitly mentioned)
- [Specialist reports] (only include if explicitly mentioned)

CURRENT MANAGEMENT:
- [Current medications and doses] (only include if explicitly mentioned)
- [Non-pharmacological treatments] (only include if explicitly mentioned)
- [Patient education provided] (only include if explicitly mentioned)

PLAN:
- [Medication adjustments] (only include if explicitly mentioned)
- [Lifestyle recommendations] (only include if explicitly mentioned)
- [Monitoring plan] (only include if explicitly mentioned)
- [Referrals] (only include if explicitly mentioned)
- [Next review] (only include if explicitly mentioned)

GOALS:
- [Short-term goals] (only include if explicitly mentioned)
- [Long-term goals] (only include if explicitly mentioned)
- [Patient's own goals] (only include if explicitly mentioned)

(Only include information explicitly discussed in the consultation. Do not generate management plans or goals not mentioned.)`,
  },
  {
    name: 'Pre-operative Assessment',
    description: 'Template for pre-operative consultations',
    type: 'default',
    templateBody: `(Pre-operative assessment template. Only include information explicitly mentioned.)

PROCEDURE DETAILS:
- [Planned procedure] (only include if explicitly mentioned)
- [Indication for surgery] (only include if explicitly mentioned)
- [Planned date] (only include if explicitly mentioned)
- [Surgeon/team] (only include if explicitly mentioned)

MEDICAL HISTORY:
- [Relevant past medical history] (only include if explicitly mentioned)
- [Previous surgeries and anesthetics] (only include if explicitly mentioned)
- [Current medications] (only include if explicitly mentioned)
- [Allergies] (only include if explicitly mentioned)
- [Family history of anesthetic problems] (only include if explicitly mentioned)

EXAMINATION:
- [Vital signs] (only include if explicitly mentioned)
- [Airway assessment] (only include if explicitly mentioned)
- [Cardiovascular examination] (only include if explicitly mentioned)
- [Respiratory examination] (only include if explicitly mentioned)
- [Other relevant examination findings] (only include if explicitly mentioned)

INVESTIGATIONS:
- [Blood tests and results] (only include if explicitly mentioned)
- [ECG findings] (only include if explicitly mentioned)
- [Chest X-ray findings] (only include if explicitly mentioned)
- [Other investigations] (only include if explicitly mentioned)

RISK ASSESSMENT:
- [ASA classification] (only include if explicitly mentioned)
- [Cardiac risk] (only include if explicitly mentioned)
- [Respiratory risk] (only include if explicitly mentioned)
- [Other specific risks] (only include if explicitly mentioned)

ANESTHETIC PLAN:
- [Recommended anesthetic technique] (only include if explicitly mentioned)
- [Special considerations] (only include if explicitly mentioned)
- [Post-operative pain management] (only include if explicitly mentioned)

PRE-OPERATIVE INSTRUCTIONS:
- [Fasting instructions] (only include if explicitly mentioned)
- [Medication management] (only include if explicitly mentioned)
- [Other preparations] (only include if explicitly mentioned)

(Only include information explicitly discussed during the pre-operative assessment. Do not generate risk assessments or plans not mentioned.)`,
  },
];

export async function seedNewTemplates() {
  console.log('Seeding new natural language templates...');

  // First, clear existing default templates
  try {
    await sql`DELETE FROM templates WHERE type = 'default'`;
    console.log('✓ Cleared existing default templates');
  } catch (error) {
    console.error('✗ Failed to clear existing templates:', error);
  }

  for (const template of newTemplates) {
    try {
      await sql`
        INSERT INTO templates (name, description, type, template_body)
        VALUES (${template.name}, ${template.description}, ${template.type}, ${template.templateBody})
      `;
      console.log(`✓ Seeded template: ${template.name}`);
    } catch (error) {
      console.error(`✗ Failed to seed template ${template.name}:`, error);
      console.error('Error details:', {
        name: template.name,
        description: template.description,
        type: template.type,
        templateBodyLength: template.templateBody.length,
        templateBodyPreview: `${template.templateBody.substring(0, 100)}...`,
      });
    }
  }

  console.log('Template seeding complete!');
}

// Run if called directly
if (require.main === module) {
  seedNewTemplates()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}
