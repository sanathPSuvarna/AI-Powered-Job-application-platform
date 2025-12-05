"""
Integration script for Enhanced Skill Extraction System
Integrates ensemble extraction with existing resume parser
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from ensemble_skill_extractor import EnsembleSkillExtractor, EnsembleConfig
from ab_testing_framework import ABTestManager, TestMetrics
import time
import logging

class EnhancedResumeParser:
    """Enhanced resume parser with ensemble skill extraction"""
    
    def __init__(self, enable_ab_testing=True):
        self.extractor = EnsembleSkillExtractor()
        self.ab_manager = ABTestManager() if enable_ab_testing else None
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def extract_skills_from_text(self, text: str, user_id: str = None) -> dict:
        """
        Extract skills from text using ensemble approach
        Returns both skills and metadata for monitoring
        """
        start_time = time.time()
        
        # Get user's A/B test configuration if available
        config = None
        test_variant = None
        
        if self.ab_manager and user_id:
            active_tests = self.ab_manager.get_active_tests()
            if active_tests:
                # Use first active test for this example
                test = active_tests[0]
                config = self.ab_manager.get_user_config(user_id, test.test_id)
                test_variant = self.ab_manager.assign_user_to_variant(user_id, test.test_id)
                
                # Update extractor config if A/B test config available
                if config:
                    self._update_extractor_config(config)
        
        # Extract skills using ensemble approach
        skill_matches = self.extractor.ensemble_extract(text)
        
        extraction_time = time.time() - start_time
        
        # Prepare results
        extracted_skills = []
        for match in skill_matches:
            extracted_skills.append({
                'skill_name': match.skill,
                'confidence': match.confidence,
                'method': match.method,
                'context': match.context,
                'position': match.position
            })
        
        # Metadata for monitoring
        metadata = {
            'extraction_time': extraction_time,
            'total_skills_found': len(extracted_skills),
            'methods_used': list(set(match.method for match in skill_matches)),
            'average_confidence': sum(match.confidence for match in skill_matches) / len(skill_matches) if skill_matches else 0,
            'ab_test_variant': test_variant,
            'timestamp': time.time()
        }
        
        # Record metrics for A/B testing if applicable
        if self.ab_manager and test_variant and user_id:
            # Simulate some metrics (in production, get real user feedback)
            metrics = TestMetrics(
                precision=0.85,  # Would be calculated from user feedback
                recall=0.82,     # Would be calculated from user feedback
                f1_score=0.835,  # Would be calculated from user feedback
                extraction_time=extraction_time,
                user_satisfaction=4.2,  # From user feedback
                total_extractions=len(extracted_skills)
            )
            
            active_tests = self.ab_manager.get_active_tests()
            if active_tests:
                self.ab_manager.record_metrics(active_tests[0].test_id, test_variant, metrics)
        
        return {
            'skills': extracted_skills,
            'metadata': metadata
        }
    
    def _update_extractor_config(self, config: dict):
        """Update extractor configuration from A/B test"""
        for key, value in config.items():
            if hasattr(self.extractor.config, key):
                setattr(self.extractor.config, key, value)
    
    def add_user_feedback(self, text: str, predicted_skills: list, correct_skills: list, user_id: str = None):
        """Add user feedback for active learning"""
        self.extractor.add_feedback(text, predicted_skills, correct_skills, user_id)
    
    def retrain_models(self):
        """Retrain models with accumulated feedback"""
        self.extractor.retrain_with_feedback()
    
    def get_extraction_statistics(self):
        """Get comprehensive extraction statistics"""
        stats = self.extractor.get_skill_statistics()
        
        if self.ab_manager:
            active_tests = self.ab_manager.get_active_tests()
            stats['ab_testing'] = {
                'active_tests': len(active_tests),
                'test_names': [test.name for test in active_tests]
            }
        
        return stats

def main():
    """Example usage of enhanced resume parser"""
    parser = EnhancedResumeParser()
    
    # Sample resume text
    sample_resume = """
    John Doe
    Senior Software Engineer
    
    Summary:
    Experienced software engineer with 8 years in full-stack development.
    Expert in Python, JavaScript, and React. Strong background in machine learning
    and data science using TensorFlow and scikit-learn. Proficient in cloud
    platforms including AWS and Azure. Experience with Docker, Kubernetes,
    and CI/CD pipelines.
    
    Technical Skills:
    - Programming: Python, JavaScript, Java, TypeScript
    - Frameworks: React, Angular, Django, Flask, Express.js
    - Databases: PostgreSQL, MongoDB, Redis
    - Cloud: AWS (EC2, S3, Lambda), Azure, Google Cloud
    - DevOps: Docker, Kubernetes, Jenkins, GitLab CI
    - ML/AI: TensorFlow, PyTorch, scikit-learn, pandas, numpy
    
    Experience:
    Senior Software Engineer at TechCorp (2020-Present)
    - Led development of microservices architecture using Docker and Kubernetes
    - Implemented machine learning models for recommendation system
    - Managed AWS infrastructure and CI/CD pipelines
    
    Software Engineer at StartupXYZ (2018-2020)
    - Developed web applications using React and Node.js
    - Built REST APIs with Python Django and PostgreSQL
    - Implemented automated testing and deployment processes
    """
    
    print("🚀 Enhanced Resume Parser Demo")
    print("=" * 50)
    
    # Extract skills
    user_id = "demo_user_123"
    result = parser.extract_skills_from_text(sample_resume, user_id)
    
    print(f"\n📊 Extraction Results:")
    print(f"Total skills found: {result['metadata']['total_skills_found']}")
    print(f"Extraction time: {result['metadata']['extraction_time']:.3f}s")
    print(f"Average confidence: {result['metadata']['average_confidence']:.3f}")
    print(f"Methods used: {', '.join(result['metadata']['methods_used'])}")
    
    if result['metadata']['ab_test_variant']:
        print(f"A/B test variant: {result['metadata']['ab_test_variant']}")
    
    print(f"\n🎯 Top Skills (sorted by confidence):")
    sorted_skills = sorted(result['skills'], key=lambda x: x['confidence'], reverse=True)
    
    for i, skill in enumerate(sorted_skills[:10], 1):
        print(f"{i:2d}. {skill['skill_name']:<20} (confidence: {skill['confidence']:.3f}, method: {skill['method']})")
    
    # Simulate user feedback
    print(f"\n💬 Simulating User Feedback...")
    predicted_skills = [skill['skill_name'] for skill in result['skills']]
    
    # Simulate some corrections (user removes incorrect skills and adds missing ones)
    correct_skills = predicted_skills[:8] + ['Git', 'REST API']  # Remove some, add some
    
    parser.add_user_feedback(sample_resume, predicted_skills, correct_skills, user_id)
    print(f"Feedback submitted: {len(correct_skills)} correct skills identified")
    
    # Get statistics
    print(f"\n📈 System Statistics:")
    stats = parser.get_extraction_statistics()
    for key, value in stats.items():
        if isinstance(value, dict):
            print(f"{key}:")
            for sub_key, sub_value in value.items():
                print(f"  {sub_key}: {sub_value}")
        else:
            print(f"{key}: {value}")

if __name__ == "__main__":
    main()