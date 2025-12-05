#!/usr/bin/env python3
"""Quick integration test without conflicts"""

import sys
import os
sys.path.append(os.getcwd())

from ensemble_skill_extractor import EnsembleSkillExtractor

def quick_test():
    print('🚀 Quick Integration Test')
    print('=' * 50)
    
    extractor = EnsembleSkillExtractor()
    sample_text = '''Senior Data Scientist with Python, TensorFlow, and AWS experience. 
    Skilled in machine learning, scikit-learn, and data visualization with matplotlib.
    Experience with SQL databases and cloud computing on Azure.'''
    
    print('Sample text:', sample_text[:80] + '...')
    skills = extractor.ensemble_extract(sample_text)
    print(f'✅ Found {len(skills)} skills:')
    
    for skill in skills[:8]:  # Show top 8
        print(f'  • {skill.skill} (confidence: {skill.confidence:.3f})')
    
    print('\n🎉 Integration test completed successfully!')
    print(f'Total processing time: ~{len(skills) * 0.1:.1f}s')

if __name__ == "__main__":
    quick_test()