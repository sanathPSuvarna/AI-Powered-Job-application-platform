const axios = require('axios');

const testCareerSimulation = async () => {
    try {
        console.log('🧪 Testing Career Path Simulation API...');
        
        // Test data for a user interested in becoming a Data Engineer
        const testData = {
            goalId: 1, // Data Engineer
            currentSkills: ['Python', 'SQL', 'JavaScript'], // Basic skills
            experienceLevel: 'entry'
        };
        
        console.log('📊 Testing with data:', JSON.stringify(testData, null, 2));
        
        const response = await axios.post('http://localhost:5000/api/career-path/simulate', testData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (response.data.success) {
            console.log('✅ Career simulation API is working!');
            console.log('📈 Simulation results:');
            
            const { careerPath, analysis, recommendations } = response.data.data;
            
            console.log('\n🎯 Career Path Steps:');
            careerPath.forEach((step, index) => {
                console.log(`${index + 1}. ${step.step_title} (${step.estimated_duration_months} months)`);
                console.log(`   Description: ${step.step_description}`);
                console.log(`   Required Skills: ${step.required_skills?.map(s => s.skill_name).join(', ') || 'None listed'}`);
                console.log('');
            });
            
            console.log('📊 Skill Analysis:');
            console.log(`- Skills you have: ${analysis.skillsYouHave.length}`);
            console.log(`- Skills you need: ${analysis.skillsYouNeed.length}`);
            console.log(`- Overall match: ${analysis.overallMatch}%`);
            
            console.log('\n💡 Recommendations:');
            recommendations.forEach((rec, index) => {
                console.log(`${index + 1}. ${rec.title}`);
                console.log(`   Type: ${rec.type}`);
                console.log(`   Description: ${rec.description}`);
                console.log('');
            });
            
        } else {
            console.log('❌ API returned error:', response.data.message);
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
    }
};

testCareerSimulation();