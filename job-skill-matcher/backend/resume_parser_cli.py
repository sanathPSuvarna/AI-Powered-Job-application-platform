#!/usr/bin/env python
# resume_parser_cli.py

import sys
import os
import json
import fitz  # PyMuPDF
import spacy
from typing import List, Dict
import re

# Set up paths
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
RESUME_PROJECT_PATH = os.path.abspath(os.path.join(CURRENT_DIR, '..', '..', 'resume 1.0', 'Resume_Analyzer-NLP'))
MODEL_PATH = os.path.abspath(os.path.join(RESUME_PROJECT_PATH, 'TrainedModel', 'test'))

# Add the resume project path to Python path
if RESUME_PROJECT_PATH not in sys.path:
    sys.path.append(RESUME_PROJECT_PATH)

# Common tech skills by category
TECH_SKILLS = {
    'programming_languages': {
        'python', 'java', 'javascript', 'typescript', 'c', 'c++', 'c#', 'ruby', 'php', 'swift',
        'kotlin', 'go', 'rust', 'scala', 'perl', 'r', 'matlab'
    },
    'web_technologies': {
        'html', 'css', 'html5', 'css3', 'sass', 'bootstrap', 'jquery', 'rest', 'api',
        'graphql', 'websocket', 'xml', 'json', 'ajax'
    },
    'frameworks': {
        'react', 'angular', 'vue', 'django', 'flask', 'spring', 'express', 'node.js',
        'next.js', 'gatsby', 'svelte', 'laravel', 'asp.net'
    },
    'databases': {
        'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite', 'cassandra',
        'dynamodb', 'elasticsearch'
    },
    'cloud_devops': {
        'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'terraform', 'ansible',
        'linux', 'unix', 'nginx', 'apache'
    },
    'ai_ml': {
        'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'keras', 'scikit-learn',
        'nlp', 'computer vision', 'data science', 'artificial intelligence'
    }
}

# Combine all skills into a single set
ALL_TECH_SKILLS = {skill.lower() for category in TECH_SKILLS.values() for skill in category}

# Common words that might be falsely identified as skills
NON_SKILL_WORDS = {
    'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
    'september', 'october', 'november', 'december', 'year', 'years', 'month',
    'months', 'present', 'current', 'inc', 'llc', 'company', 'corporation',
    'university', 'college', 'school', 'institute', 'bachelor', 'master', 'phd',
    'degree', 'gpa', 'grade', 'score', 'team', 'project', 'work', 'experience'
}

def is_valid_skill(skill: str) -> bool:
    """
    Enhanced validation for skills with better handling of edge cases
    """
    if not skill:
        return False
        
    skill = skill.lower().strip()
    
    # Check if it's in our known skill list
    if skill in ALL_TECH_SKILLS:
        return True
        
    # Special handling for programming languages with short names or special symbols
    if skill in {'c', 'r', 'go', 'c++', 'c#', 'f#', '.net'}:
        return True
    
    # Handle common variations of programming languages
    if skill in {'c plus plus', 'c-plus-plus', 'cplusplus'}:
        return True
        
    if skill in {'c sharp', 'c-sharp', 'csharp'}:
        return True
    
    # Reject if it's in our non-skill words list
    if skill in NON_SKILL_WORDS:
        return False
        
    # Reject if it's too short (likely an abbreviation or mistake) 
    # with exception of known programming languages
    if len(skill) < 2 and skill not in {'c', 'r'}:
        return False
        
    # Reject if it contains unwanted patterns
    unwanted_patterns = [
        r'^\d+$',  # pure numbers
        r'^[^a-zA-Z]+$',  # non-alphabetic
        r'^(mr|mrs|ms|dr)',  # titles
        r'(street|road|ave|avenue|blvd)',  # addresses
        r'@',  # emails
    ]
    
    for pattern in unwanted_patterns:
        if re.search(pattern, skill, re.IGNORECASE):
            return False
            
    return True

def categorize_skill(skill: str) -> str:
    """Categorize a skill into its appropriate category"""
    skill = skill.lower()
    for category, skills in TECH_SKILLS.items():
        if skill in skills:
            return category
    return 'other'

def is_likely_false_positive(skill: str, context: str) -> bool:
    """
    Simple but effective false positive detection to reduce noise
    """
    skill_lower = skill.lower().strip()
    context_lower = context.lower()
    
    # Skip very common false positives that get misclassified
    false_positive_words = {
        # Generic business/work terms
        'experience', 'work', 'team', 'project', 'development', 'management', 
        'support', 'service', 'business', 'company', 'position', 'role',
        'skills', 'knowledge', 'ability', 'background', 'requirements',
        'responsibilities', 'duties', 'tasks', 'expertise',
        
        # Time-related terms that get misclassified
        'years', 'months', 'time', 'year', 'month', 'daily', 'weekly',
        'january', 'february', 'march', 'april', 'may', 'june',
        'july', 'august', 'september', 'october', 'november', 'december',
        
        # Action words/verbs that shouldn't be skills
        'worked', 'developed', 'created', 'designed', 'managed', 'led',
        'built', 'implemented', 'maintained', 'tested', 'deployed',
        'coordinated', 'collaborated', 'analyzed', 'optimized',
        
        # Education/career terms
        'degree', 'bachelor', 'master', 'phd', 'university', 'college', 'school',
        'education', 'course', 'training', 'certification', 'graduate',
        
        # Location/workplace terms
        'remote', 'office', 'location', 'city', 'state', 'onsite',
        
        # Generic tech terms that are too broad to be useful
        'software', 'hardware', 'system', 'application', 'technology',
        'platform', 'solution', 'tool', 'framework', 'database',
        'server', 'client', 'web', 'mobile', 'desktop',
        
        # Common resume words
        'strong', 'excellent', 'proficient', 'advanced', 'skilled',
        'familiar', 'experienced', 'knowledgeable',
        
        # Numbers and basic words
        'one', 'two', 'three', 'four', 'five', 'several', 'multiple',
        'the', 'and', 'or', 'with', 'using', 'including', 'such'
    }
    
    if skill_lower in false_positive_words:
        return True
    
    # Skip very short words unless they're known tech abbreviations
    if len(skill_lower) <= 2 and skill_lower not in ['ai', 'ml', 'ui', 'ux', 'r', 'go', 'c#', 'c', 'js', 'ts']:
        return True
    
    # Skip very long phrases (likely sentence fragments)
    if len(skill_lower.split()) > 3:
        return True
        
    # Skip words with numbers unless they're version numbers
    if re.search(r'\d', skill_lower) and not re.search(r'(html5|css3|http2?|python[23])', skill_lower):
        return True
    
    # Skip if it looks like a company name or proper noun in wrong context
    skill_positions = [m.start() for m in re.finditer(re.escape(skill_lower), context_lower)]
    
    for pos in skill_positions:
        # Check surrounding context (50 characters each way)
        start = max(0, pos - 50)
        end = min(len(context_lower), pos + len(skill_lower) + 50)
        surrounding = context_lower[start:end]
        
        # Non-technical context indicators that suggest false positive
        non_tech_contexts = [
            'experience at', 'worked at', 'employed by', 'company', 'corporation',
            'university', 'college', 'school', 'degree in', 'studied at',
            'inc', 'ltd', 'corp', 'llc', 'years of', 'months of'
        ]
        
        if any(ctx in surrounding for ctx in non_tech_contexts):
            return True
    
    return False

def extract_skills_from_text(text: str) -> List[Dict[str, str]]:
    """
    Extract skills from text using NER, keyword matching, and pattern matching
    """
    try:
        # Process with spaCy's NER
        doc = nlp(text)
        skills = set()

        # Extract skills using NER with false positive filtering
        for ent in doc.ents:
            if ent.label_ in ["SKILL", "TECHNOLOGY", "TOOL", "FRAMEWORK", "LANGUAGE"]:
                skill = ent.text.strip()
                if is_valid_skill(skill) and not is_likely_false_positive(skill, text):
                    skills.add(skill.lower())
                    print(f"✓ Valid skill: {skill}", file=sys.stderr)
                else:
                    print(f"✗ Filtered: {skill}", file=sys.stderr)
        
        # Pattern-based extraction for specific programming languages
        text_lower = text.lower()
        original_text = text  # Keep original case for exact pattern matching
        
        # C++ - various ways it could appear 
        if re.search(r'c\+\+', text_lower) or re.search(r'c\s*\+\s*\+', text_lower) or re.search(r'\bcpp\b', text_lower):
            skills.add('c++')
        
        # C# - various ways it could appear
        if re.search(r'c#', text_lower) or re.search(r'c\s*sharp', text_lower) or re.search(r'\bcsharp\b', text_lower):
            skills.add('c#')
        
        # C language - should be standalone 'C'
        c_patterns = [r'\bc\b', r'\bc\s+programming\b', r'\bc\s+language\b']
        for pattern in c_patterns:
            if re.search(pattern, text_lower):
                skills.add('c')
                break
        
        # .NET framework - check both lowercase and original case since dot might be affected by case conversion
        if re.search(r'\.net\b', text_lower) or re.search(r'\.NET\b', original_text) or re.search(r'\bdotnet\b', text_lower):
            skills.add('.net')
        
        # Database
        database_patterns = [r'\bdatabase\b', r'\bdb\b', r'\bdatabases\b']
        for pattern in database_patterns:
            if re.search(pattern, text_lower):
                skills.add('database')
                break
        
        # Extract skills using keyword matching for other skills
        for skill in ALL_TECH_SKILLS:
            # For single-token skills
            if ' ' not in skill:
                # Skip the ones we've already handled specifically
                if skill in {'c', 'c++', 'c#'}:
                    continue
                
                if re.search(r'\b' + re.escape(skill) + r'\b', text_lower):
                    skills.add(skill)
            # Multi-token skills need special treatment
            else:
                if skill in text_lower:
                    skills.add(skill)
        
        # Look for skills in "skills" sections
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
                if is_valid_skill(skill) and not is_likely_false_positive(skill, text):
                    skills.add(skill.lower())
                    print(f"✓ Section skill: {skill}", file=sys.stderr)
        
        # Format and categorize results with confidence scoring
        results = []
        for skill in sorted(skills):
            # Assign confidence based on how the skill was detected
            confidence = 0.8  # Base confidence
            
            # Higher confidence for skills found in dedicated sections
            if any('skills' in text[max(0, text.lower().find(skill)-50):text.lower().find(skill)+50].lower() 
                   for _ in [None] if skill in text.lower()):
                confidence = min(1.0, confidence + 0.1)
            
            # Higher confidence for well-known programming languages
            if skill in {'python', 'java', 'javascript', 'react', 'angular', 'node.js', 'docker', 'aws'}:
                confidence = min(1.0, confidence + 0.15)
            
            results.append({
                'skill': skill, 
                'category': categorize_skill(skill),
                'confidence': round(confidence, 3)
            })
        
        print(f"Final skill count after filtering: {len(results)}", file=sys.stderr)
        return results
        
    except Exception as e:
        print(f"Error extracting skills: {str(e)}", file=sys.stderr)
        return []

def extract_skills_from_pdf(pdf_path: str) -> List[Dict[str, str]]:
    """Extract skills from a PDF file"""
    try:
        # Open and read PDF file
        doc = fitz.open(pdf_path)
        text = ""
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text += page.get_text()
        
        # Extract skills from text
        return extract_skills_from_text(text)
    except Exception as e:
        print(f"Error processing PDF: {str(e)}", file=sys.stderr)
        return []

# Load the spaCy model
try:
    print(f"Loading model from: {MODEL_PATH}", file=sys.stderr)
    nlp = spacy.load(MODEL_PATH)
    print("Successfully loaded custom NER model", file=sys.stderr)
except Exception as e:
    print(f"Error loading custom model ({str(e)}), falling back to en_core_web_sm", file=sys.stderr)
    try:
        nlp = spacy.load("en_core_web_sm")
        print("Loaded en_core_web_sm model", file=sys.stderr)
    except Exception as e:
        print(f"Error loading fallback model: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python resume_parser_cli.py <pdf_path> <action>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    action = sys.argv[2]
    
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    if action == "extract_skills":
        skills = extract_skills_from_pdf(pdf_path)
        print(json.dumps(skills, indent=2))
    else:
        print(f"Unknown action: {action}", file=sys.stderr)
        sys.exit(1)
