# Enhanced Skill Extraction System

A comprehensive ensemble-based skill extraction system that combines spaCy NER, fuzzy matching, TF-IDF, and semantic embeddings with weighted voting, active learning, and A/B testing capabilities.

## 🎯 Features

### Core Extraction Methods
- **spaCy NER**: Named Entity Recognition for skill identification
- **Fuzzy Matching**: Handles typos and variations in skill names
- **TF-IDF Similarity**: Document similarity for skill matching
- **Semantic Embeddings**: Deep semantic understanding using SentenceTransformers
- **Ensemble Voting**: Weighted combination of all methods

### Advanced Capabilities
- **Active Learning**: Human-in-the-loop feedback for continuous improvement
- **A/B Testing**: Compare different configurations in production
- **Skill Ontology**: Canonical skill mapping and alias management
- **Confidence Thresholds**: Configurable quality filters
- **Interactive Dashboard**: Real-time monitoring and feedback collection
- **Statistical Analysis**: Performance metrics and significance testing

## 🚀 Quick Start

### Installation

```bash
# Install dependencies
pip install -r requirements.txt

# Download spaCy model
python -m spacy download en_core_web_sm
```

### Basic Usage

```python
from ensemble_skill_extractor import EnsembleSkillExtractor

# Initialize extractor
extractor = EnsembleSkillExtractor()

# Extract skills from text
text = "Experienced Python developer with React and AWS expertise"
skills = extractor.ensemble_extract(text)

for skill in skills:
    print(f"{skill.skill} (confidence: {skill.confidence:.3f})")
```

### Enhanced Resume Parser

```python
from enhanced_resume_parser import EnhancedResumeParser

# Initialize parser with A/B testing
parser = EnhancedResumeParser(enable_ab_testing=True)

# Extract skills with metadata
result = parser.extract_skills_from_text(resume_text, user_id="user123")

print(f"Found {len(result['skills'])} skills")
print(f"Extraction time: {result['metadata']['extraction_time']:.3f}s")
```

### Interactive Dashboard

```bash
# Launch Streamlit dashboard
streamlit run skill_extraction_dashboard.py
```

Access at http://localhost:8501 for:
- Real-time skill extraction testing
- Performance analytics and visualizations
- Human feedback collection
- Configuration management
- A/B test monitoring

## 🧪 A/B Testing

### Creating Tests

```python
from ab_testing_framework import ABTestManager, TestVariant

ab_manager = ABTestManager()

# Define test variants
control = TestVariant(
    variant_id="control",
    name="Current Config",
    config={'embedding_weight': 0.25},
    traffic_percentage=50.0,
    is_control=True
)

test = TestVariant(
    variant_id="embedding_heavy", 
    name="Embedding Heavy",
    config={'embedding_weight': 0.5},
    traffic_percentage=50.0
)

# Create and start test
test_id = ab_manager.create_test(
    name="Embedding Weight Test",
    variants=[control, test],
    duration_days=14
)

ab_manager.start_test(test_id)
```

### Monitoring Results

```python
# Get test results
results = ab_manager.get_test_results(test_id)

print("Statistical Significance:")
for variant_id, stats in results['statistical_significance'].items():
    print(f"Variant {variant_id}: {stats['improvement_percent']:.1f}% improvement")
    print(f"P-value: {stats['p_value']:.4f}")
    print(f"Significant: {stats['is_significant']}")
```

## 📊 Configuration

### Ensemble Weights

```python
from ensemble_skill_extractor import EnsembleConfig

config = EnsembleConfig(
    spacy_weight=0.3,      # spaCy NER weight
    fuzzy_weight=0.2,      # Fuzzy matching weight  
    tfidf_weight=0.25,     # TF-IDF weight
    embedding_weight=0.25, # Embedding weight
    min_confidence=0.6,    # Minimum confidence threshold
    fuzzy_threshold=80,    # Fuzzy matching threshold
    tfidf_threshold=0.3,   # TF-IDF similarity threshold
    embedding_threshold=0.7 # Embedding similarity threshold
)

extractor = EnsembleSkillExtractor(config)
```

### Skill Ontology

```python
# Custom skill ontology
ontology_data = {
    "canonical_skills": {
        "python": "Python",
        "js": "JavaScript"
    },
    "aliases": {
        "python": ["py", "python3"],
        "javascript": ["js", "ecmascript"]
    },
    "categories": {
        "programming": ["python", "javascript"]
    }
}

# Save and load
import json
with open('skill_ontology.json', 'w') as f:
    json.dump(ontology_data, f)
```

## 🎓 Active Learning

### Collecting Feedback

```python
# Add human feedback
extractor.add_feedback(
    text="Python and React developer",
    predicted_skills=["Python", "React", "Developer"],
    correct_skills=["Python", "React"],  # Remove "Developer"
    user_id="expert_reviewer"
)

# Retrain with feedback
extractor.retrain_with_feedback()
```

### Dashboard Feedback

The interactive dashboard provides a user-friendly interface for:
- Reviewing extracted skills
- Correcting false positives/negatives  
- Adding missing skills
- Rating extraction quality
- Bulk feedback processing

## 📈 Performance Monitoring

### Metrics Tracking

```python
# Get comprehensive statistics
stats = extractor.get_skill_statistics()

print(f"Reference skills: {stats['total_reference_skills']}")
print(f"Feedback entries: {stats['feedback_entries']}")
print(f"Current thresholds: {stats['current_config']}")
```

### Analytics Dashboard

The dashboard provides visualizations for:
- Method performance comparison (precision, recall, F1)
- Skill category distribution
- Extraction trends over time
- A/B test results
- User feedback analytics

## 🔧 Advanced Features

### Custom Extractors

```python
class CustomExtractor(EnsembleSkillExtractor):
    def extract_skills_custom(self, text):
        # Implement custom extraction logic
        matches = []
        # ... custom logic
        return matches
    
    def ensemble_extract(self, text):
        # Include custom method in ensemble
        custom_matches = self.extract_skills_custom(text)
        # ... combine with other methods
        return super().ensemble_extract(text) + custom_matches
```

### Production Deployment

```python
# FastAPI integration
from fastapi import FastAPI
from enhanced_resume_parser import EnhancedResumeParser

app = FastAPI()
parser = EnhancedResumeParser()

@app.post("/extract-skills")
async def extract_skills(text: str, user_id: str = None):
    result = parser.extract_skills_from_text(text, user_id)
    return result

@app.post("/feedback")
async def submit_feedback(
    text: str, 
    predicted: list, 
    correct: list, 
    user_id: str = None
):
    parser.add_user_feedback(text, predicted, correct, user_id)
    return {"status": "success"}
```

### Batch Processing

```python
# Process multiple documents
documents = ["resume1.txt", "resume2.txt", "resume3.txt"]
results = []

for doc_path in documents:
    with open(doc_path, 'r') as f:
        text = f.read()
    
    result = parser.extract_skills_from_text(text)
    results.append({
        'document': doc_path,
        'skills': result['skills'],
        'metadata': result['metadata']
    })

# Analyze batch results
total_skills = sum(len(r['skills']) for r in results)
avg_confidence = sum(
    sum(s['confidence'] for s in r['skills']) / len(r['skills'])
    for r in results if r['skills']
) / len([r for r in results if r['skills']])

print(f"Processed {len(documents)} documents")
print(f"Total skills extracted: {total_skills}")
print(f"Average confidence: {avg_confidence:.3f}")
```

## 🧪 Testing

```bash
# Run tests
pytest tests/

# Run with coverage
pytest --cov=. tests/

# Run specific test
pytest tests/test_ensemble_extractor.py::test_ensemble_extraction
```

## 📚 API Reference

### EnsembleSkillExtractor

Main extraction class combining multiple methods.

**Methods:**
- `ensemble_extract(text: str) -> List[SkillMatch]`
- `extract_skills_spacy(text: str) -> List[SkillMatch]`
- `extract_skills_fuzzy(text: str) -> List[SkillMatch]`
- `extract_skills_tfidf(text: str) -> List[SkillMatch]`
- `extract_skills_embeddings(text: str) -> List[SkillMatch]`
- `add_feedback(text, predicted, correct, user_id)`
- `retrain_with_feedback()`

### ABTestManager

A/B testing framework for model comparison.

**Methods:**
- `create_test(name, description, variants, duration_days)`
- `start_test(test_id)`
- `assign_user_to_variant(user_id, test_id)`
- `record_metrics(test_id, variant_id, metrics)`
- `get_test_results(test_id)`

### SkillOntology

Skill normalization and canonicalization.

**Methods:**
- `normalize_skill(skill: str) -> str`
- `load_ontology(file_path: str)`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- spaCy for NLP capabilities
- SentenceTransformers for semantic embeddings
- Streamlit for interactive dashboards
- scikit-learn for ML utilities