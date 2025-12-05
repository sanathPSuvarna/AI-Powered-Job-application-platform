#!/usr/bin/env python3
"""
Advanced Resume Generator with Wide Skill Diversity
Generates 4000+ realistic resumes across multiple domains and experience levels
"""

import random
import json
from datetime import datetime, timedelta
from typing import List, Dict
import os

# Comprehensive skill database across multiple domains
SKILL_DATABASE = {
    'programming_languages': [
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Go', 'Rust', 
        'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'R', 'MATLAB', 'Perl', 
        'Dart', 'Objective-C', 'Shell Scripting', 'PowerShell', 'VBA', 'Lua',
        'Groovy', 'Elixir', 'Haskell', 'Clojure', 'F#', 'Julia'
    ],
    
    'web_frontend': [
        'React', 'Angular', 'Vue.js', 'Svelte', 'Next.js', 'Nuxt.js', 'Gatsby',
        'HTML5', 'CSS3', 'Sass', 'LESS', 'Tailwind CSS', 'Bootstrap', 'Material-UI',
        'Redux', 'MobX', 'Webpack', 'Vite', 'jQuery', 'Backbone.js', 'Ember.js',
        'Web Components', 'PWA', 'Responsive Design', 'Cross-browser Compatibility'
    ],
    
    'web_backend': [
        'Node.js', 'Express.js', 'Django', 'Flask', 'FastAPI', 'Spring Boot',
        'ASP.NET Core', 'Laravel', 'Ruby on Rails', 'Phoenix', 'NestJS',
        'GraphQL', 'REST API', 'gRPC', 'WebSockets', 'Microservices',
        'Serverless', 'API Gateway', 'OAuth', 'JWT', 'Session Management'
    ],
    
    'databases': [
        'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Cassandra', 'DynamoDB',
        'Oracle', 'SQL Server', 'SQLite', 'MariaDB', 'CouchDB', 'Neo4j',
        'Elasticsearch', 'InfluxDB', 'TimescaleDB', 'Firebase', 'Supabase',
        'Database Design', 'Query Optimization', 'Data Modeling', 'NoSQL',
        'ACID Transactions', 'Sharding', 'Replication', 'Indexing'
    ],
    
    'cloud_platforms': [
        'AWS', 'Azure', 'Google Cloud Platform', 'IBM Cloud', 'Oracle Cloud',
        'AWS Lambda', 'AWS EC2', 'AWS S3', 'AWS RDS', 'Azure Functions',
        'Azure DevOps', 'Google Kubernetes Engine', 'Cloud Storage',
        'Cloud CDN', 'Cloud IAM', 'Cloud Monitoring', 'Serverless Framework'
    ],
    
    'devops_tools': [
        'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'GitHub Actions',
        'CircleCI', 'Travis CI', 'Terraform', 'Ansible', 'Puppet', 'Chef',
        'Vagrant', 'Helm', 'ArgoCD', 'Prometheus', 'Grafana', 'ELK Stack',
        'Datadog', 'New Relic', 'Splunk', 'CI/CD', 'Infrastructure as Code'
    ],
    
    'ml_ai': [
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Keras',
        'scikit-learn', 'XGBoost', 'LightGBM', 'Natural Language Processing',
        'Computer Vision', 'Neural Networks', 'CNN', 'RNN', 'LSTM', 'GAN',
        'Transformer Models', 'BERT', 'GPT', 'Object Detection', 'Image Classification',
        'Reinforcement Learning', 'MLOps', 'Model Deployment', 'Feature Engineering',
        'Hyperparameter Tuning', 'A/B Testing', 'Statistical Analysis'
    ],
    
    'data_science': [
        'Data Analysis', 'Data Visualization', 'Pandas', 'NumPy', 'Matplotlib',
        'Seaborn', 'Plotly', 'Tableau', 'Power BI', 'Apache Spark', 'Hadoop',
        'Apache Kafka', 'Apache Airflow', 'ETL', 'Data Warehousing', 'Big Data',
        'Data Mining', 'Predictive Analytics', 'Time Series Analysis', 'Jupyter',
        'Statistical Modeling', 'Hypothesis Testing', 'Data Cleaning'
    ],
    
    'mobile_development': [
        'iOS Development', 'Android Development', 'React Native', 'Flutter',
        'Xamarin', 'Ionic', 'SwiftUI', 'Jetpack Compose', 'Mobile UI/UX',
        'App Store Optimization', 'Push Notifications', 'In-App Purchases',
        'Firebase', 'Mobile Security', 'Offline Storage', 'Location Services'
    ],
    
    'testing_qa': [
        'Unit Testing', 'Integration Testing', 'End-to-End Testing', 'Jest',
        'Mocha', 'Pytest', 'JUnit', 'Selenium', 'Cypress', 'TestNG',
        'Test Automation', 'Performance Testing', 'Load Testing', 'Security Testing',
        'API Testing', 'Postman', 'JMeter', 'Test-Driven Development', 'BDD'
    ],
    
    'security': [
        'Cybersecurity', 'Network Security', 'Application Security', 'Penetration Testing',
        'Vulnerability Assessment', 'OWASP', 'SSL/TLS', 'Encryption', 'Firewalls',
        'SIEM', 'Threat Modeling', 'Security Auditing', 'Compliance', 'GDPR',
        'SOC 2', 'ISO 27001', 'Risk Assessment', 'Incident Response'
    ],
    
    'blockchain': [
        'Blockchain', 'Ethereum', 'Solidity', 'Smart Contracts', 'Web3.js',
        'Cryptocurrency', 'DeFi', 'NFT', 'Hyperledger', 'Bitcoin', 'Consensus Algorithms',
        'Cryptography', 'Distributed Ledger', 'Token Economics'
    ],
    
    'game_development': [
        'Unity', 'Unreal Engine', 'Game Design', 'C++ Game Development',
        '3D Modeling', 'Blender', 'Maya', 'Animation', 'Physics Engine',
        'Game AI', 'Multiplayer Networking', 'VR/AR Development'
    ],
    
    'soft_skills': [
        'Leadership', 'Team Collaboration', 'Communication', 'Problem Solving',
        'Critical Thinking', 'Project Management', 'Agile', 'Scrum', 'Kanban',
        'Time Management', 'Mentoring', 'Code Review', 'Technical Writing',
        'Presentation Skills', 'Stakeholder Management', 'Client Relations'
    ],
    
    'specialized': [
        'IoT', 'Edge Computing', 'Embedded Systems', 'RTOS', 'Microcontrollers',
        'Arduino', 'Raspberry Pi', 'Quantum Computing', 'Robotics', 'Automation',
        'CAD', 'GIS', 'Signal Processing', 'Image Processing', 'Audio Processing',
        'Video Processing', 'Streaming Technologies', 'WebRTC', 'HLS', 'RTMP'
    ]
}

# Job titles by experience level
JOB_TITLES = {
    'junior': [
        'Junior Software Engineer', 'Associate Developer', 'Junior Data Analyst',
        'Junior DevOps Engineer', 'Junior Frontend Developer', 'Junior Backend Developer',
        'Graduate Engineer', 'Trainee Software Engineer', 'Junior QA Engineer',
        'Associate Data Scientist', 'Junior Mobile Developer', 'Junior ML Engineer'
    ],
    'mid': [
        'Software Engineer', 'Full Stack Developer', 'Data Scientist', 'DevOps Engineer',
        'Frontend Developer', 'Backend Developer', 'Mobile Developer', 'QA Engineer',
        'Machine Learning Engineer', 'Data Engineer', 'Cloud Engineer', 'Security Engineer',
        'Database Administrator', 'Systems Engineer', 'Network Engineer'
    ],
    'senior': [
        'Senior Software Engineer', 'Senior Data Scientist', 'Senior DevOps Engineer',
        'Senior Full Stack Developer', 'Senior Frontend Developer', 'Senior Backend Developer',
        'Lead Engineer', 'Principal Engineer', 'Senior ML Engineer', 'Senior Cloud Architect',
        'Senior Security Engineer', 'Senior QA Lead', 'Technical Lead'
    ],
    'lead': [
        'Engineering Manager', 'Technical Lead', 'Team Lead', 'Staff Engineer',
        'Principal Software Engineer', 'Architect', 'Solutions Architect', 'Data Architect',
        'Cloud Architect', 'Security Architect', 'Director of Engineering', 'VP of Engineering',
        'CTO', 'Head of Data Science', 'Head of DevOps'
    ]
}

# Companies
COMPANIES = [
    'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'SpaceX',
    'IBM', 'Oracle', 'Intel', 'NVIDIA', 'Adobe', 'Salesforce', 'SAP', 'Cisco',
    'TCS', 'Infosys', 'Wipro', 'Cognizant', 'Accenture', 'Capgemini', 'HCL',
    'Tech Mahindra', 'Startup Inc', 'Innovation Labs', 'Digital Solutions Corp',
    'CloudTech Systems', 'AI Innovations', 'DataDrive Inc', 'CodeCraft LLC',
    'ByteForge Technologies', 'NextGen Software', 'Quantum Solutions'
]

# Universities
UNIVERSITIES = [
    'MIT', 'Stanford University', 'Harvard University', 'UC Berkeley', 'CMU',
    'Georgia Tech', 'University of Washington', 'IIT Bombay', 'IIT Delhi', 'IIT Madras',
    'BITS Pilani', 'NIT Trichy', 'Delhi University', 'Mumbai University', 'Pune University',
    'VIT', 'SRM University', 'Manipal Institute', 'Anna University', 'Jadavpur University'
]

# Degrees
DEGREES = {
    'bachelor': ['Bachelor of Technology', 'Bachelor of Engineering', 'Bachelor of Science in Computer Science', 'B.Tech CSE', 'B.E. IT'],
    'master': ['Master of Technology', 'Master of Science in Computer Science', 'M.Tech CSE', 'MS in Data Science', 'MBA'],
    'phd': ['Ph.D. in Computer Science', 'Ph.D. in Machine Learning', 'Ph.D. in Data Science']
}

# Certifications
CERTIFICATIONS = [
    'AWS Certified Solutions Architect', 'Google Cloud Professional', 'Azure Administrator',
    'Kubernetes Administrator', 'Docker Certified Associate', 'CISSP', 'CEH',
    'PMP', 'Scrum Master', 'Product Owner', 'Machine Learning Specialization',
    'Deep Learning Specialization', 'TensorFlow Developer', 'Full Stack Development',
    'Data Science Professional', 'Python for Data Science', 'Java SE Programmer'
]

class ResumeGenerator:
    def __init__(self):
        self.generated_count = 0
        
    def generate_name(self) -> str:
        """Generate random name"""
        first_names = ['Aarav', 'Vivaan', 'Aditya', 'Arjun', 'Sai', 'Aryan', 'Reyansh', 'Ayaan',
                      'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Vedant',
                      'Ananya', 'Diya', 'Anvi', 'Aadhya', 'Sara', 'Pari', 'Navya', 'Anika',
                      'John', 'Michael', 'David', 'James', 'Robert', 'William', 'Richard',
                      'Emily', 'Sarah', 'Jessica', 'Lisa', 'Jennifer', 'Maria', 'Emma']
        
        last_names = ['Sharma', 'Kumar', 'Singh', 'Patel', 'Gupta', 'Reddy', 'Nair', 'Iyer',
                     'Mehta', 'Shah', 'Joshi', 'Desai', 'Kulkarni', 'Rao', 'Verma', 'Agarwal',
                     'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller',
                     'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Wilson', 'Anderson']
        
        return f"{random.choice(first_names)} {random.choice(last_names)}"
    
    def generate_email(self, name: str) -> str:
        """Generate email from name"""
        name_parts = name.lower().replace(' ', '.')
        domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'email.com']
        return f"{name_parts}{random.randint(1, 999)}@{random.choice(domains)}"
    
    def generate_phone(self) -> str:
        """Generate phone number"""
        return f"+91-{random.randint(70000, 99999)}{random.randint(10000, 99999)}"
    
    def select_skills(self, experience_level: str, num_skills: int) -> List[str]:
        """Select appropriate skills based on experience level"""
        all_skills = []
        
        # Weight categories based on experience
        if experience_level == 'junior':
            # Junior: Focus on fundamentals
            weights = {
                'programming_languages': 3,
                'web_frontend': 2,
                'web_backend': 2,
                'databases': 2,
                'testing_qa': 1,
                'soft_skills': 2
            }
        elif experience_level == 'mid':
            # Mid: Broader range
            weights = {
                'programming_languages': 3,
                'web_frontend': 2,
                'web_backend': 2,
                'databases': 2,
                'cloud_platforms': 2,
                'devops_tools': 1,
                'testing_qa': 1,
                'soft_skills': 2,
                'ml_ai': 1,
                'data_science': 1
            }
        elif experience_level == 'senior':
            # Senior: Advanced skills
            weights = {
                'programming_languages': 2,
                'web_frontend': 1,
                'web_backend': 2,
                'databases': 2,
                'cloud_platforms': 3,
                'devops_tools': 2,
                'ml_ai': 2,
                'data_science': 2,
                'security': 1,
                'soft_skills': 3
            }
        else:  # lead
            # Lead: Management + Architecture
            weights = {
                'programming_languages': 1,
                'cloud_platforms': 3,
                'devops_tools': 2,
                'ml_ai': 2,
                'data_science': 2,
                'security': 2,
                'soft_skills': 4,
                'specialized': 1
            }
        
        # Select skills based on weights
        for category, weight in weights.items():
            if category in SKILL_DATABASE:
                category_skills = random.sample(
                    SKILL_DATABASE[category],
                    min(weight, len(SKILL_DATABASE[category]))
                )
                all_skills.extend(category_skills)
        
        # Add random skills from other categories
        remaining = num_skills - len(all_skills)
        if remaining > 0:
            other_categories = [cat for cat in SKILL_DATABASE.keys() if cat not in weights]
            for cat in random.sample(other_categories, min(remaining // 2, len(other_categories))):
                all_skills.extend(random.sample(SKILL_DATABASE[cat], min(2, len(SKILL_DATABASE[cat]))))
        
        return random.sample(all_skills, min(num_skills, len(all_skills)))
    
    def generate_experience(self, level: str) -> List[Dict]:
        """Generate work experience"""
        if level == 'junior':
            num_jobs = random.randint(0, 2)
            years_range = (0, 2)
        elif level == 'mid':
            num_jobs = random.randint(1, 3)
            years_range = (2, 5)
        elif level == 'senior':
            num_jobs = random.randint(2, 4)
            years_range = (5, 10)
        else:  # lead
            num_jobs = random.randint(3, 5)
            years_range = (10, 20)
        
        experiences = []
        current_date = datetime.now()
        
        for i in range(num_jobs):
            # Calculate dates
            years_ago = random.randint(years_range[0], years_range[1]) + i * 2
            start_date = current_date - timedelta(days=365 * years_ago)
            
            if i == 0:  # Current job
                end_date = None
                duration_months = random.randint(6, 36)
            else:
                duration_months = random.randint(12, 36)
                end_date = start_date + timedelta(days=30 * duration_months)
            
            exp = {
                'company': random.choice(COMPANIES),
                'title': random.choice(JOB_TITLES[level]),
                'start_date': start_date.strftime('%B %Y'),
                'end_date': end_date.strftime('%B %Y') if end_date else 'Present',
                'duration_months': duration_months
            }
            experiences.append(exp)
        
        return experiences
    
    def generate_education(self, level: str) -> List[Dict]:
        """Generate education details"""
        education = []
        
        # Bachelor's degree (all levels)
        education.append({
            'degree': random.choice(DEGREES['bachelor']),
            'university': random.choice(UNIVERSITIES),
            'year': random.randint(2010, 2023),
            'gpa': round(random.uniform(7.0, 9.5), 2)
        })
        
        # Master's degree for senior and lead
        if level in ['senior', 'lead']:
            if random.random() > 0.3:
                education.append({
                    'degree': random.choice(DEGREES['master']),
                    'university': random.choice(UNIVERSITIES),
                    'year': random.randint(2015, 2024),
                    'gpa': round(random.uniform(7.5, 9.8), 2)
                })
        
        # PhD for lead
        if level == 'lead' and random.random() > 0.7:
            education.append({
                'degree': random.choice(DEGREES['phd']),
                'university': random.choice(UNIVERSITIES),
                'year': random.randint(2018, 2024)
            })
        
        return education
    
    def generate_certifications(self, level: str) -> List[str]:
        """Generate certifications"""
        if level == 'junior':
            num_certs = random.randint(0, 2)
        elif level == 'mid':
            num_certs = random.randint(1, 3)
        elif level == 'senior':
            num_certs = random.randint(2, 5)
        else:  # lead
            num_certs = random.randint(3, 6)
        
        return random.sample(CERTIFICATIONS, min(num_certs, len(CERTIFICATIONS)))
    
    def generate_resume(self, experience_level: str = None) -> Dict:
        """Generate a complete resume"""
        if not experience_level:
            experience_level = random.choice(['junior', 'mid', 'senior', 'lead'])
        
        # Determine number of skills based on experience
        if experience_level == 'junior':
            num_skills = random.randint(5, 12)
        elif experience_level == 'mid':
            num_skills = random.randint(10, 20)
        elif experience_level == 'senior':
            num_skills = random.randint(15, 30)
        else:  # lead
            num_skills = random.randint(20, 40)
        
        name = self.generate_name()
        
        resume = {
            'id': self.generated_count + 1,
            'name': name,
            'email': self.generate_email(name),
            'phone': self.generate_phone(),
            'experience_level': experience_level,
            'skills': self.select_skills(experience_level, num_skills),
            'experience': self.generate_experience(experience_level),
            'education': self.generate_education(experience_level),
            'certifications': self.generate_certifications(experience_level),
            'summary': self.generate_summary(experience_level)
        }
        
        self.generated_count += 1
        return resume
    
    def generate_summary(self, level: str) -> str:
        """Generate professional summary"""
        summaries = {
            'junior': [
                "Motivated software developer with strong foundation in programming and eagerness to learn",
                "Recent graduate with hands-on experience in modern web technologies",
                "Passionate developer with solid understanding of software engineering principles"
            ],
            'mid': [
                "Experienced software engineer with proven track record in full-stack development",
                "Results-driven developer with expertise in building scalable applications",
                "Professional software engineer specializing in modern web technologies"
            ],
            'senior': [
                "Senior software engineer with extensive experience in architecting large-scale systems",
                "Highly skilled technical leader with deep expertise in cloud technologies",
                "Accomplished engineer with strong background in system design and team leadership"
            ],
            'lead': [
                "Engineering leader with proven track record of delivering complex technical solutions",
                "Strategic technical leader with expertise in architecture and team management",
                "Visionary technology leader with experience scaling engineering organizations"
            ]
        }
        return random.choice(summaries[level])

def generate_resume_dataset(total_resumes: int = 4000, output_file: str = 'generated_resumes.json'):
    """Generate large dataset of diverse resumes"""
    generator = ResumeGenerator()
    resumes = []
    
    # Distribution of experience levels
    distribution = {
        'junior': 0.35,  # 35%
        'mid': 0.35,     # 35%
        'senior': 0.20,  # 20%
        'lead': 0.10     # 10%
    }
    
    print(f"🚀 Generating {total_resumes} diverse resumes...")
    
    for level, percentage in distribution.items():
        count = int(total_resumes * percentage)
        print(f"  📝 Generating {count} {level} level resumes...")
        
        for i in range(count):
            resume = generator.generate_resume(level)
            resumes.append(resume)
            
            if (i + 1) % 100 == 0:
                print(f"    ✓ Generated {i + 1}/{count} {level} resumes")
    
    # Save to JSON
    print(f"\n💾 Saving resumes to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(resumes, f, indent=2, ensure_ascii=False)
    
    # Generate statistics
    stats = {
        'total_resumes': len(resumes),
        'experience_distribution': {},
        'total_unique_skills': len(set(skill for resume in resumes for skill in resume['skills'])),
        'avg_skills_per_resume': sum(len(r['skills']) for r in resumes) / len(resumes),
        'total_companies': len(set(exp['company'] for resume in resumes for exp in resume['experience'])),
        'total_universities': len(set(edu['university'] for resume in resumes for edu in resume['education']))
    }
    
    for level in distribution.keys():
        count = sum(1 for r in resumes if r['experience_level'] == level)
        stats['experience_distribution'][level] = count
    
    print("\n📊 Dataset Statistics:")
    print(f"  Total Resumes: {stats['total_resumes']}")
    print(f"  Unique Skills: {stats['total_unique_skills']}")
    print(f"  Avg Skills/Resume: {stats['avg_skills_per_resume']:.2f}")
    print(f"  Experience Distribution:")
    for level, count in stats['experience_distribution'].items():
        print(f"    {level}: {count} ({count/stats['total_resumes']*100:.1f}%)")
    
    print(f"\n✅ Dataset generation complete!")
    print(f"📁 Saved to: {output_file}")
    
    return resumes, stats

if __name__ == "__main__":
    # Generate 4000 resumes
    resumes, stats = generate_resume_dataset(
        total_resumes=4000,
        output_file='generated_resumes_4000.json'
    )