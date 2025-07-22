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

def extract_skills_from_text(text: str) -> List[Dict[str, str]]:
    """
    Extract skills from text using NER, keyword matching, and pattern matching
    """
    try:
        # Process with spaCy's NER
        doc = nlp(text)
        skills = set()

        # Extract skills using NER
        for ent in doc.ents:
            if ent.label_ in ["SKILL", "TECHNOLOGY", "TOOL", "FRAMEWORK", "LANGUAGE"]:
                skill = ent.text.strip()
                if is_valid_skill(skill):
                    skills.add(skill.lower())
        
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
                if is_valid_skill(skill):
                    skills.add(skill.lower())
        
        # Format and categorize results
        return [
            {'skill': skill, 'category': categorize_skill(skill)}
            for skill in sorted(skills)
        ]
        
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
