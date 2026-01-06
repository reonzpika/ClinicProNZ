require('dotenv').config()
const express = require('express')
const oauthTokenService = require('./services/oauth-token-service')
const alexApiClient = require('./services/alex-api-client')

const app = express()
app.use(express.json())

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    service: 'clinicpro-bff', 
    time: new Date().toISOString(),
    medtech: 'enabled'
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Medtech: Token info
app.get('/api/medtech/token-info', (req, res) => {
  const tokenInfo = oauthTokenService.getTokenInfo()
  res.json({
    tokenCache: {
      isCached: tokenInfo.isCached,
      expiresIn: tokenInfo.expiresIn ? {
        seconds: Math.round(tokenInfo.expiresIn / 1000),
        minutes: Math.round(tokenInfo.expiresIn / 60000),
      } : null,
    },
    environment: {
      baseUrl: process.env.MEDTECH_API_BASE_URL,
      facilityId: process.env.MEDTECH_FACILITY_ID,
      hasClientId: !!process.env.MEDTECH_CLIENT_ID,
      hasClientSecret: !!process.env.MEDTECH_CLIENT_SECRET,
    },
  })
})

// Medtech: Test FHIR connectivity
app.get('/api/medtech/test', async (req, res) => {
  const nhi = req.query.nhi || 'ZZZ0016'
  const startTime = Date.now()

  try {
    const tokenInfo = oauthTokenService.getTokenInfo()
    const patientBundle = await alexApiClient.get(
      `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`
    )

    res.json({
      success: true,
      duration: Date.now() - startTime,
      tokenInfo: {
        isCached: tokenInfo.isCached,
        expiresIn: tokenInfo.expiresIn ? Math.round(tokenInfo.expiresIn / 1000) : null,
      },
      fhirResult: {
        resourceType: patientBundle.resourceType,
        type: patientBundle.type,
        total: patientBundle.total,
        patientCount: patientBundle.entry?.length || 0,
      },
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    })
  }
})

// ============================================================================
// FHIR Resource Exploration Endpoints (for feature validation)
// ============================================================================

// Get DocumentReference (consultation notes) for a patient
app.get('/api/medtech/documents', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query
  const startTime = Date.now()

  try {
    let patientId = patient

    // If NHI provided, first look up patient ID
    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`
      )
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found' })
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required' })
    }

    const bundle = await alexApiClient.get(
      `/DocumentReference?patient=${patientId}&_count=${count}&_sort=-date`
    )

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      documents: bundle.entry?.map(e => e.resource) || [],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    })
  }
})

// Get DiagnosticReport (lab results) for a patient
app.get('/api/medtech/labs', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query
  const startTime = Date.now()

  try {
    let patientId = patient

    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`
      )
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found' })
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required' })
    }

    const bundle = await alexApiClient.get(
      `/DiagnosticReport?patient=${patientId}&_count=${count}&_sort=-date`
    )

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      reports: bundle.entry?.map(e => e.resource) || [],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    })
  }
})

// Get MedicationRequest (prescriptions) for a patient
app.get('/api/medtech/prescriptions', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query
  const startTime = Date.now()

  try {
    let patientId = patient

    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`
      )
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found' })
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required' })
    }

    const bundle = await alexApiClient.get(
      `/MedicationRequest?patient=${patientId}&_count=${count}&_sort=-date`
    )

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      prescriptions: bundle.entry?.map(e => e.resource) || [],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    })
  }
})

// Get Communication (referrals/messages) for a patient
app.get('/api/medtech/communications', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query
  const startTime = Date.now()

  try {
    let patientId = patient

    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`
      )
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found' })
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required' })
    }

    const bundle = await alexApiClient.get(
      `/Communication?patient=${patientId}&_count=${count}&_sort=-sent`
    )

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      communications: bundle.entry?.map(e => e.resource) || [],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    })
  }
})

// Get Task resources for a patient
app.get('/api/medtech/tasks', async (req, res) => {
  const { patient, nhi, count = 5 } = req.query
  const startTime = Date.now()

  try {
    let patientId = patient

    if (nhi && !patient) {
      const patientBundle = await alexApiClient.get(
        `/Patient?identifier=https://standards.digital.health.nz/ns/nhi-id|${nhi}`
      )
      if (patientBundle.entry?.length > 0) {
        patientId = patientBundle.entry[0].resource.id
      } else {
        return res.status(404).json({ success: false, error: 'Patient not found' })
      }
    }

    if (!patientId) {
      return res.status(400).json({ success: false, error: 'patient or nhi parameter required' })
    }

    const bundle = await alexApiClient.get(
      `/Task?patient=${patientId}&_count=${count}`
    )

    res.json({
      success: true,
      duration: Date.now() - startTime,
      patientId,
      total: bundle.total ?? bundle.entry?.length ?? 0,
      tasks: bundle.entry?.map(e => e.resource) || [],
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
    })
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`ClinicPro BFF listening on ${port}`)
  console.log('Medtech integration: enabled')
})
