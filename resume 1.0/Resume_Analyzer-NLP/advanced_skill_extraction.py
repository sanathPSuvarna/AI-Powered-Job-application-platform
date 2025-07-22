import spacy
import sys
import os
import json
import re
from collections import Counter
import difflib

# Set up paths
current_dir = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(current_dir, 'TrainedModel', 'test')

# Common technology skills by category
TECH_SKILLS = {
    'programming_languages': {
        'python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'ruby', 'php', 'swift',
        'kotlin', 'go', 'rust', 'scala', 'perl', 'r', 'matlab'
    },
    'web_technologies': {
        'html', 'css', 'html5', 'css3', 'sass', 'less', 'bootstrap', 'jquery', 'rest', 'api',
        'graphql', 'websocket', 'xml', 'json', 'ajax'
    },
    'frameworks': {
        'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'node.js', 
        'next.js', 'gatsby', 'svelte', 'laravel', 'asp.net', '.net'
    },
    'databases': {
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite', 'cassandra',
        'dynamodb', 'elasticsearch', 'database', 'rdbms', 'nosql'
    },
    'ai_ml': {
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
        'nlp', 'natural language processing', 'computer vision', 'data science', 'artificial intelligence'
    }
}

# Combine all skills into a single set
ALL_TECH_SKILLS = {skill.lower() for category in TECH_SKILLS.values() for skill in category}

# Multi-token skills need special handling
MULTI_TOKEN_SKILLS = {
    'machine learning', 'deep learning', 'natural language processing', 'computer vision',
    'data science', 'artificial intelligence', 'object-oriented programming',
    'functional programming', 'version control', 'continuous integration',
    'continuous deployment', 'infrastructure as code', 'test-driven development'
}

# Common words that might be falsely identified as skills
NON_SKILL_WORDS = {
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december', 'year', 'years', 'month',
    'months', 'present', 'current', 'inc', 'llc', 'company', 'corporation',
    'university', 'college', 'school', 'institute', 'bachelor', 'master', 'phd',
    'degree', 'gpa', 'grade', 'score', 'team', 'project', 'work', 'experience'
}

def is_valid_skill(skill_text):
    """
    Advanced validation for skills with better handling of edge cases
    """
    skill_text = skill_text.lower().strip()
    
    # Skip non-skill words
    if skill_text in NON_SKILL_WORDS:
        return False
        
    # Accept if it's in our known skill list
    if skill_text in ALL_TECH_SKILLS:
        return True
        
    # Special case for C-family languages and other short languages
    if skill_text in {'c', 'r', 'go', 'c++', 'c#', 'f#', '.net'}:
        return True
        
    # Reject if it's too short (likely an abbreviation or mistake) 
    if len(skill_text) < 2:
        return False
    
    return True

def extract_skills_advanced(text, nlp):
    """
    Advanced skill extraction with improved pattern matching for programming languages
    and better multi-token skill detection
    """
    skills = set()
    text_lower = text.lower()
    
    # 1. NER-based extraction with the trained model
    doc = nlp(text)
    for ent in doc.ents:
        if ent.label_ == "SKILL":
            if is_valid_skill(ent.text):
                skills.add(ent.text.lower())
    
    # 2. Rule-based extraction for specific language patterns
    
    # C++ - various ways it could appear
    cpp_patterns = [
        r'\bc\+\+\b', 
        r'\bc\s*\+\s*\+\b', 
        r'\bcpp\b',
        r'\bc\s+plus\s+plus\b'
    ]
    for pattern in cpp_patterns:
        if re.search(pattern, text_lower):
            skills.add('c++')
    
    # C# - various ways it could appear
    csharp_patterns = [
        r'\bc#\b', 
        r'\bc\s*sharp\b', 
        r'\bcsharp\b',
        r'(?<!\w)c\s*#(?!\w)'
    ]
    for pattern in csharp_patterns:
        if re.search(pattern, text_lower):
            skills.add('c#')
    
    # C language - should be standalone 'C'
    c_patterns = [
        r'(?<!\w)c(?!\w|\+|\#)',
        r'(?<!\w)c\s+programming(?!\w)',
        r'(?<!\w)c\s+language(?!\w)',
        r'\bin\s+c[\s,\.]',
        r'using\s+c[\s,\.]'
    ]
    for pattern in c_patterns:
        if re.search(pattern, text_lower):
            skills.add('c')
    
    # .NET framework - various ways it appears
    dotnet_patterns = [
        r'\b\.net\b', 
        r'\bdotnet\b',
        r'\bnet\s+framework\b',
        r'\basp\.net\b'
    ]
    for pattern in dotnet_patterns:
        if re.search(pattern, text_lower):
            skills.add('.net')
    
    # R language - standalone 'R'
    r_patterns = [
        r'\br\b(?!\w)',
        r'\br\s+programming(?!\w)',
        r'\br\s+language(?!\w)'
    ]
    for pattern in r_patterns:
        if re.search(pattern, text_lower):
            skills.add('r')
    
    # Database related skills
    db_patterns = [
        r'\bdatabase\b',
        r'\bdatabases\b',
        r'\bdb\b',
        r'\bdata\s+store\b',
        r'\bdata\s+storage\b'
    ]
    for pattern in db_patterns:
        if re.search(pattern, text_lower):
            skills.add('database')
    
    # SQL database
    if re.search(r'\bsql\b', text_lower):
        skills.add('sql')
    
    # 3. Dictionary-based matching for standard skills
    for skill in ALL_TECH_SKILLS:
        # For single-token skills
        if ' ' not in skill:
            if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                skills.add(skill)
        # Multi-token skills need special treatment
        else:
            if skill in text_lower:
                skills.add(skill)
    
    # 4. Check for multi-token skills specifically
    for skill in MULTI_TOKEN_SKILLS:
        if skill in text_lower:
            skills.add(skill)
    
    # 5. Skill section extraction
    skill_sections = re.finditer(
        r'(?i)(technical\s+)?skills?:([^:]+?)(?=\n\s*\w+:|$)',
        text,
        re.DOTALL
    )
    
    for section in skill_sections:
        skill_text = section.group(2)
        # Extract skills from bullet points, commas, or newlines
        skill_items = re.findall(
            r'[-•]\s*([^,\n]+)|\b([^,\n:]+?)(?=,|\n|$)',
            skill_text
        )
        for item in skill_items:
            skill = (item[0] or item[1]).strip()
            if is_valid_skill(skill):
                skills.add(skill.lower())
    
    # 6. Fuzzy matching for similar skills
    skill_list = list(skills)
    for idx, skill in enumerate(skill_list):
        for known_skill in ALL_TECH_SKILLS:
            # Skip if already matched exactly
            if skill == known_skill:
                continue
                
            # Check for high similarity
            similarity = difflib.SequenceMatcher(None, skill, known_skill).ratio()
            if similarity > 0.9:  # 90% similarity threshold
                # Replace with the standard skill name
                skills.discard(skill)
                skills.add(known_skill)
                break
    
    return list(skills)

# Test data with known skills
test_texts = [
    "Proficient in Python, Java, and C programming languages.",
    "Experience with C++ for high-performance computing applications.",
    "Developed software using C and C++ languages.",
    "Skilled in JavaScript, React, and TypeScript.",
    "Knowledge of machine learning frameworks such as TensorFlow and PyTorch.",
    "Experience with SQL and database design.",
    "Worked on projects using Java and Spring framework.",
    "Proficient in C# and .NET development.",
    "Familiar with R for statistical analysis.",
    "Knowledge of Go programming language.",
]

# Expected skills in each test text (ground truth)
expected_skills = [
    ["Python", "Java", "C"],
    ["C++"],
    ["C", "C++"],
    ["JavaScript", "React", "TypeScript"],
    ["machine learning", "TensorFlow", "PyTorch"],
    ["SQL", "database"],
    ["Java", "Spring"],
    ["C#", ".NET"],
    ["R"],
    ["Go"],
]

def evaluate_advanced_model():
    print(f"Loading model from {MODEL_PATH}")
    try:
        nlp = spacy.load(MODEL_PATH)
    except Exception as e:
        print(f"Error loading model: {e}")
        return
    
    print("Model loaded successfully")
    
    # Track correct and incorrect predictions
    true_positives = 0
    false_positives = 0
    false_negatives = 0
    skill_performance = {}
    
    for i, (text, expected) in enumerate(zip(test_texts, expected_skills)):
        print(f"\n--- Processing test case {i+1} ---")
        print(f"Text: {text}")
        print(f"Expected skills: {expected}")
        
        # Extract skills using advanced method
        extracted_skills = extract_skills_advanced(text, nlp)
        
        print(f"Extracted skills: {extracted_skills}")
        
        # Calculate metrics for this example
        for skill in extracted_skills:
            found = False
            for exp_skill in expected:
                if exp_skill.lower() in skill.lower() or skill.lower() in exp_skill.lower():
                    true_positives += 1
                    found = True
                    # Track performance of individual skills
                    if exp_skill not in skill_performance:
                        skill_performance[exp_skill] = {"correct": 0, "missed": 0}
                    skill_performance[exp_skill]["correct"] += 1
                    break
            
            if not found:
                false_positives += 1
        
        # Check for missed skills
        for exp_skill in expected:
            found = False
            for skill in extracted_skills:
                if exp_skill.lower() in skill.lower() or skill.lower() in exp_skill.lower():
                    found = True
                    break
            
            if not found:
                false_negatives += 1
                # Track missed skills
                if exp_skill not in skill_performance:
                    skill_performance[exp_skill] = {"correct": 0, "missed": 0}
                skill_performance[exp_skill]["missed"] += 1
    
    # Calculate precision, recall, and F1 score
    precision = true_positives / (true_positives + false_positives) if (true_positives + false_positives) > 0 else 0
    recall = true_positives / (true_positives + false_negatives) if (true_positives + false_negatives) > 0 else 0
    f1 = 2 * (precision * recall) / (precision + recall) if (precision + recall) > 0 else 0
    
    print("\n--- Advanced Extraction Performance ---")
    print(f"True Positives: {true_positives}")
    print(f"False Positives: {false_positives}")
    print(f"False Negatives: {false_negatives}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall: {recall:.4f}")
    print(f"F1 Score: {f1:.4f}")
    
    print("\n--- Performance by Skill ---")
    for skill, stats in skill_performance.items():
        correct = stats["correct"]
        missed = stats["missed"]
        total = correct + missed
        accuracy = correct / total if total > 0 else 0
        print(f"{skill}: {correct}/{total} correct ({accuracy:.2f})")

    return {
        'precision': precision,
        'recall': recall,
        'f1': f1,
        'true_positives': true_positives,
        'false_positives': false_positives,
        'false_negatives': false_negatives
    }

if __name__ == "__main__":
    evaluate_advanced_model()
