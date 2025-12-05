require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
    try {
        console.log('Testing OpenAI connection...');
        console.log('API Key present:', !!process.env.OPENAI_API_KEY);
        console.log('API Key starts with:', process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 10) + '...' : 'N/A');
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant. Respond with a simple greeting."
                },
                {
                    role: "user",
                    content: "Hello! Can you confirm the connection is working?"
                }
            ],
            max_tokens: 50,
            temperature: 0.3
        });

        console.log('OpenAI Response:', completion.choices[0].message.content);
        console.log('✅ OpenAI integration working successfully!');
        
    } catch (error) {
        console.error('❌ OpenAI connection failed:', error.message);
        if (error.code === 'invalid_api_key') {
            console.error('The API key appears to be invalid');
        }
        if (error.code === 'insufficient_quota') {
            console.error('The API key has exceeded its quota');
        }
    }
}

testOpenAI();
