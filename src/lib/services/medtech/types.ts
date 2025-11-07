/**
 * FHIR R4 Resource Types for Medtech ALEX API
 *
 * Minimal type definitions for FHIR resources
 * See https://hl7.org/fhir/R4/ for complete spec
 */

export interface FhirIdentifier {
  system?: string
  value: string
  use?: 'usual' | 'official' | 'temp' | 'secondary'
}

export interface FhirCodeableConcept {
  coding?: Array<{
    system?: string
    code?: string
    display?: string
  }>
  text?: string
}

export interface FhirReference {
  reference?: string
  type?: string
  display?: string
}

export interface FhirBundle<T = unknown> {
  resourceType: 'Bundle'
  type: 'searchset' | 'transaction' | 'collection' | 'document' | 'message'
  total?: number
  entry?: Array<{
    fullUrl?: string
    resource: T
    search?: {
      mode: 'match' | 'include' | 'outcome'
      score?: number
    }
  }>
}

export interface FhirPatient {
  resourceType: 'Patient'
  id?: string
  identifier?: FhirIdentifier[]
  name?: Array<{
    use?: 'usual' | 'official' | 'temp' | 'nickname'
    family?: string
    given?: string[]
    prefix?: string[]
  }>
  gender?: 'male' | 'female' | 'other' | 'unknown'
  birthDate?: string
  address?: Array<{
    use?: 'home' | 'work' | 'temp' | 'old'
    line?: string[]
    city?: string
    postalCode?: string
    country?: string
  }>
  telecom?: Array<{
    system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other'
    value: string
    use?: 'home' | 'work' | 'temp' | 'old' | 'mobile'
  }>
}

export interface FhirEncounter {
  resourceType: 'Encounter'
  id?: string
  identifier?: FhirIdentifier[]
  status: 'planned' | 'arrived' | 'triaged' | 'in-progress' | 'onleave' | 'finished' | 'cancelled'
  class?: {
    system?: string
    code?: string
    display?: string
  }
  subject?: FhirReference
  period?: {
    start?: string
    end?: string
  }
  reasonCode?: FhirCodeableConcept[]
  diagnosis?: Array<{
    condition?: FhirReference
    use?: FhirCodeableConcept
    rank?: number
  }>
}

export interface FhirMedia {
  resourceType: 'Media'
  id?: string
  identifier?: FhirIdentifier[]
  status: 'preparation' | 'in-progress' | 'not-done' | 'on-hold' | 'stopped' | 'completed' | 'entered-in-error' | 'unknown'
  type?: FhirCodeableConcept
  modality?: FhirCodeableConcept
  view?: FhirCodeableConcept
  subject?: FhirReference
  encounter?: FhirReference
  createdDateTime?: string
  operator?: FhirReference
  bodySite?: FhirCodeableConcept
  content: {
    contentType: string
    data?: string // base64 encoded
    url?: string
    size?: number
    hash?: string // base64 encoded SHA-1
    title?: string
  }
}

export interface FhirTask {
  resourceType: 'Task'
  id?: string
  identifier?: FhirIdentifier[]
  status: 'draft' | 'requested' | 'received' | 'accepted' | 'rejected' | 'ready' | 'cancelled' | 'in-progress' | 'on-hold' | 'failed' | 'completed' | 'entered-in-error'
  intent: 'unknown' | 'proposal' | 'plan' | 'order' | 'original-order' | 'reflex-order' | 'filler-order' | 'instance-order' | 'option'
  priority?: 'routine' | 'urgent' | 'asap' | 'stat'
  description?: string
  for?: FhirReference
  encounter?: FhirReference
  authoredOn?: string
  requester?: FhirReference
  owner?: FhirReference
  note?: Array<{
    text: string
    time?: string
  }>
}

export interface FhirOperationOutcome {
  resourceType: 'OperationOutcome'
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information'
    code: string
    diagnostics?: string
    details?: {
      text?: string
    }
    location?: string[]
    expression?: string[]
  }>
}
