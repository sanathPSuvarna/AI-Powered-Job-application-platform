#!/usr/bin/env python3
"""
Setup script for Enhanced Skill Extraction System
Installs all required Python dependencies for the job-skill-matcher backend
"""

import subprocess
import sys
import os

def install_package(package):
    """Install a package using pip"""
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", package])
        return True
    except subprocess.CalledProcessError:
        return False

def main():
    """Install all required packages"""
    print("🚀 Setting up Enhanced Skill Extraction System for Job-Skill-Matcher")
    print("=" * 70)
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    requirements_file = os.path.join(script_dir, "requirements.txt")
    
    if not os.path.exists(requirements_file):
        print("❌ requirements.txt not found!")
        sys.exit(1)
    
    print(f"📦 Installing packages from {requirements_file}")
    
    try:
        # Install from requirements file
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ])
        
        print("\n✅ All packages installed successfully!")
        
        # Download spaCy language model
        print("\n📥 Downloading spaCy English language model...")
        try:
            subprocess.check_call([
                sys.executable, "-m", "spacy", "download", "en_core_web_sm"
            ])
            print("✅ spaCy model downloaded successfully!")
        except subprocess.CalledProcessError:
            print("⚠️ Could not download spaCy model. You may need to run:")
            print("   python -m spacy download en_core_web_sm")
        
        print("\n🎉 Setup completed successfully!")
        print("\nNext steps:")
        print("1. Start your Node.js backend server")
        print("2. Upload a resume to test the enhanced skill extraction")
        print("3. Check the improved accuracy and A/B testing metrics")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing packages: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()