"""
Quick demo script for Enhanced Skill Extraction System
Run this to see the ensemble approach in action
"""

import sys
import os

# Add current directory to path for imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def demo_basic_extraction():
    """Demo basic skill extraction"""
    print("🔧 Setting up Enhanced Skill Extraction System...")
    print("Note: Some imports may fail if dependencies aren't installed")
    print("Run: pip install scikit-learn sentence-transformers fuzzywuzzy")
    print("=" * 60)
    
    try:
        from ensemble_skill_extractor import EnsembleSkillExtractor, EnsembleConfig
        
        # Initialize with default config
        config = EnsembleConfig(
            spacy_weight=0.3,
            fuzzy_weight=0.2, 
            tfidf_weight=0.25,
            embedding_weight=0.25,
            min_confidence=0.6
        )
        
        print("✅ Initializing ensemble extractor...")
        extractor = EnsembleSkillExtractor(config)
        
        # Sample text
        sample_text = """
        Senior Software Engineer with 8+ years experience in Python, JavaScript, and React.
        Expert in machine learning using TensorFlow and PyTorch. Proficient in AWS cloud services,
        Docker containerization, and Kubernetes orchestration. Strong background in data science
        with pandas, NumPy, and scikit-learn. Experience with databases including PostgreSQL,
        MongoDB, and Redis. Familiar with CI/CD pipelines using Jenkins and GitLab.
        """
        
        print("🎯 Extracting skills from sample text...")
        print("Sample text preview:", sample_text[:100] + "...")
        
        # Extract skills
        skills = extractor.ensemble_extract(sample_text)
        
        print(f"\n📊 Results: Found {len(skills)} skills")
        print("Top skills (by confidence):")
        
        for i, skill in enumerate(skills[:10], 1):
            print(f"{i:2d}. {skill.skill:<20} (confidence: {skill.confidence:.3f}, method: {skill.method})")
        
        # Demo individual methods
        print(f"\n🔍 Comparing individual extraction methods:")
        
        spacy_skills = extractor.extract_skills_spacy(sample_text)
        fuzzy_skills = extractor.extract_skills_fuzzy(sample_text)
        
        print(f"SpaCy NER:     {len(spacy_skills)} skills")
        print(f"Fuzzy Match:   {len(fuzzy_skills)} skills")
        print(f"Ensemble:      {len(skills)} skills")
        
        # Demo feedback
        print(f"\n💬 Demonstrating feedback collection...")
        predicted_skills = [s.skill for s in skills[:5]]
        correct_skills = predicted_skills[:-1] + ['Git']  # Remove one, add one
        
        extractor.add_feedback(sample_text, predicted_skills, correct_skills, "demo_user")
        print(f"Feedback submitted: {len(correct_skills)} correct skills")
        
        # Statistics
        stats = extractor.get_skill_statistics()
        print(f"\n📈 System Statistics:")
        print(f"Reference skills: {stats['total_reference_skills']}")
        print(f"Feedback entries: {stats['feedback_entries']}")
        print(f"Min confidence: {stats['current_config']['min_confidence']}")
        
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("Install missing dependencies with:")
        print("pip install scikit-learn sentence-transformers fuzzywuzzy python-levenshtein")
        return False
    except Exception as e:
        print(f"❌ Error during extraction: {e}")
        return False

def demo_ab_testing():
    """Demo A/B testing framework"""
    print("\n" + "=" * 60)
    print("🧪 A/B Testing Framework Demo")
    print("=" * 60)
    
    try:
        from ab_testing_framework import ABTestManager, TestVariant, TestMetrics
        import random
        
        # Initialize A/B test manager
        ab_manager = ABTestManager("demo_ab_tests.json")
        
        # Create test variants
        control_variant = TestVariant(
            variant_id="control_baseline",
            name="Baseline Configuration",
            description="Current production config",
            config={
                'spacy_weight': 0.3,
                'fuzzy_weight': 0.2,
                'tfidf_weight': 0.25,
                'embedding_weight': 0.25
            },
            traffic_percentage=50.0,
            is_control=True
        )
        
        test_variant = TestVariant(
            variant_id="embedding_focused",
            name="Embedding-Focused Config", 
            description="Higher weight on semantic embeddings",
            config={
                'spacy_weight': 0.2,
                'fuzzy_weight': 0.1,
                'tfidf_weight': 0.2,
                'embedding_weight': 0.5
            },
            traffic_percentage=50.0,
            is_control=False
        )
        
        # Create test
        test_id = ab_manager.create_test(
            name="Embedding Weight Optimization",
            description="Test higher embedding weights vs baseline",
            variants=[control_variant, test_variant],
            duration_days=14,
            target_metric="f1_score",
            minimum_sample_size=50
        )
        
        print(f"✅ Created A/B test: {test_id}")
        
        # Start test
        ab_manager.start_test(test_id)
        print("✅ Test started")
        
        # Simulate user assignments and metrics
        print("📊 Simulating user interactions...")
        
        for i in range(100):
            user_id = f"user_{i}"
            variant_id = ab_manager.assign_user_to_variant(user_id, test_id)
            
            # Simulate metrics (in real usage, these come from actual extraction performance)
            if variant_id == "control_baseline":
                # Baseline performance
                metrics = TestMetrics(
                    precision=random.uniform(0.80, 0.88),
                    recall=random.uniform(0.75, 0.83),
                    f1_score=random.uniform(0.77, 0.85),
                    extraction_time=random.uniform(0.5, 1.2),
                    user_satisfaction=random.uniform(3.8, 4.3),
                    total_extractions=random.randint(5, 15)
                )
            else:
                # Test variant (slightly better semantic understanding)
                metrics = TestMetrics(
                    precision=random.uniform(0.82, 0.92),
                    recall=random.uniform(0.78, 0.88),
                    f1_score=random.uniform(0.80, 0.90),
                    extraction_time=random.uniform(0.8, 1.5),  # Slightly slower
                    user_satisfaction=random.uniform(4.0, 4.6),
                    total_extractions=random.randint(6, 18)
                )
            
            ab_manager.record_metrics(test_id, variant_id, metrics)
        
        # Get results
        results = ab_manager.get_test_results(test_id)
        
        print(f"\n📈 A/B Test Results:")
        print(f"Test: {results['test_info']['name']}")
        
        for variant_id, variant_data in results['variants'].items():
            variant_info = variant_data['variant_info']
            variant_results = variant_data['results']
            
            print(f"\nVariant: {variant_info['name']}")
            print(f"  Sample size: {variant_results['sample_size']}")
            
            if variant_results['metrics']:
                print(f"  F1-Score: {variant_results['metrics']['f1_score']['mean']:.3f}")
                print(f"  Precision: {variant_results['metrics']['precision']['mean']:.3f}")
                print(f"  Recall: {variant_results['metrics']['recall']['mean']:.3f}")
                print(f"  Extraction time: {variant_results['metrics']['extraction_time']['mean']:.3f}s")
        
        # Statistical significance
        if 'statistical_significance' in results:
            print(f"\n🔬 Statistical Significance:")
            for variant_id, stats in results['statistical_significance'].items():
                print(f"Variant {variant_id}:")
                print(f"  Improvement: {stats['improvement_percent']:.1f}%")
                print(f"  P-value: {stats['p_value']:.4f}")
                print(f"  Significant: {'✅' if stats['is_significant'] else '❌'}")
        
        # Recommendations
        if results['recommendations']:
            print(f"\n💡 Recommendations:")
            for rec in results['recommendations']:
                print(f"  {rec}")
        
        return True
        
    except Exception as e:
        print(f"❌ A/B testing demo failed: {e}")
        return False

def main():
    """Run all demos"""
    print("🚀 Enhanced Skill Extraction System Demo")
    print("This demo showcases the ensemble approach with A/B testing")
    print("=" * 60)
    
    # Run extraction demo
    extraction_success = demo_basic_extraction()
    
    # Run A/B testing demo
    ab_testing_success = demo_ab_testing()
    
    print("\n" + "=" * 60)
    print("📋 Demo Summary:")
    print(f"✅ Basic Extraction: {'Success' if extraction_success else 'Failed'}")
    print(f"✅ A/B Testing: {'Success' if ab_testing_success else 'Failed'}")
    
    if extraction_success and ab_testing_success:
        print("\n🎉 All demos completed successfully!")
        print("\nNext steps:")
        print("1. Install dependencies: pip install -r requirements.txt")
        print("2. Run dashboard: streamlit run skill_extraction_dashboard.py")
        print("3. Integrate with your application using enhanced_resume_parser.py")
    else:
        print("\n⚠️  Some demos failed - check dependencies and error messages above")
    
    print("\n📚 See README.md for detailed documentation")

if __name__ == "__main__":
    main()