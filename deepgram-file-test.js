const { createClient } = require('@deepgram/sdk');
const fs = require('fs');
require('dotenv').config();

const deepgram = createClient(process.env.DEEPGRAM_API_KEY);

const connection = deepgram.listen.live({
  model: 'general', // or 'nova-2'
  language: 'en-US', // or 'en-NZ'
  encoding: 'linear16',
  sample_rate: 16000,
  channels: 1,
});

connection.on('open', () => {
  console.error('Connection opened');
  const audio = fs.readFileSync('test.wav');
  connection.send(audio);
  connection.finish();
});

connection.on('transcriptReceived', (data) => {
  console.error('Transcript:', JSON.stringify(data));
});

connection.on('error', (err) => {
  console.error('Error:', err);
});

connection.on('close', () => {
  console.error('Connection closed');
});