const { GoogleGenerativeAI } = require('@google/generative-ai');
const apiKey = 'AIzaSyAzUsJWgYYUDNpCdUXZJ4EAUeXiZObLNT4';
const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log('Available models:', data.models.map(m => m.name).filter(n => n.includes('gemini')));
  } catch (err) {
    console.error('ERROR:', err);
  }
}
test();
