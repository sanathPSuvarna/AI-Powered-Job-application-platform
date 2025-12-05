"""
A/B Testing Framework for Skill Extraction Models
Supports continuous monitoring and performance comparison
"""

import json
import random
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
import statistics
from collections import defaultdict

class TestStatus(Enum):
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    DRAFT = "draft"

@dataclass
class TestVariant:
    """A/B test variant configuration"""
    variant_id: str
    name: str
    description: str
    config: Dict
    traffic_percentage: float
    is_control: bool = False

@dataclass
class TestMetrics:
    """Metrics for A/B test evaluation"""
    precision: float
    recall: float
    f1_score: float
    extraction_time: float
    user_satisfaction: float
    total_extractions: int
    
    def to_dict(self) -> Dict:
        return asdict(self)

@dataclass
class ABTest:
    """A/B test configuration and state"""
    test_id: str
    name: str
    description: str
    variants: List[TestVariant]
    start_date: datetime
    end_date: datetime
    status: TestStatus
    target_metric: str
    minimum_sample_size: int
    confidence_level: float = 0.95
    power: float = 0.8
    created_by: str = "system"
    
    def to_dict(self) -> Dict:
        return {
            'test_id': self.test_id,
            'name': self.name,
            'description': self.description,
            'variants': [asdict(v) for v in self.variants],
            'start_date': self.start_date.isoformat(),
            'end_date': self.end_date.isoformat(),
            'status': self.status.value,
            'target_metric': self.target_metric,
            'minimum_sample_size': self.minimum_sample_size,
            'confidence_level': self.confidence_level,
            'power': self.power,
            'created_by': self.created_by
        }

class ABTestManager:
    """Manages A/B tests for skill extraction models"""
    
    def __init__(self, storage_path: str = "ab_tests.json"):
        self.storage_path = storage_path
        self.tests: Dict[str, ABTest] = {}
        self.test_results: Dict[str, Dict[str, List[TestMetrics]]] = defaultdict(lambda: defaultdict(list))
        self.user_assignments: Dict[str, Dict[str, str]] = defaultdict(dict)  # user_id -> test_id -> variant_id
        self.load_tests()
    
    def create_test(self, 
                   name: str,
                   description: str,
                   variants: List[TestVariant],
                   duration_days: int = 14,
                   target_metric: str = "f1_score",
                   minimum_sample_size: int = 100) -> str:
        """Create a new A/B test"""
        
        # Validate variants
        total_traffic = sum(v.traffic_percentage for v in variants)
        if abs(total_traffic - 100.0) > 0.01:
            raise ValueError(f"Variant traffic percentages must sum to 100%, got {total_traffic}%")
        
        control_variants = [v for v in variants if v.is_control]
        if len(control_variants) != 1:
            raise ValueError("Exactly one variant must be marked as control")
        
        test_id = str(uuid.uuid4())
        start_date = datetime.now()
        end_date = start_date + timedelta(days=duration_days)
        
        test = ABTest(
            test_id=test_id,
            name=name,
            description=description,
            variants=variants,
            start_date=start_date,
            end_date=end_date,
            status=TestStatus.DRAFT,
            target_metric=target_metric,
            minimum_sample_size=minimum_sample_size
        )
        
        self.tests[test_id] = test
        self.save_tests()
        
        return test_id
    
    def start_test(self, test_id: str) -> bool:
        """Start an A/B test"""
        if test_id not in self.tests:
            return False
        
        test = self.tests[test_id]
        if test.status != TestStatus.DRAFT:
            return False
        
        test.status = TestStatus.ACTIVE
        test.start_date = datetime.now()
        self.save_tests()
        
        return True
    
    def pause_test(self, test_id: str) -> bool:
        """Pause an active A/B test"""
        if test_id not in self.tests:
            return False
        
        test = self.tests[test_id]
        if test.status != TestStatus.ACTIVE:
            return False
        
        test.status = TestStatus.PAUSED
        self.save_tests()
        
        return True
    
    def complete_test(self, test_id: str) -> bool:
        """Complete an A/B test"""
        if test_id not in self.tests:
            return False
        
        test = self.tests[test_id]
        if test.status not in [TestStatus.ACTIVE, TestStatus.PAUSED]:
            return False
        
        test.status = TestStatus.COMPLETED
        test.end_date = datetime.now()
        self.save_tests()
        
        return True
    
    def assign_user_to_variant(self, user_id: str, test_id: str) -> Optional[str]:
        """Assign user to a test variant using weighted random selection"""
        if test_id not in self.tests:
            return None
        
        test = self.tests[test_id]
        if test.status != TestStatus.ACTIVE:
            return None
        
        # Check if user already assigned
        if test_id in self.user_assignments[user_id]:
            return self.user_assignments[user_id][test_id]
        
        # Weighted random assignment
        rand_val = random.uniform(0, 100)
        cumulative = 0
        
        for variant in test.variants:
            cumulative += variant.traffic_percentage
            if rand_val <= cumulative:
                self.user_assignments[user_id][test_id] = variant.variant_id
                return variant.variant_id
        
        # Fallback to first variant
        return test.variants[0].variant_id
    
    def get_user_config(self, user_id: str, test_id: str) -> Optional[Dict]:
        """Get configuration for user's assigned variant"""
        variant_id = self.assign_user_to_variant(user_id, test_id)
        if not variant_id:
            return None
        
        test = self.tests[test_id]
        variant = next((v for v in test.variants if v.variant_id == variant_id), None)
        
        return variant.config if variant else None
    
    def record_metrics(self, test_id: str, variant_id: str, metrics: TestMetrics):
        """Record metrics for a test variant"""
        self.test_results[test_id][variant_id].append(metrics)
    
    def get_test_results(self, test_id: str) -> Dict:
        """Get comprehensive test results"""
        if test_id not in self.tests:
            return {}
        
        test = self.tests[test_id]
        results = {
            'test_info': test.to_dict(),
            'variants': {},
            'statistical_significance': {},
            'recommendations': []
        }
        
        # Calculate metrics for each variant
        for variant in test.variants:
            variant_metrics = self.test_results[test_id][variant.variant_id]
            
            if variant_metrics:
                variant_results = {
                    'sample_size': len(variant_metrics),
                    'metrics': {
                        'precision': {
                            'mean': statistics.mean(m.precision for m in variant_metrics),
                            'std': statistics.stdev(m.precision for m in variant_metrics) if len(variant_metrics) > 1 else 0
                        },
                        'recall': {
                            'mean': statistics.mean(m.recall for m in variant_metrics),
                            'std': statistics.stdev(m.recall for m in variant_metrics) if len(variant_metrics) > 1 else 0
                        },
                        'f1_score': {
                            'mean': statistics.mean(m.f1_score for m in variant_metrics),
                            'std': statistics.stdev(m.f1_score for m in variant_metrics) if len(variant_metrics) > 1 else 0
                        },
                        'extraction_time': {
                            'mean': statistics.mean(m.extraction_time for m in variant_metrics),
                            'std': statistics.stdev(m.extraction_time for m in variant_metrics) if len(variant_metrics) > 1 else 0
                        },
                        'user_satisfaction': {
                            'mean': statistics.mean(m.user_satisfaction for m in variant_metrics),
                            'std': statistics.stdev(m.user_satisfaction for m in variant_metrics) if len(variant_metrics) > 1 else 0
                        }
                    }
                }
            else:
                variant_results = {
                    'sample_size': 0,
                    'metrics': {}
                }
            
            results['variants'][variant.variant_id] = {
                'variant_info': asdict(variant),
                'results': variant_results
            }
        
        # Statistical significance testing
        if len(test.variants) >= 2:
            results['statistical_significance'] = self._calculate_statistical_significance(
                test_id, test.target_metric, test.confidence_level
            )
        
        # Generate recommendations
        results['recommendations'] = self._generate_recommendations(test_id, results)
        
        return results
    
    def _calculate_statistical_significance(self, test_id: str, target_metric: str, confidence_level: float) -> Dict:
        """Calculate statistical significance between variants"""
        # Simplified implementation - in production use proper statistical tests
        test = self.tests[test_id]
        control_variant = next(v for v in test.variants if v.is_control)
        
        control_metrics = self.test_results[test_id][control_variant.variant_id]
        if not control_metrics:
            return {'error': 'No control metrics available'}
        
        control_values = [getattr(m, target_metric) for m in control_metrics]
        control_mean = statistics.mean(control_values)
        
        significance_results = {}
        
        for variant in test.variants:
            if variant.is_control:
                continue
            
            variant_metrics = self.test_results[test_id][variant.variant_id]
            if not variant_metrics:
                continue
            
            variant_values = [getattr(m, target_metric) for m in variant_metrics]
            variant_mean = statistics.mean(variant_values)
            
            # Simplified significance calculation
            improvement = (variant_mean - control_mean) / control_mean * 100
            
            # Mock p-value calculation (use proper statistical tests in production)
            sample_size = len(variant_metrics)
            mock_p_value = max(0.001, 0.5 / (sample_size ** 0.5))  # Simplified
            
            is_significant = mock_p_value < (1 - confidence_level)
            
            significance_results[variant.variant_id] = {
                'improvement_percent': improvement,
                'p_value': mock_p_value,
                'is_significant': is_significant,
                'sample_size': sample_size,
                'control_mean': control_mean,
                'variant_mean': variant_mean
            }
        
        return significance_results
    
    def _generate_recommendations(self, test_id: str, results: Dict) -> List[str]:
        """Generate recommendations based on test results"""
        recommendations = []
        
        test = self.tests[test_id]
        
        # Check sample sizes
        min_sample_reached = all(
            variant_data['results']['sample_size'] >= test.minimum_sample_size
            for variant_data in results['variants'].values()
        )
        
        if not min_sample_reached:
            recommendations.append(
                f"⚠️ Continue test - minimum sample size ({test.minimum_sample_size}) not reached for all variants"
            )
            return recommendations
        
        # Check for clear winner
        if 'statistical_significance' in results:
            significant_improvements = [
                (variant_id, data)
                for variant_id, data in results['statistical_significance'].items()
                if data.get('is_significant', False) and data.get('improvement_percent', 0) > 0
            ]
            
            if significant_improvements:
                best_variant = max(significant_improvements, key=lambda x: x[1]['improvement_percent'])
                recommendations.append(
                    f"🏆 Deploy variant {best_variant[0]} - shows {best_variant[1]['improvement_percent']:.1f}% improvement"
                )
            else:
                recommendations.append(
                    "📊 No statistically significant improvement found - consider keeping control variant"
                )
        
        # Performance recommendations
        variant_f1_scores = {}
        for variant_id, variant_data in results['variants'].items():
            if variant_data['results'].get('metrics', {}).get('f1_score'):
                variant_f1_scores[variant_id] = variant_data['results']['metrics']['f1_score']['mean']
        
        if variant_f1_scores:
            best_f1_variant = max(variant_f1_scores.items(), key=lambda x: x[1])
            recommendations.append(
                f"📈 Highest F1-score: Variant {best_f1_variant[0]} ({best_f1_variant[1]:.3f})"
            )
        
        return recommendations
    
    def get_active_tests(self) -> List[ABTest]:
        """Get all active tests"""
        return [test for test in self.tests.values() if test.status == TestStatus.ACTIVE]
    
    def save_tests(self):
        """Save tests to storage"""
        data = {
            'tests': {test_id: test.to_dict() for test_id, test in self.tests.items()},
            'user_assignments': dict(self.user_assignments),
            'test_results': {
                test_id: {
                    variant_id: [m.to_dict() for m in metrics]
                    for variant_id, metrics in variants.items()
                }
                for test_id, variants in self.test_results.items()
            }
        }
        
        with open(self.storage_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def load_tests(self):
        """Load tests from storage"""
        try:
            with open(self.storage_path, 'r') as f:
                data = json.load(f)
            
            # Load tests
            for test_id, test_data in data.get('tests', {}).items():
                variants = [TestVariant(**v) for v in test_data['variants']]
                test_data['variants'] = variants
                test_data['start_date'] = datetime.fromisoformat(test_data['start_date'])
                test_data['end_date'] = datetime.fromisoformat(test_data['end_date'])
                test_data['status'] = TestStatus(test_data['status'])
                
                self.tests[test_id] = ABTest(**test_data)
            
            # Load user assignments
            self.user_assignments = defaultdict(dict, data.get('user_assignments', {}))
            
            # Load test results
            for test_id, variants in data.get('test_results', {}).items():
                for variant_id, metrics_list in variants.items():
                    self.test_results[test_id][variant_id] = [
                        TestMetrics(**m) for m in metrics_list
                    ]
        
        except FileNotFoundError:
            pass  # No existing data
        except Exception as e:
            print(f"Error loading tests: {e}")

# Example usage and utility functions
def create_ensemble_comparison_test(ab_manager: ABTestManager) -> str:
    """Create an A/B test comparing ensemble configurations"""
    
    # Control: Current ensemble configuration
    control_variant = TestVariant(
        variant_id="control_current",
        name="Current Ensemble",
        description="Current ensemble configuration",
        config={
            'spacy_weight': 0.3,
            'fuzzy_weight': 0.2,
            'tfidf_weight': 0.25,
            'embedding_weight': 0.25,
            'min_confidence': 0.6
        },
        traffic_percentage=50.0,
        is_control=True
    )
    
    # Test: Embedding-heavy configuration
    test_variant = TestVariant(
        variant_id="embedding_heavy",
        name="Embedding-Heavy Ensemble",
        description="Configuration favoring semantic embeddings",
        config={
            'spacy_weight': 0.2,
            'fuzzy_weight': 0.1,
            'tfidf_weight': 0.2,
            'embedding_weight': 0.5,
            'min_confidence': 0.7
        },
        traffic_percentage=50.0,
        is_control=False
    )
    
    return ab_manager.create_test(
        name="Ensemble Weight Optimization",
        description="Compare current ensemble vs embedding-heavy configuration",
        variants=[control_variant, test_variant],
        duration_days=21,
        target_metric="f1_score",
        minimum_sample_size=200
    )

def simulate_test_metrics() -> TestMetrics:
    """Simulate test metrics for demonstration"""
    return TestMetrics(
        precision=random.uniform(0.7, 0.95),
        recall=random.uniform(0.65, 0.9),
        f1_score=random.uniform(0.7, 0.92),
        extraction_time=random.uniform(0.1, 2.0),
        user_satisfaction=random.uniform(3.0, 5.0),
        total_extractions=random.randint(10, 100)
    )

def main():
    """Example usage of A/B testing framework"""
    ab_manager = ABTestManager()
    
    # Create a test
    test_id = create_ensemble_comparison_test(ab_manager)
    print(f"Created test: {test_id}")
    
    # Start the test
    ab_manager.start_test(test_id)
    print("Test started")
    
    # Simulate some users and metrics
    for user_id in [f"user_{i}" for i in range(100)]:
        variant_id = ab_manager.assign_user_to_variant(user_id, test_id)
        
        # Simulate metrics collection
        metrics = simulate_test_metrics()
        ab_manager.record_metrics(test_id, variant_id, metrics)
    
    # Get results
    results = ab_manager.get_test_results(test_id)
    print("\nTest Results:")
    print(json.dumps(results, indent=2, default=str))

if __name__ == "__main__":
    main()