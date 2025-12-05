"""
Advanced Ensemble Skill Extraction System
Combines spaCy NER + fuzzy + TF-IDF + embeddings with weighted voting
"""

import spacy
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
from fuzzywuzzy import fuzz, process
import json
import re
import os
import sys
from typing import List, Dict, Tuple, Optional
from dataclasses import dataclass
from collections import defaultdict
import logging

@dataclass
class SkillMatch:
    skill: str
    confidence: float
    method: str
    context: str
    position: Tuple[int, int]
    
@dataclass
class EnsembleConfig:
    spacy_weight: float = 0.3
    fuzzy_weight: float = 0.2
    tfidf_weight: float = 0.25
    embedding_weight: float = 0.25
    min_confidence: float = 0.6
    fuzzy_threshold: int = 80
    tfidf_threshold: float = 0.3
    embedding_threshold: float = 0.7

class SkillOntology:
    """Maintains canonical skill ontology and alias mappings"""
    
    def __init__(self, ontology_file: str = None):
        self.canonical_skills = {}
        self.aliases = defaultdict(list)
        self.categories = {}
        self.load_ontology(ontology_file)
    
    def load_ontology(self, file_path: str = None):
        """Load skill ontology from file or create default"""
        if file_path:
            with open(file_path, 'r') as f:
                data = json.load(f)
                self.canonical_skills = data.get('canonical_skills', {})
                self.aliases = defaultdict(list, data.get('aliases', {}))
                self.categories = data.get('categories', {})
        else:
            # Comprehensive skill ontology
            self.canonical_skills = {
                # Programming Languages
                'python': 'Python',
                'javascript': 'JavaScript', 
                'java': 'Java',
                'c++': 'C++',
                'c#': 'C#',
                'c': 'C',
                'go': 'Go',
                'rust': 'Rust',
                'php': 'PHP',
                'ruby': 'Ruby',
                'swift': 'Swift',
                'kotlin': 'Kotlin',
                'typescript': 'TypeScript',
                'r': 'R',
                'matlab': 'MATLAB',
                'scala': 'Scala',
                'perl': 'Perl',
                'shell': 'Shell Scripting',
                'powershell': 'PowerShell',
                'dart': 'Dart',
                
                # Web Technologies
                'html': 'HTML',
                'css': 'CSS',
                'sass': 'Sass',
                'less': 'Less',
                'react': 'React',
                'angular': 'Angular',
                'vue': 'Vue.js',
                'svelte': 'Svelte',
                'nextjs': 'Next.js',
                'nuxtjs': 'Nuxt.js',
                'gatsby': 'Gatsby',
                'jquery': 'jQuery',
                'bootstrap': 'Bootstrap',
                'tailwind': 'Tailwind CSS',
                'material_ui': 'Material-UI',
                'styled_components': 'Styled Components',
                
                # Backend Frameworks
                'nodejs': 'Node.js',
                'express': 'Express.js',
                'django': 'Django',
                'flask': 'Flask',
                'fastapi': 'FastAPI',
                'spring': 'Spring',
                'springboot': 'Spring Boot',
                'dotnet': '.NET',
                'aspnet': 'ASP.NET',
                'rails': 'Ruby on Rails',
                'laravel': 'Laravel',
                'codeigniter': 'CodeIgniter',
                'symfony': 'Symfony',
                'nestjs': 'NestJS',
                'koa': 'Koa.js',
                
                # Databases
                'sql': 'SQL',
                'mysql': 'MySQL',
                'postgresql': 'PostgreSQL',
                'mongodb': 'MongoDB',
                'redis': 'Redis',
                'elasticsearch': 'Elasticsearch',
                'sqlite': 'SQLite',
                'oracle': 'Oracle Database',
                'sqlserver': 'SQL Server',
                'cassandra': 'Cassandra',
                'dynamodb': 'DynamoDB',
                'nosql': 'NoSQL',
                'firebase': 'Firebase',
                'supabase': 'Supabase',
                
                # Cloud & DevOps
                'aws': 'Amazon Web Services',
                'azure': 'Microsoft Azure',
                'gcp': 'Google Cloud Platform',
                'docker': 'Docker',
                'kubernetes': 'Kubernetes',
                'jenkins': 'Jenkins',
                'gitlab': 'GitLab',
                'github': 'GitHub',
                'bitbucket': 'Bitbucket',
                'terraform': 'Terraform',
                'ansible': 'Ansible',
                'vagrant': 'Vagrant',
                'circleci': 'CircleCI',
                'travis': 'Travis CI',
                'nginx': 'Nginx',
                'apache': 'Apache',
                'linux': 'Linux',
                'ubuntu': 'Ubuntu',
                'centos': 'CentOS',
                'debian': 'Debian',
                'heroku': 'Heroku',
                'vercel': 'Vercel',
                'netlify': 'Netlify',
                
                # AI/ML/Data Science
                'machine_learning': 'Machine Learning',
                'artificial_intelligence': 'Artificial Intelligence',
                'data_science': 'Data Science',
                'deep_learning': 'Deep Learning',
                'neural_networks': 'Neural Networks',
                'tensorflow': 'TensorFlow',
                'pytorch': 'PyTorch',
                'keras': 'Keras',
                'scikit_learn': 'Scikit-learn',
                'pandas': 'Pandas',
                'numpy': 'NumPy',
                'matplotlib': 'Matplotlib',
                'seaborn': 'Seaborn',
                'plotly': 'Plotly',
                'jupyter': 'Jupyter',
                'opencv': 'OpenCV',
                'nltk': 'NLTK',
                'spacy': 'spaCy',
                'transformers': 'Transformers',
                'huggingface': 'Hugging Face',
                'bert': 'BERT',
                'gpt': 'GPT',
                'computer_vision': 'Computer Vision',
                'nlp': 'Natural Language Processing',
                'statistics': 'Statistics',
                'data_analysis': 'Data Analysis',
                'data_visualization': 'Data Visualization',
                'big_data': 'Big Data',
                'hadoop': 'Hadoop',
                'spark': 'Apache Spark',
                'kafka': 'Apache Kafka',
                'airflow': 'Apache Airflow',
                
                # Mobile Development
                'android': 'Android',
                'ios': 'iOS',
                'react_native': 'React Native',
                'flutter': 'Flutter',
                'xamarin': 'Xamarin',
                'ionic': 'Ionic',
                'cordova': 'Cordova',
                'phonegap': 'PhoneGap',
                
                # Testing
                'testing': 'Software Testing',
                'unit_testing': 'Unit Testing',
                'integration_testing': 'Integration Testing',
                'selenium': 'Selenium',
                'cypress': 'Cypress',
                'jest': 'Jest',
                'mocha': 'Mocha',
                'jasmine': 'Jasmine',
                'pytest': 'PyTest',
                'junit': 'JUnit',
                'testng': 'TestNG',
                
                # Tools & IDEs
                'git': 'Git',
                'svn': 'SVN',
                'mercurial': 'Mercurial',
                'vscode': 'VS Code',
                'intellij': 'IntelliJ IDEA',
                'eclipse': 'Eclipse',
                'vim': 'Vim',
                'emacs': 'Emacs',
                'sublime': 'Sublime Text',
                'atom': 'Atom',
                'xcode': 'Xcode',
                'android_studio': 'Android Studio',
                'postman': 'Postman',
                'insomnia': 'Insomnia',
                'figma': 'Figma',
                'sketch': 'Sketch',
                'photoshop': 'Adobe Photoshop',
                'illustrator': 'Adobe Illustrator',
                
                # Soft Skills
                'communication': 'Communication',
                'leadership': 'Leadership',
                'teamwork': 'Teamwork',
                'problem_solving': 'Problem Solving',
                'critical_thinking': 'Critical Thinking',
                'project_management': 'Project Management',
                'agile': 'Agile',
                'scrum': 'Scrum',
                'kanban': 'Kanban',
                'time_management': 'Time Management',
                
                # Other Technologies
                'blockchain': 'Blockchain',
                'cryptocurrency': 'Cryptocurrency',
                'bitcoin': 'Bitcoin',
                'ethereum': 'Ethereum',
                'solidity': 'Solidity',
                'web3': 'Web3',
                'iot': 'Internet of Things',
                'cybersecurity': 'Cybersecurity',
                'penetration_testing': 'Penetration Testing',
                'network_security': 'Network Security',
                'api': 'API Development',
                'rest': 'REST API',
                'graphql': 'GraphQL',
                'microservices': 'Microservices',
                'serverless': 'Serverless',
                'websockets': 'WebSockets',
                'oauth': 'OAuth',
                'jwt': 'JWT',
                'redis': 'Redis',
                'memcached': 'Memcached',
                'rabbitmq': 'RabbitMQ',
                'socket_io': 'Socket.IO'
            }
            
            self.aliases = {
                # Programming Languages
                'python': ['py', 'python3', 'python2'],
                'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2020', 'es2021'],
                'typescript': ['ts'],
                'c++': ['cpp', 'c plus plus'],
                'c#': ['csharp', 'c sharp'],
                'nodejs': ['node.js', 'node', 'node js'],
                'dotnet': ['.net', 'dot net', 'dotnet core'],
                'aspnet': ['asp.net', 'asp net'],
                
                # Frameworks & Libraries
                'react': ['reactjs', 'react.js'],
                'angular': ['angularjs', 'angular.js'],
                'vue': ['vuejs', 'vue.js'],
                'nextjs': ['next.js', 'next'],
                'nuxtjs': ['nuxt.js', 'nuxt'],
                'express': ['expressjs', 'express.js'],
                'tensorflow': ['tf', 'tensor-flow'],
                'pytorch': ['torch'],
                'scikit_learn': ['sklearn', 'scikit-learn'],
                'jquery': ['jquery', '$'],
                'bootstrap': ['bs', 'twitter bootstrap'],
                'material_ui': ['mui', 'material ui'],
                'styled_components': ['styled-components'],
                
                # Databases
                'postgresql': ['postgres', 'psql'],
                'mongodb': ['mongo'],
                'sqlserver': ['sql server', 'mssql', 'microsoft sql server'],
                'mysql': ['my sql'],
                'sqlite': ['sqlite3'],
                'elasticsearch': ['elastic search', 'es'],
                
                # Cloud & DevOps
                'aws': ['amazon web services', 'amazon aws'],
                'azure': ['microsoft azure', 'ms azure'],
                'gcp': ['google cloud platform', 'google cloud', 'gcloud'],
                'kubernetes': ['k8s', 'kube'],
                'docker': ['containerization'],
                'jenkins': ['ci/cd', 'continuous integration'],
                'gitlab': ['git lab'],
                'github': ['git hub'],
                
                # AI/ML
                'machine_learning': ['ml', 'machine-learning', 'machinelearning'],
                'artificial_intelligence': ['ai', 'artificial-intelligence'],
                'data_science': ['data-science', 'datascience'],
                'deep_learning': ['dl', 'deep-learning'],
                'neural_networks': ['nn', 'neural-networks', 'neural nets'],
                'computer_vision': ['cv', 'computer-vision'],
                'nlp': ['natural language processing', 'natural-language-processing'],
                'big_data': ['big-data', 'bigdata'],
                
                # Mobile
                'react_native': ['react-native', 'rn'],
                'android': ['android development'],
                'ios': ['ios development', 'iphone'],
                
                # Testing
                'unit_testing': ['unit-testing', 'unittest'],
                'integration_testing': ['integration-testing'],
                
                # Tools
                'vscode': ['vs code', 'visual studio code'],
                'intellij': ['intellij idea'],
                'android_studio': ['android-studio'],
                'sublime': ['sublime text'],
                
                # Methodologies
                'agile': ['agile methodology', 'agile development'],
                'scrum': ['scrum methodology'],
                'project_management': ['project-management', 'pm'],
                
                # Web Technologies
                'html': ['html5'],
                'css': ['css3'],
                'sass': ['scss'],
                'tailwind': ['tailwindcss', 'tailwind css'],
                
                # APIs & Architecture
                'rest': ['rest api', 'restful', 'rest apis'],
                'graphql': ['graph ql'],
                'microservices': ['micro services', 'micro-services'],
                'websockets': ['web sockets', 'web-sockets'],
                'socket_io': ['socket.io'],
                
                # Other
                'web3': ['web 3', 'web 3.0'],
                'iot': ['internet of things', 'internet-of-things'],
                'oauth': ['o auth'],
                'jwt': ['json web token', 'json web tokens'],
                'rabbitmq': ['rabbit mq']
            }
            
            self.categories = {
                'programming_languages': ['python', 'javascript', 'java', 'c++', 'c#', 'c', 'go', 'rust', 'php', 'ruby', 'swift', 'kotlin', 'typescript', 'r', 'matlab', 'scala', 'perl', 'shell', 'powershell', 'dart'],
                'web_technologies': ['html', 'css', 'sass', 'less', 'react', 'angular', 'vue', 'svelte', 'nextjs', 'nuxtjs', 'gatsby', 'jquery', 'bootstrap', 'tailwind', 'material_ui', 'styled_components'],
                'backend_frameworks': ['nodejs', 'express', 'django', 'flask', 'fastapi', 'spring', 'springboot', 'dotnet', 'aspnet', 'rails', 'laravel', 'codeigniter', 'symfony', 'nestjs', 'koa'],
                'databases': ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'oracle', 'sqlserver', 'cassandra', 'dynamodb', 'nosql', 'firebase', 'supabase'],
                'cloud_platforms': ['aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify'],
                'devops': ['docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket', 'terraform', 'ansible', 'vagrant', 'circleci', 'travis', 'nginx', 'apache', 'linux', 'ubuntu', 'centos', 'debian'],
                'ai_ml_data': ['machine_learning', 'artificial_intelligence', 'data_science', 'deep_learning', 'neural_networks', 'tensorflow', 'pytorch', 'keras', 'scikit_learn', 'pandas', 'numpy', 'matplotlib', 'seaborn', 'plotly', 'jupyter', 'opencv', 'nltk', 'spacy', 'transformers', 'huggingface', 'bert', 'gpt', 'computer_vision', 'nlp', 'statistics', 'data_analysis', 'data_visualization', 'big_data', 'hadoop', 'spark', 'kafka', 'airflow'],
                'mobile_development': ['android', 'ios', 'react_native', 'flutter', 'xamarin', 'ionic', 'cordova', 'phonegap'],
                'testing': ['testing', 'unit_testing', 'integration_testing', 'selenium', 'cypress', 'jest', 'mocha', 'jasmine', 'pytest', 'junit', 'testng'],
                'tools_ides': ['git', 'svn', 'mercurial', 'vscode', 'intellij', 'eclipse', 'vim', 'emacs', 'sublime', 'atom', 'xcode', 'android_studio', 'postman', 'insomnia', 'figma', 'sketch', 'photoshop', 'illustrator'],
                'soft_skills': ['communication', 'leadership', 'teamwork', 'problem_solving', 'critical_thinking', 'project_management', 'agile', 'scrum', 'kanban', 'time_management'],
                'emerging_tech': ['blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'solidity', 'web3', 'iot', 'cybersecurity', 'penetration_testing', 'network_security'],
                'api_architecture': ['api', 'rest', 'graphql', 'microservices', 'serverless', 'websockets', 'oauth', 'jwt', 'redis', 'memcached', 'rabbitmq', 'socket_io']
            }
    
    def normalize_skill(self, skill: str) -> str:
        """Normalize skill to canonical form"""
        skill_lower = skill.lower().strip()
        
        # Direct canonical match
        if skill_lower in self.canonical_skills:
            return self.canonical_skills[skill_lower]
        
        # Check aliases
        for canonical, aliases in self.aliases.items():
            if skill_lower in aliases:
                return self.canonical_skills.get(canonical, skill)
        
        return skill

class EnsembleSkillExtractor:
    """Advanced ensemble skill extraction system"""
    
    def __init__(self, config: EnsembleConfig = None):
        self.config = config or EnsembleConfig()
        self.ontology = SkillOntology()
        
        # Initialize models - Try to load custom trained model first
        custom_model_path = os.path.abspath(os.path.join(
            os.path.dirname(__file__), '..', '..', 'resume 1.0', 'Resume_Analyzer-NLP', 'TrainedModel', 'skills'
        ))
        
        try:
            if os.path.exists(custom_model_path):
                self.nlp = spacy.load(custom_model_path)
                print(f"✅ Loaded custom skills model from {custom_model_path}", file=sys.stderr)
            else:
                self.nlp = spacy.load("en_core_web_sm")
                print("⚠️ Custom model not found, using en_core_web_sm", file=sys.stderr)
        except Exception as e:
            print(f"⚠️ Error loading custom model: {e}, falling back to en_core_web_sm", file=sys.stderr)
            self.nlp = spacy.load("en_core_web_sm")
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=5000,
            stop_words='english',
            ngram_range=(1, 3)
        )
        
        # Load skill reference data
        self.reference_skills = list(self.ontology.canonical_skills.values())
        self.skill_embeddings = None
        self.tfidf_fitted = False
        
        # Active learning storage
        self.feedback_data = []
        
        # Initialize models
        self._prepare_reference_data()
        
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def _prepare_reference_data(self):
        """Prepare reference embeddings and TF-IDF"""
        # Create skill embeddings
        self.skill_embeddings = self.sentence_model.encode(self.reference_skills)
        
        # Fit TF-IDF on skill corpus
        skill_corpus = self.reference_skills + [
            alias for aliases in self.ontology.aliases.values() 
            for alias in aliases
        ]
        self.tfidf_vectorizer.fit(skill_corpus)
        self.tfidf_fitted = True
    
    def extract_skills_spacy(self, text: str) -> List[SkillMatch]:
        """Extract skills using spaCy NER"""
        doc = self.nlp(text)
        matches = []
        
        # Look for SKILL entities from custom model
        for ent in doc.ents:
            if ent.label_ == "SKILL":  # Custom model uses SKILL label
                # Clean up the skill text
                skill_text = ent.text.strip()
                skill_text = re.sub(r'\s+', ' ', skill_text)  # Normalize whitespace
                skill_text = re.sub(r'[^\w\s\+\-\.\#]', '', skill_text)  # Remove special chars except common ones
                
                # Skip if too short or too long
                if len(skill_text) < 2 or len(skill_text) > 50:
                    continue
                
                skill = self.ontology.normalize_skill(skill_text)
                # Accept all detected skills, but prefer normalized ones
                final_skill = skill if skill in self.reference_skills else skill_text
                
                try:
                    context = ent.sent.text
                except (ValueError, AttributeError):
                    # Fallback if sentence boundaries not available
                    context = text[:100] + "..." if len(text) > 100 else text
                
                matches.append(SkillMatch(
                    skill=final_skill,
                    confidence=0.9,  # Higher confidence for custom model
                    method="spacy_custom_ner",
                    context=context,
                    position=(ent.start_char, ent.end_char)
                ))
        
        # Also check for common skill entity types as fallback
        for ent in doc.ents:
            if ent.label_ in ["ORG", "PRODUCT", "LANGUAGE"]:  # Common skill entity types
                skill_text = ent.text.strip()
                skill = self.ontology.normalize_skill(skill_text)
                if skill in self.reference_skills:
                    try:
                        context = ent.sent.text
                    except (ValueError, AttributeError):
                        context = text[:100] + "..." if len(text) > 100 else text
                    
                    matches.append(SkillMatch(
                        skill=skill,
                        confidence=0.7,
                        method="spacy_general_ner",
                        context=context,
                        position=(ent.start_char, ent.end_char)
                    ))
        
        # Look for noun phrases that might be skills (with error handling for custom models)
        try:
            for chunk in doc.noun_chunks:
                skill = self.ontology.normalize_skill(chunk.text)
                if skill in self.reference_skills:
                    try:
                        context = chunk.sent.text
                    except (ValueError, AttributeError):
                        context = text[:100] + "..." if len(text) > 100 else text
                    
                    matches.append(SkillMatch(
                        skill=skill,
                        confidence=0.6,
                        method="spacy_noun_chunk",
                        context=context,
                        position=(chunk.start_char, chunk.end_char)
                    ))
        except ValueError as e:
            # Custom NER models might not have dependency parser
            # Skip noun chunk extraction if not available
            print(f"⚠️ Noun chunks not available in this model: {e}", file=sys.stderr)
            pass
        
        # Remove duplicates and return
        unique_matches = []
        seen_skills = set()
        for match in matches:
            if match.skill not in seen_skills:
                unique_matches.append(match)
                seen_skills.add(match.skill)
        
        return unique_matches
    
    def extract_skills_fuzzy(self, text: str) -> List[SkillMatch]:
        """Extract skills using fuzzy string matching"""
        matches = []
        words = re.findall(r'\b[A-Za-z][A-Za-z0-9+#.-]*\b', text)
        
        for word in words:
            # Find best fuzzy match
            best_match = process.extractOne(
                word, 
                self.reference_skills,
                scorer=fuzz.ratio
            )
            
            if best_match and best_match[1] >= self.config.fuzzy_threshold:
                # Find position in text
                start_pos = text.lower().find(word.lower())
                end_pos = start_pos + len(word) if start_pos >= 0 else 0
                
                matches.append(SkillMatch(
                    skill=best_match[0],
                    confidence=best_match[1] / 100.0,
                    method="fuzzy_match",
                    context=self._get_context(text, start_pos, end_pos),
                    position=(start_pos, end_pos)
                ))
        
        return matches
    
    def extract_skills_tfidf(self, text: str) -> List[SkillMatch]:
        """Extract skills using TF-IDF similarity"""
        if not self.tfidf_fitted:
            return []
        
        matches = []
        text_tfidf = self.tfidf_vectorizer.transform([text])
        
        for i, skill in enumerate(self.reference_skills):
            skill_tfidf = self.tfidf_vectorizer.transform([skill])
            similarity = cosine_similarity(text_tfidf, skill_tfidf)[0][0]
            
            if similarity >= self.config.tfidf_threshold:
                # Find approximate position (simple implementation)
                start_pos = text.lower().find(skill.lower())
                end_pos = start_pos + len(skill) if start_pos >= 0 else 0
                
                matches.append(SkillMatch(
                    skill=skill,
                    confidence=similarity,
                    method="tfidf_similarity",
                    context=self._get_context(text, start_pos, end_pos),
                    position=(start_pos, end_pos)
                ))
        
        return matches
    
    def extract_skills_embeddings(self, text: str) -> List[SkillMatch]:
        """Extract skills using semantic embeddings"""
        matches = []
        text_embedding = self.sentence_model.encode([text])
        
        similarities = cosine_similarity(text_embedding, self.skill_embeddings)[0]
        
        for i, similarity in enumerate(similarities):
            if similarity >= self.config.embedding_threshold:
                skill = self.reference_skills[i]
                start_pos = text.lower().find(skill.lower())
                end_pos = start_pos + len(skill) if start_pos >= 0 else 0
                
                matches.append(SkillMatch(
                    skill=skill,
                    confidence=similarity,
                    method="embedding_similarity",
                    context=self._get_context(text, start_pos, end_pos),
                    position=(start_pos, end_pos)
                ))
        
        return matches
    
    def _get_context(self, text: str, start: int, end: int, window: int = 50) -> str:
        """Get context around a position"""
        context_start = max(0, start - window)
        context_end = min(len(text), end + window)
        return text[context_start:context_end].strip()
    
    def ensemble_extract(self, text: str) -> List[SkillMatch]:
        """Extract skills using custom spaCy model only (fast mode)"""
        # Use only custom spaCy model for extraction
        spacy_matches = self.extract_skills_spacy(text)
        
        # Apply minimum confidence threshold (lowered for spaCy-only mode)
        final_matches = []
        for match in spacy_matches:
            if match.confidence >= 0.5:  # Lower threshold for spaCy-only
                final_matches.append(match)
        
        # Sort by confidence
        final_matches.sort(key=lambda x: x.confidence, reverse=True)
        
        self.logger.info(f"Extracted {len(final_matches)} skills using spaCy-only method")
        return final_matches
    
    def add_feedback(self, text: str, predicted_skills: List[str], 
                    correct_skills: List[str], user_id: str = None):
        """Add human feedback for active learning"""
        feedback_entry = {
            'text': text,
            'predicted': predicted_skills,
            'correct': correct_skills,
            'user_id': user_id,
            'timestamp': pd.Timestamp.now()
        }
        self.feedback_data.append(feedback_entry)
        
        self.logger.info(f"Added feedback: {len(correct_skills)} correct skills")
    
    def retrain_with_feedback(self):
        """Retrain models using accumulated feedback"""
        if not self.feedback_data:
            self.logger.warning("No feedback data available for retraining")
            return
        
        # Simple retraining: adjust confidence thresholds based on feedback
        correct_predictions = []
        incorrect_predictions = []
        
        for feedback in self.feedback_data:
            matches = self.ensemble_extract(feedback['text'])
            predicted = [m.skill for m in matches]
            
            for skill in feedback['correct']:
                if skill in predicted:
                    match = next(m for m in matches if m.skill == skill)
                    correct_predictions.append(match.confidence)
                else:
                    # This skill was missed
                    pass
            
            for skill in predicted:
                if skill not in feedback['correct']:
                    match = next(m for m in matches if m.skill == skill)
                    incorrect_predictions.append(match.confidence)
        
        # Adjust thresholds
        if correct_predictions and incorrect_predictions:
            # Find optimal threshold
            correct_mean = np.mean(correct_predictions)
            incorrect_mean = np.mean(incorrect_predictions)
            
            new_threshold = (correct_mean + incorrect_mean) / 2
            self.config.min_confidence = max(0.4, min(0.8, new_threshold))
            
            self.logger.info(f"Adjusted confidence threshold to {self.config.min_confidence}")
    
    def get_skill_statistics(self) -> Dict:
        """Get extraction statistics"""
        return {
            'total_reference_skills': len(self.reference_skills),
            'canonical_skills': len(self.ontology.canonical_skills),
            'alias_mappings': len(self.ontology.aliases),
            'feedback_entries': len(self.feedback_data),
            'current_config': {
                'min_confidence': self.config.min_confidence,
                'fuzzy_threshold': self.config.fuzzy_threshold,
                'tfidf_threshold': self.config.tfidf_threshold,
                'embedding_threshold': self.config.embedding_threshold
            }
        }

def main():
    """Example usage"""
    extractor = EnsembleSkillExtractor()
    
    sample_text = """
    I am a experienced software developer with 5 years of Python programming experience.
    I have worked extensively with JavaScript, React, and Node.js for web development.
    My expertise includes machine learning using TensorFlow and PyTorch, data science
    with pandas and scikit-learn. I'm familiar with cloud platforms like AWS and Azure,
    and have experience with Docker and Kubernetes for containerization and orchestration.
    """
    
    # Extract skills
    skills = extractor.ensemble_extract(sample_text)
    
    print("Extracted Skills:")
    for skill in skills:
        print(f"- {skill.skill} (confidence: {skill.confidence:.3f}, method: {skill.method})")
    
    # Simulate feedback
    predicted_skills = [s.skill for s in skills]
    correct_skills = ['Python', 'JavaScript', 'React', 'Node.js', 'Machine Learning', 
                     'TensorFlow', 'PyTorch', 'Amazon Web Services', 'Microsoft Azure', 
                     'Docker', 'Kubernetes']
    
    extractor.add_feedback(sample_text, predicted_skills, correct_skills)
    
    # Print statistics
    stats = extractor.get_skill_statistics()
    print(f"\nExtraction Statistics: {stats}")

if __name__ == "__main__":
    main()