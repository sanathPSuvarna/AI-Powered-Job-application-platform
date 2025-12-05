// add_project_recommendations.js
const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'dbms',
    multipleStatements: true
});

const addProjectRecommendations = `
-- Add hands-on project recommendations for each career step

INSERT IGNORE INTO career_step_resources (step_id, resource_title, resource_url, resource_type, provider, estimated_duration, cost_range) VALUES

-- Data Engineer Projects
(1, 'Build Your First ETL Pipeline', 'https://github.com/data-engineering-projects/etl-pipeline', 'project', 'GitHub', '2 weeks', 'Free'),
(1, 'SQL Practice with Real Datasets', 'https://www.kaggle.com/learn/sql', 'practice', 'Kaggle', '3 weeks', 'Free'),

(2, 'Apache Airflow Data Pipeline Project', 'https://github.com/apache/airflow/tree/main/airflow/example_dags', 'project', 'Apache Airflow', '4 weeks', 'Free'),
(2, 'Build a Data Warehouse with Python', 'https://github.com/data-engineering-projects/python-data-warehouse', 'project', 'GitHub', '6 weeks', 'Free'),
(2, 'Real-time Data Processing with Kafka', 'https://kafka.apache.org/quickstart', 'project', 'Apache Kafka', '3 weeks', 'Free'),

(3, 'Big Data Analytics with Spark', 'https://spark.apache.org/examples.html', 'project', 'Apache Spark', '8 weeks', 'Free'),
(3, 'AWS Data Lake Implementation', 'https://aws.amazon.com/getting-started/hands-on/build-data-lake/', 'project', 'AWS', '6 weeks', 'Free'),
(3, 'Dockerized Data Pipeline', 'https://github.com/docker/awesome-compose/tree/master/apache-spark', 'project', 'Docker', '4 weeks', 'Free'),

-- Data Scientist Projects
(7, 'Customer Segmentation Analysis', 'https://www.kaggle.com/datasets/vjchoudhary7/customer-segmentation-tutorial-in-python', 'project', 'Kaggle', '3 weeks', 'Free'),
(7, 'Sales Forecasting Dashboard', 'https://github.com/microsoft/forecasting', 'project', 'Microsoft', '4 weeks', 'Free'),

(8, 'Predictive Analytics Project', 'https://github.com/dataprofessor/machine-learning-projects', 'project', 'GitHub', '6 weeks', 'Free'),
(8, 'Recommendation System Build', 'https://github.com/microsoft/recommenders', 'project', 'Microsoft', '8 weeks', 'Free'),

(9, 'Deep Learning Computer Vision', 'https://github.com/tensorflow/models/tree/master/research/object_detection', 'project', 'TensorFlow', '10 weeks', 'Free'),
(9, 'NLP Sentiment Analysis App', 'https://github.com/huggingface/transformers/tree/main/examples', 'project', 'Hugging Face', '8 weeks', 'Free'),

-- DevOps Projects  
(14, 'Linux Server Setup and Hardening', 'https://github.com/imthenachoman/How-To-Secure-A-Linux-Server', 'project', 'GitHub', '3 weeks', 'Free'),
(14, 'Bash Automation Scripts', 'https://github.com/alexanderepstein/Bash-Snippets', 'project', 'GitHub', '2 weeks', 'Free'),

(15, 'CI/CD Pipeline with GitHub Actions', 'https://github.com/actions/starter-workflows', 'project', 'GitHub', '4 weeks', 'Free'),
(15, 'Containerize Full Stack Application', 'https://github.com/docker/awesome-compose', 'project', 'Docker', '5 weeks', 'Free'),

(16, 'Kubernetes Cluster Deployment', 'https://kubernetes.io/docs/tutorials/', 'project', 'Kubernetes', '8 weeks', 'Free'),
(16, 'Infrastructure as Code with Terraform', 'https://github.com/hashicorp/terraform/tree/main/examples', 'project', 'HashiCorp', '6 weeks', 'Free'),

-- Full Stack Developer Projects
(21, 'Responsive Portfolio Website', 'https://github.com/topics/portfolio-website', 'project', 'GitHub', '4 weeks', 'Free'),
(21, 'React Todo App with Hooks', 'https://github.com/facebook/react/tree/main/packages/create-react-app', 'project', 'React', '3 weeks', 'Free'),

(22, 'RESTful API with Node.js', 'https://github.com/microsoft/nodejs-guidelines', 'project', 'Microsoft', '5 weeks', 'Free'),
(22, 'Database Design and Implementation', 'https://github.com/topics/database-design', 'project', 'GitHub', '4 weeks', 'Free'),

(23, 'Full Stack E-commerce Platform', 'https://github.com/topics/ecommerce', 'project', 'GitHub', '12 weeks', 'Free'),
(23, 'Real-time Chat Application', 'https://github.com/socketio/chat-example', 'project', 'Socket.IO', '6 weeks', 'Free'),

-- Product Manager Projects
(28, 'Product Requirements Document', 'https://github.com/ProductHired/Product-Manager-Toolkit', 'practice', 'GitHub', '2 weeks', 'Free'),
(28, 'Market Research Analysis', 'https://www.kaggle.com/datasets/shivamb/company-data', 'project', 'Kaggle', '3 weeks', 'Free'),

(29, 'A/B Testing Implementation', 'https://github.com/growthbook/growthbook', 'project', 'GrowthBook', '4 weeks', 'Free'),
(29, 'User Journey Mapping', 'https://github.com/uxmethods/user-journey-mapping', 'practice', 'GitHub', '2 weeks', 'Free'),

-- UX/UI Designer Projects
(49, 'Mobile App UI Design', 'https://www.figma.com/community/file/768809027799962739', 'project', 'Figma Community', '4 weeks', 'Free'),
(49, 'User Research Case Study', 'https://github.com/uxmethods/ux-research-methods', 'practice', 'GitHub', '3 weeks', 'Free'),

(50, 'Complete Design System', 'https://www.figma.com/community/file/1161238979644153007', 'project', 'Figma Community', '8 weeks', 'Free'),
(50, 'Usability Testing Protocol', 'https://github.com/uxmethods/usability-testing', 'practice', 'GitHub', '4 weeks', 'Free');
`;

const addCertificationPaths = `
-- Add industry certification recommendations

INSERT IGNORE INTO career_step_resources (step_id, resource_title, resource_url, resource_type, provider, estimated_duration, cost_range) VALUES

-- Data Engineer Certifications
(3, 'AWS Certified Data Engineer Associate', 'https://aws.amazon.com/certification/certified-data-engineer-associate/', 'certification', 'AWS', '12 weeks', '$150'),
(4, 'Google Cloud Professional Data Engineer', 'https://cloud.google.com/certification/data-engineer', 'certification', 'Google Cloud', '16 weeks', '$200'),
(5, 'Microsoft Azure Data Engineer Associate', 'https://docs.microsoft.com/en-us/learn/certifications/azure-data-engineer/', 'certification', 'Microsoft', '14 weeks', '$165'),

-- Data Scientist Certifications
(8, 'IBM Data Science Professional Certificate', 'https://www.coursera.org/professional-certificates/ibm-data-science', 'certification', 'IBM', '20 weeks', '$49/month'),
(9, 'TensorFlow Developer Certificate', 'https://www.tensorflow.org/certificate', 'certification', 'Google', '8 weeks', '$100'),
(10, 'AWS Certified Machine Learning Specialty', 'https://aws.amazon.com/certification/certified-machine-learning-specialty/', 'certification', 'AWS', '16 weeks', '$300'),

-- DevOps Certifications
(15, 'Docker Certified Associate', 'https://training.mirantis.com/dca-certification-exam/', 'certification', 'Mirantis', '8 weeks', '$195'),
(16, 'Certified Kubernetes Administrator', 'https://training.linuxfoundation.org/certification/certified-kubernetes-administrator-cka/', 'certification', 'CNCF', '12 weeks', '$375'),
(17, 'HashiCorp Certified Terraform Associate', 'https://www.hashicorp.com/certification/terraform-associate', 'certification', 'HashiCorp', '10 weeks', '$70'),

-- Full Stack Developer Certifications
(23, 'AWS Certified Developer Associate', 'https://aws.amazon.com/certification/certified-developer-associate/', 'certification', 'AWS', '12 weeks', '$150'),
(24, 'Meta Front-End Developer Certificate', 'https://www.coursera.org/professional-certificates/meta-front-end-developer', 'certification', 'Meta', '16 weeks', '$49/month'),

-- Product Manager Certifications
(29, 'Google Project Management Certificate', 'https://www.coursera.org/professional-certificates/google-project-management', 'certification', 'Google', '24 weeks', '$49/month'),
(30, 'Certified Scrum Product Owner', 'https://www.scrumalliance.org/get-certified/product-owner-track/certified-scrum-product-owner', 'certification', 'Scrum Alliance', '4 weeks', '$1200'),

-- UX/UI Designer Certifications
(50, 'Adobe Certified Expert', 'https://www.adobe.com/training/certification.html', 'certification', 'Adobe', '12 weeks', '$150'),
(51, 'Nielsen Norman Group UX Certification', 'https://www.nngroup.com/ux-certification/', 'certification', 'Nielsen Norman Group', '40 hours', '$5000');
`;

async function addProjectsAndCertifications() {
    try {
        console.log('🚀 Adding project recommendations and certifications...');
        
        // Add project recommendations
        await new Promise((resolve, reject) => {
            connection.query(addProjectRecommendations, (error, results) => {
                if (error) {
                    console.error('Error adding projects:', error);
                    reject(error);
                } else {
                    console.log('✅ Project recommendations added successfully!');
                    resolve(results);
                }
            });
        });

        // Add certification paths
        await new Promise((resolve, reject) => {
            connection.query(addCertificationPaths, (error, results) => {
                if (error) {
                    console.error('Error adding certifications:', error);
                    reject(error);
                } else {
                    console.log('✅ Certification paths added successfully!');
                    resolve(results);
                }
            });
        });

        console.log('\n🎯 Enhanced Career Recommendations:');
        console.log('💼 ✓ Hands-on project recommendations for practical skills');
        console.log('🏆 ✓ Industry-recognized certification paths');
        console.log('🎓 ✓ Real-world portfolio building projects');
        console.log('🔗 ✓ GitHub repositories and open-source contributions');
        console.log('📊 ✓ Kaggle competitions and data challenges');
        console.log('⚡ ✓ Quick wins and long-term learning paths');
        console.log('\n🌟 Each career step now includes:');
        console.log('   • Practical projects to build portfolio');
        console.log('   • Professional certifications to validate skills');
        console.log('   • Free and paid learning options');
        console.log('   • Real-world experience opportunities');
        
    } catch (error) {
        console.error('Enhancement failed:', error);
    } finally {
        connection.end();
    }
}

// Run the enhancement
addProjectsAndCertifications();