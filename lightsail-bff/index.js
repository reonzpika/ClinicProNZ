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

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`ClinicPro BFF listening on ${port}`)
  console.log('Medtech integration: enabled')
})
