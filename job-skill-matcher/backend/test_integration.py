#!/usr/bin/env python3
"""
Integration Test for Enhanced Skill Extraction in Job-Skill-Matcher
Tests the complete pipeline from PDF to database integration
"""

import sys
import os
import json
import tempfile
import time
from pathlib import Path

# Add current directory to path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURRENT_DIR)

def create_test_pdf():
    """Create a test PDF file for testing"""
    try:
        import fitz  # PyMuPDF
        
        # Create a simple PDF with sample resume content
        doc = fitz.open()
        page = doc.new_page()
        
        # Sample resume text
        resume_text = """
        John Doe
        Senior Software Engineer
        
        TECHNICAL SKILLS:
        • Programming Languages: Python, JavaScript, Java, C++
        • Web Technologies: React, Node.js, HTML5, CSS3, REST APIs
        • Databases: MySQL, MongoDB, PostgreSQL
        • Cloud Platforms: AWS, Azure, Docker, Kubernetes
        • Machine Learning: TensorFlow, PyTorch, scikit-learn
        • Tools: Git, Jenkins, JIRA, Linux
        
        EXPERIENCE:
        Senior Software Engineer at Tech Corp (2020-Present)
        • Developed web applications using React and Node.js
        • Implemented machine learning models with TensorFlow
        • Managed databases and cloud infrastructure on AWS
        • Collaborated with cross-functional teams using Agile methodologies
        
        Software Developer at StartupXYZ (2018-2020)
        • Built RESTful APIs using Python and Django
        • Worked with SQL databases and data visualization
        • Deployed applications using Docker containers
        
        EDUCATION:
        Master of Science in Computer Science
        Bachelor of Engineering in Software Engineering
        """
        
        # Insert text into PDF
        rect = fitz.Rect(50, 50, 500, 700)
        page.insert_textbox(rect, resume_text, fontsize=11)
        
        # Save to temporary file
        temp_file = tempfile.NamedTemporaryFile(suffix='.pdf', delete=False)
        doc.save(temp_file.name)
        doc.close()
        
        return temp_file.name
        
    except ImportError:
        print("❌ PyMuPDF not installed. Cannot create test PDF.")
        return None

def test_enhanced_extraction():
    """Test the enhanced skill extraction system"""
    print("🧪 Testing Enhanced Skill Extraction for Job-Skill-Matcher")
    print("=" * 70)
    
    # Create test PDF
    print("📄 Creating test PDF...")
    test_pdf_path = create_test_pdf()
    
    if not test_pdf_path:
        print("❌ Could not create test PDF. Skipping test.")
        return False
    
    try:
        # Test the enhanced CLI
        print("🔍 Testing enhanced resume parser CLI...")
        
        import subprocess
        result = subprocess.run([
            sys.executable,
            'enhanced_resume_parser_cli.py',
            test_pdf_path,
            'extract_skills',
            '--user-id', 'test_user_123'
        ], capture_output=True, text=True, timeout=60)
        
        if result.returncode != 0:
            print(f"❌ CLI test failed: {result.stderr}")
            return False
        
        # Parse results
        try:
            skills_data = json.loads(result.stdout)
            print(f"✅ Successfully extracted {len(skills_data)} skills")
            
            # Display sample results
            print("\n📊 Sample extracted skills:")
            for i, skill in enumerate(skills_data[:10]):  # Show first 10
                print(f"  {i+1:2d}. {skill['skill']:<20} | "
                      f"Category: {skill['category']:<15} | "
                      f"Confidence: {skill['confidence']:.3f} | "
                      f"Method: {skill.get('method', 'unknown')}")
            
            if len(skills_data) > 10:
                print(f"     ... and {len(skills_data) - 10} more skills")
            
            # Analyze results
            categories = {}
            methods = {}
            total_confidence = 0
            
            for skill in skills_data:
                cat = skill.get('category', 'unknown')
                method = skill.get('method', 'unknown')
                conf = skill.get('confidence', 0)
                
                categories[cat] = categories.get(cat, 0) + 1
                methods[method] = methods.get(method, 0) + 1
                total_confidence += conf
            
            avg_confidence = total_confidence / len(skills_data) if skills_data else 0
            
            print(f"\n📈 Analysis:")
            print(f"   Total skills: {len(skills_data)}")
            print(f"   Average confidence: {avg_confidence:.3f}")
            print(f"   Categories: {', '.join(f'{cat}({count})' for cat, count in categories.items())}")
            print(f"   Methods: {', '.join(f'{method}({count})' for method, count in methods.items())}")
            
            return True
            
        except json.JSONDecodeError as e:
            print(f"❌ Error parsing JSON output: {e}")
            print(f"Raw output: {result.stdout}")
            return False
            
    except subprocess.TimeoutExpired:
        print("❌ Test timed out after 60 seconds")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        return False
    finally:
        # Clean up test file
        try:
            if test_pdf_path and os.path.exists(test_pdf_path):
                os.unlink(test_pdf_path)
        except:
            pass

def test_imports():
    """Test that all required modules can be imported"""
    print("📦 Testing module imports...")
    
    required_modules = [
        'ensemble_skill_extractor',
        'ab_testing_framework',
        'spacy',
        'sentence_transformers',
        'sklearn',
        'fuzzywuzzy'
    ]
    
    failed_imports = []
    
    for module in required_modules:
        try:
            __import__(module)
            print(f"  ✅ {module}")
        except ImportError as e:
            print(f"  ❌ {module}: {e}")
            failed_imports.append(module)
    
    if failed_imports:
        print(f"\n⚠️ Failed to import: {', '.join(failed_imports)}")
        print("Run: python setup_enhanced_extraction.py")
        return False
    
    print("✅ All modules imported successfully")
    return True

def main():
    """Run all integration tests"""
    print("🚀 Job-Skill-Matcher Enhanced Extraction Integration Test")
    print("=" * 80)
    print(f"Python version: {sys.version}")
    print(f"Working directory: {os.getcwd()}")
    print("=" * 80)
    
    # Test 1: Module imports
    if not test_imports():
        print("\n❌ Import test failed. Please install required dependencies.")
        return False
    
    print()
    
    # Test 2: Enhanced extraction
    if not test_enhanced_extraction():
        print("\n❌ Enhanced extraction test failed.")
        return False
    
    print("\n🎉 All integration tests passed!")
    print("\n📋 Next steps for Job-Skill-Matcher integration:")
    print("1. Start your Node.js backend server")
    print("2. Upload a PDF resume via the API endpoint")
    print("3. Check the enhanced extraction results with A/B testing")
    print("4. Submit feedback to improve the system")
    print("5. Monitor performance metrics in the database")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)