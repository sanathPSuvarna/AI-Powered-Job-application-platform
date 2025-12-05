const axios = require('axios');

const testUpdatedCareerSimulation = async () => {
    try {
        console.log('🧪 Testing Updated Career Path Simulation API...');
        
        // Test 1: Guest user with manual skills
        console.log('\n📝 Test 1: Guest user with manual skills');
        const guestTestData = {
            goalId: 1, // Data Engineer
            currentSkills: ['Python', 'SQL', 'JavaScript', 'Git'], // Some basic skills
            experienceLevel: 'entry'
        };
        
        console.log('📊 Testing with data:', JSON.stringify(guestTestData, null, 2));
        
        const guestResponse = await axios.post('http://localhost:5000/api/career-path/simulate', guestTestData, {
            headers: {
                'Content-Type': 'application/json'
                // No authorization header for guest test
            }
        });
        
        if (guestResponse.data.success) {
            console.log('✅ Guest simulation API is working!');
            const { roadmap, user_skills, overall_readiness } = guestResponse.data.data;
            
            console.log(`📈 Overall Readiness: ${overall_readiness}%`);
            console.log(`👤 User Skills Count: ${user_skills.length}`);
            console.log('🎯 User Skills:', user_skills.map(s => s.skill_name).join(', '));
            
            // Check first step analysis
            if (roadmap.length > 0) {
                const firstStep = roadmap[0];
                console.log(`\n🔍 First Step Analysis: ${firstStep.step.step_title}`);
                console.log(`   ✅ Skills You Have: ${firstStep.analysis.matched_skills.map(s => s.skill_name).join(', ')}`);
                console.log(`   ❌ Skills to Learn: ${firstStep.analysis.missing_skills.map(s => s.skill_name).join(', ')}`);
                console.log(`   🔴 Optional Skills: ${firstStep.analysis.optional_skills.map(s => s.skill_name).join(', ')}`);
                console.log(`   📊 Completion: ${firstStep.analysis.completion_percentage}%`);
                
                // Verify that user skills are NOT in missing skills
                const userSkillNames = user_skills.map(s => s.skill_name.toLowerCase());
                const missingSkillNames = firstStep.analysis.missing_skills.map(s => s.skill_name.toLowerCase());
                const incorrectlyMissing = missingSkillNames.filter(skill => userSkillNames.includes(skill));
                
                if (incorrectlyMissing.length === 0) {
                    console.log('✅ FIXED: User skills are correctly excluded from missing skills!');
                } else {
                    console.log('❌ ISSUE: These user skills are still showing as missing:', incorrectlyMissing.join(', '));
                }
            }
        } else {
            console.log('❌ Guest API returned error:', guestResponse.data.message);
        }
        
        // Test 2: More advanced skills
        console.log('\n📝 Test 2: Advanced user with more skills');
        const advancedTestData = {
            goalId: 1, // Data Engineer
            currentSkills: ['Python', 'SQL', 'Apache Spark', 'Docker', 'AWS', 'Kubernetes', 'Apache Airflow'], // More advanced skills
            experienceLevel: 'senior'
        };
        
        const advancedResponse = await axios.post('http://localhost:5000/api/career-path/simulate', advancedTestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (advancedResponse.data.success) {
            console.log('✅ Advanced user simulation working!');
            const { roadmap, overall_readiness } = advancedResponse.data.data;
            console.log(`📈 Advanced User Overall Readiness: ${overall_readiness}%`);
            
            // Check readiness across steps
            roadmap.forEach((step, index) => {
                console.log(`   Step ${index + 1}: ${step.step.step_title} - ${step.analysis.completion_percentage}% ready`);
            });
        }
        
        console.log('\n🎉 All tests completed successfully!');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        if (error.response?.data) {
            console.error('Error details:', error.response.data);
        }
    }
};

testUpdatedCareerSimulation();