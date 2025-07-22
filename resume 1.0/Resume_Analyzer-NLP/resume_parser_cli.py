#!/usr/bin/env python
# resume_parser_cli.py

import sys
import os
import json
import spacy
import fitz  # PyMuPDF

# Set up the correct path to import modules
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Import the resume_parser module
from modules.resume_parser import extract_skills, nlp

def extract_skills_from_pdf(pdf_path):
    """Extract skills from a PDF file"""
    try:
        # Open the PDF file
        doc = fitz.open(pdf_path)
        
        # Extract text from all pages
        text = ""
        for page_num in range(doc.page_count):
            page = doc[page_num]
            text += page.get_text()
        
        # Create a spaCy doc from the extracted text
        doc = nlp(text)
        
        # Extract skills using the existing function
        skills = extract_skills(doc)
        
        return skills
    except Exception as e:
        print(f"Error extracting skills: {str(e)}", file=sys.stderr)
        return []

if __name__ == "__main__":
    # Check if correct number of arguments is provided
    if len(sys.argv) < 3:
        print("Usage: python resume_parser_cli.py <pdf_path> <action>", file=sys.stderr)
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    action = sys.argv[2]
    
    # Check if the file exists
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}", file=sys.stderr)
        sys.exit(1)
    
    # Perform the requested action
    if action == "extract_skills":
        skills = extract_skills_from_pdf(pdf_path)
        # Output the result as JSON to stdout
        print(json.dumps(skills))
    else:
        print(f"Unknown action: {action}", file=sys.stderr)
        sys.exit(1)
