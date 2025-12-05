#!/usr/bin/env python3
"""
Comprehensive Performance Testing with Confusion Matrix
Tests ensemble skill extraction system on large resume dataset
Generates detailed metrics, confusion matrices, and visualizations
"""

import sys
import os
import json
import time
from typing import List, Dict, Tuple
import numpy as np
import pandas as pd
from collections import defaultdict, Counter
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import (
    confusion_matrix, classification_report, precision_recall_fscore_support,
    accuracy_score, roc_curve, auc, precision_recall_curve
)

# Add current directory to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURRENT_DIR)

try:
    from ensemble_skill_extractor import EnsembleSkillExtractor
except ImportError as e:
    print(f"❌ Import error: {e}")
    sys.exit(1)

class PerformanceTester:
    def __init__(self, resume_file: str = 'generated_resumes_4000.json'):
        """Initialize performance tester"""
        self.resume_file = resume_file
        self.extractor = EnsembleSkillExtractor()
        self.results = []
        self.metrics = {}
        
    def load_resumes(self) -> List[Dict]:
        """Load generated resumes"""
        print(f"📂 Loading resumes from {self.resume_file}...")
        try:
            with open(self.resume_file, 'r', encoding='utf-8') as f:
                resumes = json.load(f)
            print(f"✅ Loaded {len(resumes)} resumes")
            return resumes
        except FileNotFoundError:
            print(f"❌ File not found: {self.resume_file}")
            print("Please run generate_test_resumes.py first")
            sys.exit(1)
    
    def resume_to_text(self, resume: Dict) -> str:
        """Convert resume JSON to text format"""
        text_parts = []
        
        # Header
        text_parts.append(f"{resume['name']}")
        text_parts.append(f"{resume['email']} | {resume['phone']}")
        text_parts.append("")
        
        # Summary
        text_parts.append("PROFESSIONAL SUMMARY")
        text_parts.append(resume['summary'])
        text_parts.append("")
        
        # Skills
        text_parts.append("TECHNICAL SKILLS")
        text_parts.append(", ".join(resume['skills']))
        text_parts.append("")
        
        # Experience
        if resume['experience']:
            text_parts.append("WORK EXPERIENCE")
            for exp in resume['experience']:
                text_parts.append(f"{exp['title']} at {exp['company']}")
                text_parts.append(f"{exp['start_date']} - {exp['end_date']}")
                # Add skill mentions in experience
                mentioned_skills = [s for s in resume['skills'] if len(s) > 3][:5]
                text_parts.append(f"• Worked with {', '.join(mentioned_skills)}")
                text_parts.append("")
        
        # Education
        if resume['education']:
            text_parts.append("EDUCATION")
            for edu in resume['education']:
                text_parts.append(f"{edu['degree']}, {edu['university']} ({edu['year']})")
                if 'gpa' in edu:
                    text_parts.append(f"GPA: {edu['gpa']}")
            text_parts.append("")
        
        # Certifications
        if resume['certifications']:
            text_parts.append("CERTIFICATIONS")
            text_parts.append(", ".join(resume['certifications']))
        
        return "\n".join(text_parts)
    
    def test_single_resume(self, resume: Dict) -> Dict:
        """Test extraction on single resume"""
        text = self.resume_to_text(resume)
        ground_truth = set(s.lower() for s in resume['skills'])
        
        start_time = time.time()
        extracted_skills = self.extractor.ensemble_extract(text)
        extraction_time = time.time() - start_time
        
        predicted = set(s.skill.lower() for s in extracted_skills)
        
        # Calculate metrics
        true_positives = len(ground_truth & predicted)
        false_positives = len(predicted - ground_truth)
        false_negatives = len(ground_truth - predicted)
        true_negatives = 0  # Not applicable for this scenario
        
        precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
        recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
        f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
        
        result = {
            'resume_id': resume['id'],
            'experience_level': resume['experience_level'],
            'ground_truth_count': len(ground_truth),
            'predicted_count': len(predicted),
            'true_positives': true_positives,
            'false_positives': false_positives,
            'false_negatives': false_negatives,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'extraction_time': extraction_time,
            'ground_truth': list(ground_truth),
            'predicted': list(predicted),
            'correctly_extracted': list(ground_truth & predicted),
            'missed_skills': list(ground_truth - predicted),
            'false_positives_list': list(predicted - ground_truth)
        }
        
        return result
    
    def test_all_resumes(self, resumes: List[Dict], sample_size: int = None):
        """Test extraction on all resumes"""
        if sample_size:
            import random
            resumes = random.sample(resumes, min(sample_size, len(resumes)))
        
        total = len(resumes)
        print(f"\n🧪 Testing ensemble extraction on {total} resumes...")
        
        for i, resume in enumerate(resumes):
            result = self.test_single_resume(resume)
            self.results.append(result)
            
            if (i + 1) % 100 == 0:
                print(f"  ✓ Tested {i + 1}/{total} resumes ({(i+1)/total*100:.1f}%)")
        
        print(f"✅ Testing complete!")
    
    def calculate_aggregate_metrics(self):
        """Calculate overall performance metrics"""
        print("\n📊 Calculating aggregate metrics...")
        
        # Overall metrics
        total_tp = sum(r['true_positives'] for r in self.results)
        total_fp = sum(r['false_positives'] for r in self.results)
        total_fn = sum(r['false_negatives'] for r in self.results)
        
        overall_precision = total_tp / (total_tp + total_fp) if (total_tp + total_fp) > 0 else 0
        overall_recall = total_tp / (total_tp + total_fn) if (total_tp + total_fn) > 0 else 0
        overall_f1 = 2 * (overall_precision * overall_recall) / (overall_precision + overall_recall) if (overall_precision + overall_recall) > 0 else 0
        
        # Per-resume averages
        avg_precision = np.mean([r['precision'] for r in self.results])
        avg_recall = np.mean([r['recall'] for r in self.results])
        avg_f1 = np.mean([r['f1_score'] for r in self.results])
        avg_time = np.mean([r['extraction_time'] for r in self.results])
        
        # By experience level
        level_metrics = {}
        for level in ['junior', 'mid', 'senior', 'lead']:
            level_results = [r for r in self.results if r['experience_level'] == level]
            if level_results:
                level_metrics[level] = {
                    'count': len(level_results),
                    'avg_precision': np.mean([r['precision'] for r in level_results]),
                    'avg_recall': np.mean([r['recall'] for r in level_results]),
                    'avg_f1': np.mean([r['f1_score'] for r in level_results]),
                    'avg_extraction_time': np.mean([r['extraction_time'] for r in level_results])
                }
        
        self.metrics = {
            'overall': {
                'total_resumes': len(self.results),
                'total_true_positives': total_tp,
                'total_false_positives': total_fp,
                'total_false_negatives': total_fn,
                'overall_precision': overall_precision,
                'overall_recall': overall_recall,
                'overall_f1': overall_f1,
                'avg_precision_per_resume': avg_precision,
                'avg_recall_per_resume': avg_recall,
                'avg_f1_per_resume': avg_f1,
                'avg_extraction_time': avg_time,
                'total_extraction_time': sum(r['extraction_time'] for r in self.results)
            },
            'by_experience_level': level_metrics
        }
        
        return self.metrics
    
    def print_metrics_summary(self):
        """Print formatted metrics summary"""
        print("\n" + "="*80)
        print("📈 PERFORMANCE METRICS SUMMARY")
        print("="*80)
        
        overall = self.metrics['overall']
        print(f"\n🎯 Overall Performance:")
        print(f"  Total Resumes Tested:     {overall['total_resumes']}")
        print(f"  Total True Positives:     {overall['total_true_positives']}")
        print(f"  Total False Positives:    {overall['total_false_positives']}")
        print(f"  Total False Negatives:    {overall['total_false_negatives']}")
        print(f"\n  Overall Precision:        {overall['overall_precision']:.3f} ({overall['overall_precision']*100:.1f}%)")
        print(f"  Overall Recall:           {overall['overall_recall']:.3f} ({overall['overall_recall']*100:.1f}%)")
        print(f"  Overall F1-Score:         {overall['overall_f1']:.3f} ({overall['overall_f1']*100:.1f}%)")
        print(f"\n  Avg Precision per Resume: {overall['avg_precision_per_resume']:.3f}")
        print(f"  Avg Recall per Resume:    {overall['avg_recall_per_resume']:.3f}")
        print(f"  Avg F1-Score per Resume:  {overall['avg_f1_per_resume']:.3f}")
        print(f"\n⚡ Performance:")
        print(f"  Avg Extraction Time:      {overall['avg_extraction_time']:.3f}s per resume")
        print(f"  Total Processing Time:    {overall['total_extraction_time']:.2f}s")
        print(f"  Throughput:               {overall['total_resumes']/overall['total_extraction_time']:.2f} resumes/second")
        
        print(f"\n📊 Performance by Experience Level:")
        for level, metrics in self.metrics['by_experience_level'].items():
            print(f"\n  {level.upper()}:")
            print(f"    Count:      {metrics['count']}")
            print(f"    Precision:  {metrics['avg_precision']:.3f}")
            print(f"    Recall:     {metrics['avg_recall']:.3f}")
            print(f"    F1-Score:   {metrics['avg_f1']:.3f}")
            print(f"    Avg Time:   {metrics['avg_extraction_time']:.3f}s")
    
    def generate_confusion_matrices(self, output_dir: str = 'performance_results'):
        """Generate confusion matrices and visualizations"""
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\n📊 Generating confusion matrices and visualizations...")
        
        # 1. Overall Binary Confusion Matrix
        y_true_binary = []
        y_pred_binary = []
        
        for result in self.results:
            # For each skill in ground truth
            for skill in result['ground_truth']:
                y_true_binary.append(1)  # True label: skill exists
                y_pred_binary.append(1 if skill in result['predicted'] else 0)
            
            # For each false positive
            for skill in result['false_positives_list']:
                y_true_binary.append(0)  # True label: skill doesn't exist
                y_pred_binary.append(1)  # Predicted: skill exists
        
        cm = confusion_matrix(y_true_binary, y_pred_binary)
        
        # Plot confusion matrix
        plt.figure(figsize=(10, 8))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Not a Skill', 'Is a Skill'],
                   yticklabels=['Not a Skill', 'Is a Skill'])
        plt.title('Overall Confusion Matrix\n(Binary Classification: Skill vs Non-Skill)', fontsize=14, fontweight='bold')
        plt.ylabel('True Label', fontsize=12)
        plt.xlabel('Predicted Label', fontsize=12)
        plt.tight_layout()
        plt.savefig(f'{output_dir}/confusion_matrix_overall.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"  ✓ Saved overall confusion matrix")
        
        # 2. Confusion Matrix by Experience Level
        fig, axes = plt.subplots(2, 2, figsize=(16, 14))
        axes = axes.flatten()
        
        for idx, level in enumerate(['junior', 'mid', 'senior', 'lead']):
            level_results = [r for r in self.results if r['experience_level'] == level]
            
            y_true = []
            y_pred = []
            
            for result in level_results:
                for skill in result['ground_truth']:
                    y_true.append(1)
                    y_pred.append(1 if skill in result['predicted'] else 0)
                for skill in result['false_positives_list']:
                    y_true.append(0)
                    y_pred.append(1)
            
            cm_level = confusion_matrix(y_true, y_pred)
            
            sns.heatmap(cm_level, annot=True, fmt='d', cmap='Blues', ax=axes[idx],
                       xticklabels=['Not a Skill', 'Is a Skill'],
                       yticklabels=['Not a Skill', 'Is a Skill'])
            axes[idx].set_title(f'{level.upper()} Level\n({len(level_results)} resumes)', 
                               fontsize=12, fontweight='bold')
            axes[idx].set_ylabel('True Label', fontsize=10)
            axes[idx].set_xlabel('Predicted Label', fontsize=10)
        
        plt.suptitle('Confusion Matrices by Experience Level', fontsize=16, fontweight='bold', y=0.995)
        plt.tight_layout()
        plt.savefig(f'{output_dir}/confusion_matrix_by_level.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"  ✓ Saved confusion matrices by experience level")
        
        # 3. Performance Metrics Comparison
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        
        levels = ['junior', 'mid', 'senior', 'lead']
        precisions = [self.metrics['by_experience_level'][l]['avg_precision'] for l in levels]
        recalls = [self.metrics['by_experience_level'][l]['avg_recall'] for l in levels]
        f1_scores = [self.metrics['by_experience_level'][l]['avg_f1'] for l in levels]
        times = [self.metrics['by_experience_level'][l]['avg_extraction_time'] for l in levels]
        
        # Precision
        axes[0, 0].bar(levels, precisions, color='#2E86AB')
        axes[0, 0].set_title('Precision by Experience Level', fontweight='bold')
        axes[0, 0].set_ylabel('Precision')
        axes[0, 0].set_ylim(0, 1)
        for i, v in enumerate(precisions):
            axes[0, 0].text(i, v + 0.02, f'{v:.3f}', ha='center', fontweight='bold')
        
        # Recall
        axes[0, 1].bar(levels, recalls, color='#A23B72')
        axes[0, 1].set_title('Recall by Experience Level', fontweight='bold')
        axes[0, 1].set_ylabel('Recall')
        axes[0, 1].set_ylim(0, 1)
        for i, v in enumerate(recalls):
            axes[0, 1].text(i, v + 0.02, f'{v:.3f}', ha='center', fontweight='bold')
        
        # F1-Score
        axes[1, 0].bar(levels, f1_scores, color='#F18F01')
        axes[1, 0].set_title('F1-Score by Experience Level', fontweight='bold')
        axes[1, 0].set_ylabel('F1-Score')
        axes[1, 0].set_ylim(0, 1)
        for i, v in enumerate(f1_scores):
            axes[1, 0].text(i, v + 0.02, f'{v:.3f}', ha='center', fontweight='bold')
        
        # Extraction Time
        axes[1, 1].bar(levels, times, color='#6A994E')
        axes[1, 1].set_title('Avg Extraction Time by Experience Level', fontweight='bold')
        axes[1, 1].set_ylabel('Time (seconds)')
        for i, v in enumerate(times):
            axes[1, 1].text(i, v + 0.01, f'{v:.3f}s', ha='center', fontweight='bold')
        
        plt.suptitle('Performance Metrics Comparison', fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.savefig(f'{output_dir}/metrics_comparison.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"  ✓ Saved metrics comparison")
        
        # 4. Distribution plots
        fig, axes = plt.subplots(2, 2, figsize=(16, 12))
        
        precisions_all = [r['precision'] for r in self.results]
        recalls_all = [r['recall'] for r in self.results]
        f1_scores_all = [r['f1_score'] for r in self.results]
        times_all = [r['extraction_time'] for r in self.results]
        
        axes[0, 0].hist(precisions_all, bins=30, color='#2E86AB', alpha=0.7, edgecolor='black')
        axes[0, 0].set_title('Precision Distribution', fontweight='bold')
        axes[0, 0].set_xlabel('Precision')
        axes[0, 0].set_ylabel('Frequency')
        axes[0, 0].axvline(np.mean(precisions_all), color='red', linestyle='--', label=f'Mean: {np.mean(precisions_all):.3f}')
        axes[0, 0].legend()
        
        axes[0, 1].hist(recalls_all, bins=30, color='#A23B72', alpha=0.7, edgecolor='black')
        axes[0, 1].set_title('Recall Distribution', fontweight='bold')
        axes[0, 1].set_xlabel('Recall')
        axes[0, 1].set_ylabel('Frequency')
        axes[0, 1].axvline(np.mean(recalls_all), color='red', linestyle='--', label=f'Mean: {np.mean(recalls_all):.3f}')
        axes[0, 1].legend()
        
        axes[1, 0].hist(f1_scores_all, bins=30, color='#F18F01', alpha=0.7, edgecolor='black')
        axes[1, 0].set_title('F1-Score Distribution', fontweight='bold')
        axes[1, 0].set_xlabel('F1-Score')
        axes[1, 0].set_ylabel('Frequency')
        axes[1, 0].axvline(np.mean(f1_scores_all), color='red', linestyle='--', label=f'Mean: {np.mean(f1_scores_all):.3f}')
        axes[1, 0].legend()
        
        axes[1, 1].hist(times_all, bins=30, color='#6A994E', alpha=0.7, edgecolor='black')
        axes[1, 1].set_title('Extraction Time Distribution', fontweight='bold')
        axes[1, 1].set_xlabel('Time (seconds)')
        axes[1, 1].set_ylabel('Frequency')
        axes[1, 1].axvline(np.mean(times_all), color='red', linestyle='--', label=f'Mean: {np.mean(times_all):.3f}s')
        axes[1, 1].legend()
        
        plt.suptitle('Performance Distributions', fontsize=16, fontweight='bold')
        plt.tight_layout()
        plt.savefig(f'{output_dir}/performance_distributions.png', dpi=300, bbox_inches='tight')
        plt.close()
        
        print(f"  ✓ Saved performance distributions")
        
        print(f"\n✅ All visualizations saved to: {output_dir}/")
    
    def save_detailed_results(self, output_dir: str = 'performance_results'):
        """Save detailed results to files"""
        os.makedirs(output_dir, exist_ok=True)
        
        print(f"\n💾 Saving detailed results...")
        
        # Save all results
        with open(f'{output_dir}/detailed_results.json', 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        print(f"  ✓ Saved detailed results")
        
        # Save metrics
        with open(f'{output_dir}/metrics_summary.json', 'w', encoding='utf-8') as f:
            json.dump(self.metrics, f, indent=2)
        print(f"  ✓ Saved metrics summary")
        
        # Save CSV for analysis
        df = pd.DataFrame(self.results)
        df.to_csv(f'{output_dir}/results.csv', index=False)
        print(f"  ✓ Saved results CSV")
        
        # Save commonly missed skills
        all_missed = []
        all_false_positives = []
        
        for result in self.results:
            all_missed.extend(result['missed_skills'])
            all_false_positives.extend(result['false_positives_list'])
        
        missed_counter = Counter(all_missed)
        fp_counter = Counter(all_false_positives)
        
        with open(f'{output_dir}/commonly_missed_skills.txt', 'w', encoding='utf-8') as f:
            f.write("Top 50 Most Commonly Missed Skills\n")
            f.write("="*50 + "\n\n")
            for skill, count in missed_counter.most_common(50):
                f.write(f"{skill}: {count} times\n")
        
        with open(f'{output_dir}/common_false_positives.txt', 'w', encoding='utf-8') as f:
            f.write("Top 50 Most Common False Positives\n")
            f.write("="*50 + "\n\n")
            for skill, count in fp_counter.most_common(50):
                f.write(f"{skill}: {count} times\n")
        
        print(f"  ✓ Saved error analysis")
        
        print(f"\n✅ All results saved to: {output_dir}/")

def main():
    """Main testing function"""
    print("="*80)
    print("🚀 ENSEMBLE SKILL EXTRACTION - COMPREHENSIVE PERFORMANCE TESTING")
    print("="*80)
    
    # Initialize tester
    tester = PerformanceTester('generated_resumes_4000.json')
    
    # Load resumes
    resumes = tester.load_resumes()
    
    # Test on sample or all
    sample_size = None  # Set to number for sampling, None for all
    if sample_size:
        print(f"\n⚠️ Testing on sample of {sample_size} resumes")
    
    # Run tests
    tester.test_all_resumes(resumes, sample_size=sample_size)
    
    # Calculate metrics
    tester.calculate_aggregate_metrics()
    
    # Print summary
    tester.print_metrics_summary()
    
    # Generate visualizations
    tester.generate_confusion_matrices()
    
    # Save results
    tester.save_detailed_results()
    
    print("\n" + "="*80)
    print("✅ TESTING COMPLETE!")
    print("="*80)
    print("\n📁 Check the 'performance_results' folder for:")
    print("  • Confusion matrices")
    print("  • Performance metrics comparisons")
    print("  • Detailed results (JSON & CSV)")
    print("  • Error analysis reports")

if __name__ == "__main__":
    main()