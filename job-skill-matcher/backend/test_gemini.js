require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Test function to verify Gemini setup
async function testGemini() {
    try {
        console.log('🔍 Testing Google Gemini integration...');
        console.log('Google API Key present:', !!process.env.GOOGLE_API_KEY);
        console.log('Google API Key:', process.env.GOOGLE_API_KEY ? process.env.GOOGLE_API_KEY.substring(0, 10) + '...' : 'Not set');
        
        if (!process.env.GOOGLE_API_KEY || process.env.GOOGLE_API_KEY === 'your-gemini-api-key-here') {
            console.log('\n❌ No Google API key found!');
            console.log('\n📝 To get a FREE Google Gemini API key:');
            console.log('1. Visit: https://makersuite.google.com/app/apikey');
            console.log('2. Sign in with your Google account');
            console.log('3. Click "Create API key"');
            console.log('4. Copy the key and add it to your .env file:');
            console.log('   GOOGLE_API_KEY=your-actual-api-key-here');
            console.log('\n🆓 Google Gemini is completely FREE with 15 requests per minute!');
            return;
        }
        
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        const prompt = `Test question: "What is a variable in programming?"
Test answer: "A variable is a storage location with a name that holds data which can be changed during program execution."

Evaluate this answer and return JSON:
{
    "score": 85,
    "feedback": "Good basic explanation",
    "strengths": ["Clear definition"],
    "improvements": ["Add examples"]
}`;

        console.log('\n🚀 Sending test request to Gemini...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        console.log('\n✅ Gemini Response:', text);
        
        // Try to parse as JSON
        try {
            const cleanedText = text.replace(/```json|```/g, '').trim();
            const parsed = JSON.parse(cleanedText);
            console.log('\n🎉 JSON parsing successful!');
            console.log('Score:', parsed.score);
            console.log('Feedback:', parsed.feedback);
            console.log('Strengths:', parsed.strengths);
            console.log('Improvements:', parsed.improvements);
            
            console.log('\n✅ Google Gemini integration is working perfectly!');
            console.log('🎯 Your mock interview system now has FREE AI-powered analysis!');
            
        } catch (parseError) {
            console.log('\n⚠️ Response received but JSON parsing failed');
            console.log('Raw response:', text);
        }
        
    } catch (error) {
        console.error('\n❌ Gemini test failed:', error.message);
        
        if (error.message.includes('API_KEY_INVALID')) {
            console.log('\n🔑 The API key appears to be invalid');
            console.log('Please check your API key at: https://makersuite.google.com/app/apikey');
        }
        
        if (error.message.includes('quota')) {
            console.log('\n📊 API quota exceeded (though Gemini should be free)');
            console.log('Try creating a new API key');
        }
    }
}

// Run the test
testGemini();
