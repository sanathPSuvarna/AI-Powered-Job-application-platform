#!/usr/bin/env python3
"""
Test Integration Script
Demonstrates the full ensemble skill extraction system integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from enhanced_resume_parser import EnhancedResumeParser
import json

def test_enhanced_parser():
    """Test the enhanced resume parser with A/B testing"""
    print("🧪 Testing Enhanced Resume Parser with A/B Testing")
    print("=" * 60)
    
    # Initialize the enhanced parser
    parser = EnhancedResumeParser()
    
    # Sample resume text
    resume_text = """
    Senior Data Scientist with 5+ years of experience in Python, machine learning, 
    and deep learning. Proficient in TensorFlow, PyTorch, scikit-learn, pandas, 
    and NumPy. Experience with cloud platforms like AWS and Azure. Skilled in 
    data visualization using matplotlib and seaborn. Strong background in 
    statistical analysis and SQL database management.
    """
    
    print("📄 Sample Resume Text:")
    print(resume_text.strip())
    print("\n" + "="*60)
    
    # Extract skills with A/B testing
    result = parser.extract_skills_with_ab_testing(
        resume_text=resume_text,
        user_id="test_user_123"
    )
    
    print("📊 Extraction Results:")
    print(f"Variant used: {result['variant']}")
    print(f"Skills found: {len(result['skills'])}")
    print("\nSkills detected:")
    
    for skill in result['skills'][:10]:  # Show top 10
        print(f"  • {skill['name']} (confidence: {skill['confidence']:.3f})")
    
    print(f"\nExtraction time: {result['extraction_time']:.3f}s")
    print(f"Test ID: {result['test_id']}")
    
    # Show A/B test status
    print("\n🔬 A/B Test Status:")
    test_status = parser.ab_manager.get_test_results(result['test_id'])
    if test_status and 'variants' in test_status:
        for variant_name, stats in test_status['variants'].items():
            print(f"  {variant_name}: {stats['sample_size']} samples")
    
    return result

def test_feedback_loop():
    """Test the feedback collection system"""
    print("\n💬 Testing Feedback Collection")
    print("=" * 60)
    
    parser = EnhancedResumeParser()
    
    # Simulate user feedback
    feedback = {
        'correct_skills': ['Python', 'TensorFlow', 'AWS'],
        'missed_skills': ['Docker', 'Kubernetes'],
        'incorrect_skills': []
    }
    
    # Submit feedback
    parser.submit_feedback(
        test_id="sample_test_id",
        user_feedback=feedback,
        user_id="test_user_123"
    )
    
    print("✅ Feedback submitted successfully")
    print(f"Correct skills: {feedback['correct_skills']}")
    print(f"Missed skills: {feedback['missed_skills']}")
    print(f"Incorrect skills: {feedback['incorrect_skills']}")

def main():
    """Run all integration tests"""
    print("🚀 Enhanced Skill Extraction System - Integration Test")
    print("=" * 80)
    
    try:
        # Test 1: Basic extraction with A/B testing
        result = test_enhanced_parser()
        
        # Test 2: Feedback collection
        test_feedback_loop()
        
        print("\n🎉 All integration tests completed successfully!")
        print("\nNext steps:")
        print("1. View dashboard at: http://localhost:8501")
        print("2. Check A/B test results in the dashboard")
        print("3. Submit more feedback to improve the model")
        print("4. Monitor performance metrics over time")
        
    except Exception as e:
        print(f"❌ Test failed: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()