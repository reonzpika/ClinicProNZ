const WebSocket = require('ws');

// Starting WebSocket server on port 8080...

const wss = new WebSocket.Server({
  port: 8080,
  path: '/ws/mobile',
});

// WebSocket server started on ws://localhost:8080/ws/mobile

wss.on('connection', (ws, req) => {
  // New WebSocket connection from: req.url

  // Extract token from URL for logging (but don't validate)
  const url = new URL(req.url, 'ws://localhost:8080');
  const deviceId = url.searchParams.get('deviceId');

  // Connection established with token and device info
  // Total connected clients: wss.clients.size

  // Send welcome message with correct format
  ws.send(JSON.stringify({
    type: 'connected',
    userId: 'test-user',
    deviceId: deviceId || 'test-device',
    message: 'Connected successfully',
  }));

  // Simulate sending current patient session info to mobile
  // In real implementation, this would come from the database
  setTimeout(() => {
    ws.send(JSON.stringify({
      type: 'switch_patient',
      patientSessionId: 'test-session-123',
      patientName: 'Test Patient',
    }));
  }, 1000);

  ws.on('message', (data) => {
    // Received WebSocket message

    try {
      const message = JSON.parse(data.toString());

      // Handle different message types
      if (message.type === 'transcription') {
        // Transcription received and processing

        // Broadcast transcription to ALL connected clients (not just sender)
        const transcriptionMessage = {
          type: 'transcription',
          transcript: message.transcript,
          patientSessionId: message.patientSessionId,
          deviceId: message.deviceId || deviceId,
        };

        // Broadcasting to connected clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            // Sending transcription to client
            client.send(JSON.stringify(transcriptionMessage));
          } else {
            // Skipping client - connection not open
          }
        });
      } else if (message.type === 'ping') {
        // Respond to ping with pong
        ws.send(JSON.stringify({ type: 'pong' }));
      }
    // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      // Error parsing WebSocket message
    }
  });

  ws.on('close', () => {
    // WebSocket connection closed
    // Updated client count after disconnect
  });

  ws.on('error', () => {
    // WebSocket error occurred
  });
});

// WebSocket server ready for connections
