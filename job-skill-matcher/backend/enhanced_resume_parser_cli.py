#!/usr/bin/env python3
"""
Enhanced Resume Parser CLI for Job-Skill-Matcher Integration
Combines ensemble skill extraction with A/B testing for production use
"""

import sys
import os
import json
import fitz  # PyMuPDF
from typing import List, Dict, Optional
import argparse
import traceback

# Add current directory to path for imports
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.append(CURRENT_DIR)

try:
    from ensemble_skill_extractor import EnsembleSkillExtractor, SkillOntology
    from ab_testing_framework import ABTestManager
except ImportError as e:
    print(f"❌ Import error: {e}", file=sys.stderr)
    print("Please ensure ensemble_skill_extractor.py and ab_testing_framework.py are in the same directory", file=sys.stderr)
    sys.exit(1)

class JobSkillMatcherParser:
    """Enhanced parser specifically designed for job-skill-matcher integration"""
    
    def __init__(self):
        """Initialize the enhanced parser with A/B testing capabilities"""
        try:
            self.extractor = EnsembleSkillExtractor()
            self.ab_manager = ABTestManager()
            
            # Create default A/B test for skill extraction methods
            self.test_id = self._create_default_ab_test()
            
            print("✅ Enhanced parser initialized successfully", file=sys.stderr)
            
        except Exception as e:
            print(f"❌ Error initializing parser: {e}", file=sys.stderr)
            raise
    
    def _create_default_ab_test(self) -> str:
        """Create a default A/B test for production use"""
        try:
            from ab_testing_framework import TestVariant
            
            # Define test variants using proper TestVariant format
            baseline_variant = TestVariant(
                variant_id="baseline_v1",
                name="baseline",
                description="Balanced ensemble configuration",
                config={
                    'spacy_weight': 0.3,
                    'fuzzy_weight': 0.25,
                    'tfidf_weight': 0.2,
                    'embedding_weight': 0.25,
                    'confidence_threshold': 0.6
                },
                traffic_percentage=60.0,
                is_control=True
            )
            
            optimized_variant = TestVariant(
                variant_id="optimized_v1",
                name="optimized", 
                description="Embedding-focused configuration",
                config={
                    'spacy_weight': 0.2,
                    'fuzzy_weight': 0.2,
                    'tfidf_weight': 0.25,
                    'embedding_weight': 0.35,
                    'confidence_threshold': 0.65
                },
                traffic_percentage=40.0,
                is_control=False
            )
            
            test_id = self.ab_manager.create_test(
                name="Production Skill Extraction",
                description="Optimize skill extraction for job-skill-matcher",
                variants=[baseline_variant, optimized_variant]
            )
            
            self.ab_manager.start_test(test_id)
            return test_id
            
        except Exception as e:
            print(f"⚠️ Could not create A/B test: {e}", file=sys.stderr)
            return None
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text content from PDF file"""
        try:
            doc = fitz.open(pdf_path)
            text = ""
            
            for page_num in range(doc.page_count):
                page = doc[page_num]
                text += page.get_text() + "\n"
            
            doc.close()
            return text.strip()
            
        except Exception as e:
            print(f"❌ Error extracting text from PDF: {e}", file=sys.stderr)
            raise
    
    def extract_skills_with_ab_testing(self, text: str, user_id: Optional[str] = None) -> Dict:
        """Extract skills using ensemble system (A/B testing disabled for stability)"""
        try:
            # Skip A/B testing for now - use default configuration
            variant_name = 'default'
            
            # Extract skills using ensemble method
            skills = self.extractor.ensemble_extract(text)
            
            # Convert to job-skill-matcher compatible format
            formatted_skills = []
            for skill in skills:
                formatted_skills.append({
                    'skill': skill.skill,
                    'category': self._categorize_skill(skill.skill),
                    'confidence': round(skill.confidence, 3),
                    'method': skill.method,
                    'context': skill.context[:100] + '...' if len(skill.context) > 100 else skill.context,
                    'position': skill.position
                })
            
            # Generate summary statistics
            method_counts = {}
            for skill in skills:
                method_counts[skill.method] = method_counts.get(skill.method, 0) + 1
                
            result = {
                'extracted_skills': formatted_skills,
                'variant': variant_name,
                'summary': {
                    'total_skills': len(skills),
                    'avg_confidence': round(sum(s.confidence for s in skills) / max(len(skills), 1), 3),
                    'methods_used': method_counts,
                    'unique_skills': len(set(s.skill.lower() for s in skills))
                }
            }
            
            print(f"📊 Extracted {len(skills)} skills using variant '{variant_name}'", file=sys.stderr)
            return result
            
        except Exception as e:
            print(f"❌ Error in skill extraction: {e}", file=sys.stderr)
            import traceback
            traceback.print_exc(file=sys.stderr)
            raise
    
    def _categorize_skill(self, skill: str) -> str:
        """Categorize skills for job-skill-matcher compatibility"""
        skill_lower = skill.lower()
        
        # Programming languages
        programming_langs = {
            'python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'ruby', 'php',
            'swift', 'kotlin', 'go', 'rust', 'scala', 'perl', 'r', 'matlab', 'sql'
        }
        
        # Web technologies
        web_tech = {
            'html', 'css', 'html5', 'css3', 'sass', 'bootstrap', 'jquery', 'rest', 'api',
            'graphql', 'websocket', 'xml', 'json', 'ajax', 'react', 'angular', 'vue'
        }
        
        # Frameworks and libraries
        frameworks = {
            'django', 'flask', 'spring', 'express', 'node.js', 'next.js', 'gatsby',
            'svelte', 'laravel', 'asp.net', 'tensorflow', 'pytorch', 'keras', 'scikit-learn'
        }
        
        # Cloud and DevOps
        cloud_devops = {
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform',
            'ansible', 'linux', 'unix', 'nginx', 'apache', 'git', 'github', 'gitlab'
        }
        
        # Databases
        databases = {
            'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite',
            'cassandra', 'dynamodb', 'elasticsearch'
        }
        
        # AI/ML
        ai_ml = {
            'machine learning', 'deep learning', 'artificial intelligence', 'nlp',
            'computer vision', 'data science', 'neural networks'
        }
        
        if skill_lower in programming_langs:
            return 'programming_languages'
        elif skill_lower in web_tech:
            return 'web_technologies'
        elif skill_lower in frameworks:
            return 'frameworks'
        elif skill_lower in cloud_devops:
            return 'cloud_devops'
        elif skill_lower in databases:
            return 'databases'
        elif skill_lower in ai_ml:
            return 'ai_ml'
        else:
            return 'other'
    
    def submit_feedback(self, test_id: str, user_feedback: Dict, user_id: str = None):
        """Submit user feedback for continuous improvement"""
        try:
            # Record feedback metrics
            correct_count = len(user_feedback.get('correct_skills', []))
            missed_count = len(user_feedback.get('missed_skills', []))
            incorrect_count = len(user_feedback.get('incorrect_skills', []))
            
            # Calculate precision and recall approximations
            total_extracted = correct_count + incorrect_count
            total_actual = correct_count + missed_count
            
            precision = correct_count / total_extracted if total_extracted > 0 else 0
            recall = correct_count / total_actual if total_actual > 0 else 0
            f1_score = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
            
            # Record metrics in A/B test
            if test_id:
                variant = self.ab_manager.get_user_variant(test_id, user_id or "anonymous")
                if variant:
                    self.ab_manager.record_metric(test_id, variant, 'precision', precision)
                    self.ab_manager.record_metric(test_id, variant, 'recall', recall)
                    self.ab_manager.record_metric(test_id, variant, 'f1_score', f1_score)
            
            print(f"✅ Feedback recorded: P={precision:.3f}, R={recall:.3f}, F1={f1_score:.3f}", file=sys.stderr)
            
        except Exception as e:
            print(f"⚠️ Error recording feedback: {e}", file=sys.stderr)

def main():
    """Main CLI interface"""
    parser = argparse.ArgumentParser(description='Enhanced Resume Parser for Job-Skill-Matcher')
    parser.add_argument('pdf_path', help='Path to the PDF resume file')
    parser.add_argument('action', choices=['extract_skills'], help='Action to perform')
    parser.add_argument('--user-id', help='User ID for A/B testing (optional)')
    parser.add_argument('--feedback', help='JSON feedback for improving the model (optional)')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.pdf_path):
        print(f"❌ File not found: {args.pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    try:
        # Initialize parser
        job_parser = JobSkillMatcherParser()
        
        if args.action == 'extract_skills':
            # Extract text from PDF
            text = job_parser.extract_text_from_pdf(args.pdf_path)
            
            # Extract skills with A/B testing
            result = job_parser.extract_skills_with_ab_testing(text, args.user_id)
            
            # Handle feedback if provided
            if args.feedback:
                try:
                    feedback_data = json.loads(args.feedback)
                    job_parser.submit_feedback(
                        test_id=result['test_id'],
                        user_feedback=feedback_data,
                        user_id=args.user_id
                    )
                except json.JSONDecodeError as e:
                    print(f"⚠️ Invalid feedback JSON: {e}", file=sys.stderr)
            
            # Output results
            print(json.dumps(result['extracted_skills'], indent=2))
            
    except Exception as e:
        print(f"❌ Error: {e}", file=sys.stderr)
        print(traceback.format_exc(), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()