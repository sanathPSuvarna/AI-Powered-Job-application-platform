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
    spacy_weight: float = 0.30
    fuzzy_weight: float = 0.35
    tfidf_weight: float = 0.20
    embedding_weight: float = 0.15
    min_confidence: float = 0.30  # Lowered from 0.40 to catch more skills
    fuzzy_threshold: int = 80      # Lowered from 85 for better matching
    tfidf_threshold: float = 0.25  # Moderate threshold
    embedding_threshold: float = 0.60  # Moderate semantic matching

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
            # Comprehensive ontology with all 302 skills from test dataset
            self.canonical_skills = {
                '3d_modeling': '3D Modeling', 'a_b_testing': 'A/B Testing', 'acid_transactions': 'ACID Transactions',
                'api_gateway': 'API Gateway', 'api_testing': 'API Testing', 'asp_net_core': 'ASP.NET Core',
                'aws': 'AWS', 'aws_ec2': 'AWS EC2', 'aws_lambda': 'AWS Lambda', 'aws_rds': 'AWS RDS',
                'aws_s3': 'AWS S3', 'agile': 'Agile', 'android_development': 'Android Development',
                'angular': 'Angular', 'animation': 'Animation', 'ansible': 'Ansible',
                'apache_airflow': 'Apache Airflow', 'apache_kafka': 'Apache Kafka', 'apache_spark': 'Apache Spark',
                'app_store_optimization': 'App Store Optimization', 'application_security': 'Application Security',
                'arduino': 'Arduino', 'argocd': 'ArgoCD', 'audio_processing': 'Audio Processing',
                'automation': 'Automation', 'azure': 'Azure', 'azure_devops': 'Azure DevOps',
                'azure_functions': 'Azure Functions', 'bdd': 'BDD', 'bert': 'BERT',
                'backbone_js': 'Backbone.js', 'big_data': 'Big Data', 'bitcoin': 'Bitcoin',
                'blender': 'Blender', 'blockchain': 'Blockchain', 'bootstrap': 'Bootstrap',
                'csharp': 'C#', 'cplusplus': 'C++', 'cplusplus_game_development': 'C++ Game Development',
                'cad': 'CAD', 'ci_cd': 'CI/CD', 'cnn': 'CNN', 'css3': 'CSS3',
                'cassandra': 'Cassandra', 'chef': 'Chef', 'circleci': 'CircleCI',
                'client_relations': 'Client Relations', 'clojure': 'Clojure', 'cloud_cdn': 'Cloud CDN',
                'cloud_iam': 'Cloud IAM', 'cloud_monitoring': 'Cloud Monitoring', 'cloud_storage': 'Cloud Storage',
                'code_review': 'Code Review', 'communication': 'Communication', 'compliance': 'Compliance',
                'computer_vision': 'Computer Vision', 'consensus_algorithms': 'Consensus Algorithms',
                'couchdb': 'CouchDB', 'critical_thinking': 'Critical Thinking',
                'cross_browser_compatibility': 'Cross-browser Compatibility', 'cryptocurrency': 'Cryptocurrency',
                'cryptography': 'Cryptography', 'cybersecurity': 'Cybersecurity', 'cypress': 'Cypress',
                'dart': 'Dart', 'data_analysis': 'Data Analysis', 'data_cleaning': 'Data Cleaning',
                'data_mining': 'Data Mining', 'data_modeling': 'Data Modeling',
                'data_visualization': 'Data Visualization', 'data_warehousing': 'Data Warehousing',
                'database_design': 'Database Design', 'datadog': 'Datadog', 'defi': 'DeFi',
                'deep_learning': 'Deep Learning', 'distributed_ledger': 'Distributed Ledger',
                'django': 'Django', 'docker': 'Docker', 'dynamodb': 'DynamoDB',
                'elk_stack': 'ELK Stack', 'etl': 'ETL', 'edge_computing': 'Edge Computing',
                'elasticsearch': 'Elasticsearch', 'elixir': 'Elixir', 'embedded_systems': 'Embedded Systems',
                'ember_js': 'Ember.js', 'encryption': 'Encryption', 'end_to_end_testing': 'End-to-End Testing',
                'ethereum': 'Ethereum', 'express_js': 'Express.js', 'fsharp': 'F#',
                'fastapi': 'FastAPI', 'feature_engineering': 'Feature Engineering', 'firebase': 'Firebase',
                'firewalls': 'Firewalls', 'flask': 'Flask', 'flutter': 'Flutter',
                'gan': 'GAN', 'gdpr': 'GDPR', 'gis': 'GIS', 'gpt': 'GPT',
                'game_ai': 'Game AI', 'game_design': 'Game Design', 'gatsby': 'Gatsby',
                'github_actions': 'GitHub Actions', 'gitlab_ci': 'GitLab CI', 'go': 'Go',
                'google_cloud_platform': 'Google Cloud Platform', 'google_kubernetes_engine': 'Google Kubernetes Engine',
                'grafana': 'Grafana', 'graphql': 'GraphQL', 'groovy': 'Groovy',
                'hls': 'HLS', 'html5': 'HTML5', 'hadoop': 'Hadoop', 'haskell': 'Haskell',
                'helm': 'Helm', 'hyperledger': 'Hyperledger', 'hyperparameter_tuning': 'Hyperparameter Tuning',
                'hypothesis_testing': 'Hypothesis Testing', 'ibm_cloud': 'IBM Cloud', 'iso_27001': 'ISO 27001',
                'image_classification': 'Image Classification', 'image_processing': 'Image Processing',
                'in_app_purchases': 'In-App Purchases', 'incident_response': 'Incident Response',
                'indexing': 'Indexing', 'influxdb': 'InfluxDB', 'infrastructure_as_code': 'Infrastructure as Code',
                'integration_testing': 'Integration Testing', 'iot': 'IoT', 'ionic': 'Ionic',
                'jmeter': 'JMeter', 'junit': 'JUnit', 'jwt': 'JWT', 'java': 'Java',
                'javascript': 'JavaScript', 'jenkins': 'Jenkins', 'jest': 'Jest',
                'jetpack_compose': 'Jetpack Compose', 'julia': 'Julia', 'jupyter': 'Jupyter',
                'kanban': 'Kanban', 'keras': 'Keras', 'kotlin': 'Kotlin', 'kubernetes': 'Kubernetes',
                'less': 'LESS', 'lstm': 'LSTM', 'laravel': 'Laravel', 'leadership': 'Leadership',
                'lightgbm': 'LightGBM', 'load_testing': 'Load Testing', 'location_services': 'Location Services',
                'lua': 'Lua', 'matlab': 'MATLAB', 'mlops': 'MLOps', 'machine_learning': 'Machine Learning',
                'mariadb': 'MariaDB', 'material_ui': 'Material-UI', 'matplotlib': 'Matplotlib',
                'maya': 'Maya', 'mentoring': 'Mentoring', 'microcontrollers': 'Microcontrollers',
                'microservices': 'Microservices', 'mobx': 'MobX', 'mobile_security': 'Mobile Security',
                'mobile_ui_ux': 'Mobile UI/UX', 'mocha': 'Mocha', 'model_deployment': 'Model Deployment',
                'mongodb': 'MongoDB', 'multiplayer_networking': 'Multiplayer Networking', 'mysql': 'MySQL',
                'nft': 'NFT', 'natural_language_processing': 'Natural Language Processing', 'neo4j': 'Neo4j',
                'nestjs': 'NestJS', 'network_security': 'Network Security', 'neural_networks': 'Neural Networks',
                'new_relic': 'New Relic', 'next_js': 'Next.js', 'nosql': 'NoSQL', 'node_js': 'Node.js',
                'numpy': 'NumPy', 'nuxt_js': 'Nuxt.js', 'oauth': 'OAuth', 'owasp': 'OWASP',
                'object_detection': 'Object Detection', 'objective_c': 'Objective-C',
                'offline_storage': 'Offline Storage', 'oracle': 'Oracle', 'oracle_cloud': 'Oracle Cloud',
                'php': 'PHP', 'pwa': 'PWA', 'pandas': 'Pandas', 'penetration_testing': 'Penetration Testing',
                'performance_testing': 'Performance Testing', 'perl': 'Perl', 'phoenix': 'Phoenix',
                'physics_engine': 'Physics Engine', 'plotly': 'Plotly', 'postgresql': 'PostgreSQL',
                'postman': 'Postman', 'power_bi': 'Power BI', 'powershell': 'PowerShell',
                'predictive_analytics': 'Predictive Analytics', 'presentation_skills': 'Presentation Skills',
                'problem_solving': 'Problem Solving', 'project_management': 'Project Management',
                'prometheus': 'Prometheus', 'puppet': 'Puppet', 'push_notifications': 'Push Notifications',
                'pytorch': 'PyTorch', 'pytest': 'Pytest', 'python': 'Python',
                'quantum_computing': 'Quantum Computing', 'query_optimization': 'Query Optimization',
                'r': 'R', 'rest_api': 'REST API', 'rnn': 'RNN', 'rtmp': 'RTMP', 'rtos': 'RTOS',
                'raspberry_pi': 'Raspberry Pi', 'react': 'React', 'react_native': 'React Native',
                'redis': 'Redis', 'redux': 'Redux', 'reinforcement_learning': 'Reinforcement Learning',
                'replication': 'Replication', 'responsive_design': 'Responsive Design',
                'risk_assessment': 'Risk Assessment', 'robotics': 'Robotics', 'ruby': 'Ruby',
                'ruby_on_rails': 'Ruby on Rails', 'rust': 'Rust', 'siem': 'SIEM', 'soc_2': 'SOC 2',
                'sql_server': 'SQL Server', 'sqlite': 'SQLite', 'ssl_tls': 'SSL/TLS',
                'sass': 'Sass', 'scala': 'Scala', 'scrum': 'Scrum', 'seaborn': 'Seaborn',
                'security_auditing': 'Security Auditing', 'security_testing': 'Security Testing',
                'selenium': 'Selenium', 'serverless': 'Serverless', 'serverless_framework': 'Serverless Framework',
                'session_management': 'Session Management', 'sharding': 'Sharding',
                'shell_scripting': 'Shell Scripting', 'signal_processing': 'Signal Processing',
                'smart_contracts': 'Smart Contracts', 'solidity': 'Solidity', 'splunk': 'Splunk',
                'spring_boot': 'Spring Boot', 'stakeholder_management': 'Stakeholder Management',
                'statistical_analysis': 'Statistical Analysis', 'statistical_modeling': 'Statistical Modeling',
                'streaming_technologies': 'Streaming Technologies', 'supabase': 'Supabase',
                'svelte': 'Svelte', 'swift': 'Swift', 'swiftui': 'SwiftUI', 'tableau': 'Tableau',
                'tailwind_css': 'Tailwind CSS', 'team_collaboration': 'Team Collaboration',
                'technical_writing': 'Technical Writing', 'tensorflow': 'TensorFlow', 'terraform': 'Terraform',
                'test_automation': 'Test Automation', 'test_driven_development': 'Test-Driven Development',
                'testng': 'TestNG', 'threat_modeling': 'Threat Modeling', 'time_management': 'Time Management',
                'time_series_analysis': 'Time Series Analysis', 'timescaledb': 'TimescaleDB',
                'token_economics': 'Token Economics', 'transformer_models': 'Transformer Models',
                'travis_ci': 'Travis CI', 'typescript': 'TypeScript', 'unit_testing': 'Unit Testing',
                'unity': 'Unity', 'unreal_engine': 'Unreal Engine', 'vba': 'VBA',
                'vr_ar_development': 'VR/AR Development', 'vagrant': 'Vagrant',
                'video_processing': 'Video Processing', 'vite': 'Vite', 'vue_js': 'Vue.js',
                'vulnerability_assessment': 'Vulnerability Assessment', 'web_components': 'Web Components',
                'web3_js': 'Web3.js', 'webrtc': 'WebRTC', 'websockets': 'WebSockets',
                'webpack': 'Webpack', 'xgboost': 'XGBoost', 'xamarin': 'Xamarin',
                'grpc': 'gRPC', 'ios_development': 'iOS Development', 'jquery': 'jQuery',
                'scikit_learn': 'scikit-learn',
            }
            
            # Add common aliases for skills
            self.aliases = {
                'python': ['py', 'python3', 'python2'],
                'javascript': ['js', 'ecmascript', 'es6', 'es2015', 'es2020'],
                'machine_learning': ['ml', 'machine-learning', 'machinelearning'],
                'artificial_intelligence': ['ai', 'artificial-intelligence'],
                'data_science': ['data-science', 'datascience'],
                'web_development': ['web-dev', 'webdev', 'web development'],
                'node_js': ['nodejs', 'node.js', 'node'],
                'tensorflow': ['tf', 'tensor-flow'],
                'aws': ['amazon web services', 'amazon aws'],
                'csharp': ['c#', 'c sharp', 'csharp', '.net'],
                'cplusplus': ['c++', 'cpp', 'c plus plus'],
                'scikit_learn': ['sklearn', 'scikit learn', 'scikit-learn'],
                'react': ['reactjs', 'react.js'],
                'angular': ['angularjs', 'angular.js'],
                'vue_js': ['vuejs', 'vue.js', 'vue'],
                'next_js': ['nextjs', 'next.js'],
                'express_js': ['expressjs', 'express.js', 'express'],
                'rest_api': ['rest', 'restful api', 'restful'],
                'graphql': ['graph ql', 'graph-ql'],
                'mongodb': ['mongo', 'mongo db'],
                'postgresql': ['postgres', 'psql'],
                'mysql': ['my sql'],
                'nosql': ['no sql', 'no-sql'],
                'docker': ['containerization'],
                'kubernetes': ['k8s', 'k8'],
                'ci_cd': ['ci/cd', 'cicd', 'continuous integration', 'continuous deployment'],
                'azure': ['microsoft azure', 'ms azure'],
                'ios_development': ['ios', 'ios dev'],
                'android_development': ['android', 'android dev'],
                'deep_learning': ['dl', 'deep-learning'],
                'natural_language_processing': ['nlp', 'natural language processing'],
                'computer_vision': ['cv', 'computer-vision'],
            }
            
            self.categories = {
                'programming_languages': ['python', 'javascript', 'java'],
                'frameworks': ['react', 'angular', 'tensorflow', 'pytorch'],
                'cloud_platforms': ['aws', 'azure'],
                'data_science': ['machine_learning', 'data_science', 'artificial_intelligence'],
                'devops': ['docker', 'kubernetes']
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
        
        # Initialize models - Use custom trained model for better skill extraction
        import os
        model_path = os.path.join(os.path.dirname(__file__), "TrainedModel", "skills")
        try:
            self.nlp = spacy.load(model_path)
            # Add sentencizer if not present in pipeline
            if "sentencizer" not in self.nlp.pipe_names:
                self.nlp.add_pipe("sentencizer")
            self.logger = logging.getLogger(__name__)
            self.logger.info(f"✅ Loaded custom trained skill extraction model from {model_path}")
        except:
            self.nlp = spacy.load("en_core_web_sm")
            self.logger = logging.getLogger(__name__)
            self.logger.warning("⚠️ Custom model not found, falling back to en_core_web_sm")
        
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
        """Extract skills using spaCy NER (with custom trained model)"""
        doc = self.nlp(text)
        matches = []
        
        # Look for SKILL entities from custom trained model
        for ent in doc.ents:
            if ent.label_ == "SKILL":  # Custom trained model recognizes SKILL entities
                skill = self.ontology.normalize_skill(ent.text)
                if skill in self.reference_skills:
                    matches.append(SkillMatch(
                        skill=skill,
                        confidence=0.9,  # Higher confidence for custom model
                        method="spacy_custom_ner",
                        context=ent.sent.text,
                        position=(ent.start_char, ent.end_char)
                    ))
            elif ent.label_ in ["ORG", "PRODUCT", "LANGUAGE"]:  # Fallback for generic entities
                skill = self.ontology.normalize_skill(ent.text)
                if skill in self.reference_skills:
                    matches.append(SkillMatch(
                        skill=skill,
                        confidence=0.7,
                        method="spacy_generic_ner",
                        context=ent.sent.text,
                        position=(ent.start_char, ent.end_char)
                    ))
        
        # Look for noun phrases that might be skills (only if dependency parser available)
        try:
            for chunk in doc.noun_chunks:
                skill = self.ontology.normalize_skill(chunk.text)
                if skill in self.reference_skills:
                    matches.append(SkillMatch(
                        skill=skill,
                        confidence=0.6,
                        method="spacy_noun_chunk",
                        context=chunk.sent.text,
                        position=(chunk.start_char, chunk.end_char)
                    ))
        except ValueError:
            # Custom model may not have dependency parser - skip noun chunks
            pass
        
        return matches
    
    def extract_skills_fuzzy(self, text: str) -> List[SkillMatch]:
        """Extract skills using enhanced fuzzy string matching with compound skill support"""
        matches = []
        
        # First, explicitly check for special programming languages that are hard to match
        special_skills = {
            'c++': [r'c\+\+', r'cpp\b'],  # C++ variations
            'c#': [r'c#', r'csharp\b'],   # C# variations  
            'r': [r'\bR\b'],               # R language (word boundary)
        }
        
        text_lower = text.lower()
        for skill_name, patterns in special_skills.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    # For single-letter skills (R), verify context
                    if skill_name in ['r'] and len(skill_name) == 1:
                        context_window = text.lower()
                        if not any(clue in context_window for clue in ['programming', 'language', 'statistical', 'data', 'developer', 'software']):
                            continue  # Skip if no programming context
                    
                    matches.append(SkillMatch(
                        skill=skill_name,
                        confidence=0.95,
                        method="exact_match_special",
                        context=text[:100],
                        position=(0, len(skill_name))
                    ))
                    break  # Found match, no need to check other patterns for this skill
        
        # OPTIMIZED: Only extract candidates that could plausibly be skills
        # Limit to unique tokens to avoid redundant fuzzy matching
        words = list(set(re.findall(r'\b[A-Za-z][A-Za-z0-9+#.-]*\b', text)))
        
        # Only extract bigrams and trigrams for words that appear in our skill database
        # This dramatically reduces candidates
        word_tokens = re.findall(r'\b[A-Za-z][A-Za-z0-9+#.-]*\b', text)
        compound_patterns = set()
        
        # Only generate n-grams where at least one word might be skill-related
        skill_words_lower = set(word.lower() for skill in self.reference_skills for word in skill.split())
        
        for i in range(len(word_tokens)):
            word_lower = word_tokens[i].lower()
            # Only generate n-grams if this word appears in skill vocabulary
            if word_lower in skill_words_lower or len(word_lower) <= 4:  # Short words more likely to be skills
                # Bigrams
                if i < len(word_tokens) - 1:
                    compound_patterns.add(' '.join(word_tokens[i:i+2]))
                # Trigrams
                if i < len(word_tokens) - 2:
                    compound_patterns.add(' '.join(word_tokens[i:i+3]))
        
        # Combine unique words and compound patterns
        all_candidates = words + list(compound_patterns)
        
        for candidate in all_candidates:
            # Skip very short candidates that aren't special skills
            if len(candidate) < 2 and candidate.lower() not in ['r', 'c']:
                continue
                
            # Find best fuzzy match
            best_match = process.extractOne(
                candidate, 
                self.reference_skills,
                scorer=fuzz.ratio  # Faster than token_sort_ratio
            )
            
            if best_match and best_match[1] >= self.config.fuzzy_threshold:
                # Find position in text
                start_pos = text_lower.find(candidate.lower())
                end_pos = start_pos + len(candidate) if start_pos >= 0 else 0
                
                matches.append(SkillMatch(
                    skill=best_match[0],
                    confidence=best_match[1] / 100.0,
                    method="fuzzy_match_enhanced",
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
        """Extract skills using ensemble approach with weighted voting"""
        # Get matches from all methods
        spacy_matches = self.extract_skills_spacy(text)
        fuzzy_matches = self.extract_skills_fuzzy(text)
        tfidf_matches = self.extract_skills_tfidf(text)
        embedding_matches = self.extract_skills_embeddings(text)
        
        # Combine and weight matches
        skill_scores = defaultdict(list)
        
        # Add weighted scores
        for match in spacy_matches:
            skill_scores[match.skill].append(
                (match.confidence * self.config.spacy_weight, match)
            )
        
        for match in fuzzy_matches:
            skill_scores[match.skill].append(
                (match.confidence * self.config.fuzzy_weight, match)
            )
        
        for match in tfidf_matches:
            skill_scores[match.skill].append(
                (match.confidence * self.config.tfidf_weight, match)
            )
        
        for match in embedding_matches:
            skill_scores[match.skill].append(
                (match.confidence * self.config.embedding_weight, match)
            )
        
        # Calculate ensemble scores
        final_matches = []
        for skill, score_matches in skill_scores.items():
            if score_matches:
                # Weighted average confidence
                total_score = sum(score for score, _ in score_matches)
                best_match = max(score_matches, key=lambda x: x[0])[1]
                
                # Create ensemble match
                ensemble_match = SkillMatch(
                    skill=skill,
                    confidence=total_score,
                    method="ensemble",
                    context=best_match.context,
                    position=best_match.position
                )
                
                # Apply minimum confidence threshold
                if ensemble_match.confidence >= self.config.min_confidence:
                    final_matches.append(ensemble_match)
        
        # Sort by confidence
        final_matches.sort(key=lambda x: x.confidence, reverse=True)
        
        self.logger.info(f"Extracted {len(final_matches)} skills using ensemble method")
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