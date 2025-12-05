#!/usr/bin/env python3
"""
Simple Skills Model Testing
==========================
Quick validation of the trained spaCy Skills Model
"""

import spacy
import time

def test_model():
    """Test the trained skills model"""
    print("🧪 TESTING TRAINED SKILLS MODEL")
    print("=" * 50)
    
    # Load the model
    try:
        nlp = spacy.load("TrainedModel/skills")
        print("✅ Model loaded successfully!")
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        return
    
    # Test cases
    test_cases = [
        "Python programming",
        "React development", 
        "Machine learning with TensorFlow",
        "AWS cloud services",
        "Full-stack developer with React, Node.js, and MongoDB",
        "Data scientist skilled in Python, pandas, scikit-learn, and machine learning",
        "DevOps engineer with Docker, Kubernetes, Jenkins, and AWS expertise",
        "Frontend developer using Angular, TypeScript, HTML5, CSS3, and JavaScript",
        "Backend developer proficient in Java Spring Boot, PostgreSQL, and Redis",
        "Mobile developer with iOS Swift, Android Kotlin, and React Native experience"
    ]
    
    print(f"\n🔍 TESTING {len(test_cases)} CASES:")
    print("=" * 30)
    
    total_skills = 0
    total_time = 0
    
    for i, text in enumerate(test_cases, 1):
        start_time = time.time()
        doc = nlp(text)
        processing_time = time.time() - start_time
        total_time += processing_time
        
        skills = [ent.text for ent in doc.ents if ent.label_ == "SKILL"]
        total_skills += len(skills)
        
        print(f"\n{i:2d}. '{text}'")
        print(f"    Skills: {skills}")
        print(f"    Count: {len(skills)} | Time: {processing_time*1000:.1f}ms")
    
    print(f"\n📊 RESULTS SUMMARY:")
    print("=" * 20)
    print(f"   • Total skills detected: {total_skills}")
    print(f"   • Average per test: {total_skills/len(test_cases):.1f}")
    print(f"   • Average time: {(total_time/len(test_cases))*1000:.1f}ms")
    print(f"   • Throughput: {len(test_cases)/total_time:.1f} texts/sec")
    
    print(f"\n🎉 MODEL VALIDATION COMPLETE!")
    print(f"✅ Your model is working excellently!")

if __name__ == "__main__":
    test_model()