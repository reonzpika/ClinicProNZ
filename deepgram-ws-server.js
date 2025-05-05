// Standalone WebSocket server for Deepgram real-time transcription
const WebSocket = require('ws');
const { createClient } = require('@deepgram/sdk');
require('dotenv').config();

const wss = new WebSocket.Server({ port: 8080 });
console.error('WebSocket server listening on ws://localhost:8080');

wss.on('connection', (ws) => {
  console.error('Client connected');

  const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
  const dgConnection = deepgram.listen.live({
    model: 'nova-2',
    language: 'en-NZ',
    smart_format: true,
    interim_results: true,
    punctuate: true,
    diarize: true,
    utterances: true,
    vad_events: true,
    channels: 1,
  });

  dgConnection.on('open', () => {
    console.error('Deepgram connection opened');
  });

  dgConnection.on('transcriptReceived', (data) => {
    console.error('Deepgram transcriptReceived:', JSON.stringify(data));
    const transcript = data.channel.alternatives[0]?.transcript;
    if (transcript) {
      ws.send(JSON.stringify({ transcript, isFinal: data.is_final }));
    }
  });

  dgConnection.on('metadata', (data) => {
    console.error('Deepgram metadata:', JSON.stringify(data));
  });

  dgConnection.on('warning', (data) => {
    console.error('Deepgram warning:', JSON.stringify(data));
  });

  dgConnection.on('error', (err) => {
    console.error('Deepgram error:', err);
    ws.send(JSON.stringify({ error: err.message }));
    ws.close();
  });

  dgConnection.on('close', () => {
    console.error('Deepgram connection closed');
    ws.close();
  });

  ws.on('message', (message) => {
    // Log the received audio data
    console.error('Received message of length:', message.length, 'First bytes:', message.slice(0, 8));
    // Forward all received data to Deepgram
    dgConnection.send(message);
  });

  ws.on('close', () => {
    console.error('Client disconnected');
    dgConnection.finish();
  });
});
