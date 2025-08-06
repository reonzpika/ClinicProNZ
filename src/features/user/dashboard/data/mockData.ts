import { SessionData, OverviewMetrics } from '../types';

// Mock session data with realistic NZ GP scenarios
export const mockSessionData: SessionData[] = [
  {
    id: 'SS-20250106-001',
    dateTime: '2025-01-06T09:15:00Z',
    template: 'SOAP Note',
    duration: 22,
    generationTime: 3.2,
    completionTime: 18,
    satisfaction: 5,
    status: 'completed',
    consent: true,
    patientInitials: 'M.J.',
    transcript: `Doctor: Good morning, how can I help you today?
Patient: I've been having this persistent cough for about two weeks now, and it's getting worse at night.
Doctor: Tell me more about the cough. Is it dry or are you bringing anything up?
Patient: It's mostly dry, but sometimes there's a bit of clear phlegm in the morning.`,
    finalNote: `SOAP Note - Persistent Cough

SUBJECTIVE:
Patient presents with 2-week history of persistent cough, worsening at night. Predominantly dry cough with occasional clear sputum in mornings. No fever, SOB, or chest pain reported.

OBJECTIVE:
Vital signs stable. Chest examination reveals mild wheeze on auscultation. No signs of respiratory distress.

ASSESSMENT:
Likely viral upper respiratory tract infection with reactive airways component.

PLAN:
- Prescribe salbutamol inhaler PRN
- Return if symptoms worsen or persist >1 week
- Adequate hydration and rest advised`
  },
  {
    id: 'SS-20250106-002',
    dateTime: '2025-01-06T10:30:00Z',
    template: 'Mental Health Care Plan',
    duration: 28,
    generationTime: 4.1,
    completionTime: 25,
    satisfaction: 4,
    status: 'edited',
    consent: true,
    patientInitials: 'K.L.',
    transcript: `Doctor: I understand you've been feeling quite overwhelmed lately. Can you tell me more about what's been happening?
Patient: It's just everything feels too much. Work stress, family issues, and I can't seem to sleep properly anymore.
Doctor: How long have you been experiencing these feelings?
Patient: About three months now, since my dad passed away.`,
    finalNote: `Mental Health Care Plan - Grief and Anxiety

PRESENTING CONCERNS:
Patient experiencing significant psychological distress following father's death 3 months ago. Reports overwhelming feelings, work-related stress, family difficulties, and sleep disturbance.

MENTAL STATE EXAMINATION:
Alert and cooperative. Mood low, affect congruent. No psychotic features. Some anxiety symptoms present.

FORMULATION:
Grief reaction with secondary anxiety and adjustment difficulties.

TREATMENT PLAN:
- Referral to grief counsellor
- Sleep hygiene education
- Follow-up in 2 weeks
- Crisis contact numbers provided`
  },
  {
    id: 'SS-20250106-003',
    dateTime: '2025-01-06T11:45:00Z',
    template: 'Chronic Care Management',
    duration: 15,
    generationTime: 2.8,
    completionTime: 12,
    satisfaction: 3,
    status: 'generated',
    consent: false,
    patientInitials: 'R.P.',
    transcript: `Doctor: How has your diabetes management been going since our last visit?
Patient: Pretty good actually. I've been checking my blood sugars regularly and they're mostly in range.
Doctor: That's excellent. Any issues with your medications?
Patient: No, all good. The metformin doesn't upset my stomach anymore.`,
    finalNote: `Chronic Care - Type 2 Diabetes Review

CURRENT STATUS:
Patient reports good diabetes self-management. Regular blood glucose monitoring with results mostly within target range.

MEDICATIONS:
Metformin 500mg BD - well tolerated, no GI side effects reported.

VITAL SIGNS:
BP 128/82, Weight stable at 78kg

PLAN:
- Continue current regimen
- HbA1c due next month
- Annual diabetic screening arrangements discussed`
  },
  {
    id: 'SS-20250106-004',
    dateTime: '2025-01-06T14:20:00Z',
    template: 'SOAP Note',
    duration: 0,
    generationTime: 0,
    completionTime: 0,
    satisfaction: 1,
    status: 'failed',
    consent: true,
    patientInitials: 'A.B.',
    transcript: '',
    finalNote: ''
  },
  {
    id: 'SS-20250106-005',
    dateTime: '2025-01-06T15:10:00Z',
    template: 'Mental Health Care Plan',
    duration: 35,
    generationTime: 5.2,
    completionTime: 30,
    satisfaction: 5,
    status: 'completed',
    consent: true,
    patientInitials: 'D.W.',
    transcript: `Doctor: You mentioned on your booking that you've been feeling anxious about work. Tell me more about that.
Patient: Yes, I've started a new job and I feel like I'm not keeping up. I get these panic attacks sometimes.
Doctor: When did these panic attacks start?
Patient: About a month ago, just after I started the position.`,
    finalNote: `Mental Health Care Plan - Work-Related Anxiety

PRESENTING PROBLEM:
New-onset anxiety and panic attacks following job change 1 month ago. Patient reports feeling overwhelmed and unable to cope with work demands.

SYMPTOMS:
- Panic attacks 2-3 times per week
- Sleep disturbance
- Excessive worry about work performance
- Physical symptoms: palpitations, sweating

MANAGEMENT:
- Workplace stress management strategies discussed
- Breathing techniques taught
- Referral to clinical psychologist
- Sick leave certificate issued (3 days)
- Review in 1 week`
  }
];

export const mockOverviewMetrics: OverviewMetrics = {
  totalSessions: 2847,
  totalSessionsTrend: '+12%',
  sessionsToday: 23,
  sessionsTodayTrend: '+3',
  activeSessions: {
    generated: 5,
    edited: 3,
    completed: 2,
    failed: 1
  },
  averageConsultationTime: 18.5,
  consultationTimeTrend: '-2.3',
  timeSavedToday: 4.2,
  timeSavedTrend: '+1.1',
  adminTimeSaved: 1260,
  adminTimeSavedTrend: '-$420',
  consentCompliance: 98.2
};

export const templateOptions = [
  'All Templates',
  'SOAP Note',
  'Mental Health Care Plan', 
  'Chronic Care Management',
  'Referral Letter',
  'Medical Certificate',
  'Prescription Review'
];

export const statusOptions = [
  'All Statuses',
  'Generated',
  'Edited', 
  'Completed',
  'Failed'
];