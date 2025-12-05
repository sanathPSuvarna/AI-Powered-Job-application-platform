const axios = require('axios');

async function testMockInterview() {
    try {
        console.log('🧪 Testing Mock Interview API with Gemini AI...\n');
        
        // Test 1: Start an interview
        console.log('1️⃣ Starting mock interview...');
        const startResponse = await axios.post('http://localhost:5000/api/interviews/start', {
            role: 'Software Engineer',
            experience: 'fresher',
            userId: 1
        });
        
        console.log('✅ Interview started successfully!');
        console.log('Session ID:', startResponse.data.sessionId);
        console.log('First Question:', startResponse.data.question.question);
        console.log('');
        
        // Test 2: Submit an answer
        console.log('2️⃣ Submitting test answer...');
        const submitResponse = await axios.post('http://localhost:5000/api/interviews/submit-answer', {
            sessionId: startResponse.data.sessionId,
            questionNumber: 1,
            answer: "A function is a reusable block of code that performs a specific task. We use functions to avoid code duplication, make code more organized, and easier to maintain. For example, you can create a function to calculate the area of a rectangle and call it multiple times with different values.",
            timeSpent: 45
        });
        
        console.log('✅ Answer submitted successfully!');
        console.log('AI Score:', submitResponse.data.score + '/100');
        console.log('AI Feedback:', submitResponse.data.feedback);
        console.log('Strengths:', submitResponse.data.strengths);
        console.log('Improvements:', submitResponse.data.improvements);
        console.log('');
        
        if (submitResponse.data.score && submitResponse.data.feedback) {
            console.log('🎉 GEMINI AI IS WORKING PERFECTLY!');
            console.log('✅ Your mock interview system now provides intelligent AI-powered feedback!');
        } else {
            console.log('⚠️ Received basic scoring (AI might be in fallback mode)');
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

testMockInterview();
