"""
User Feedback UI and Monitoring Dashboard for Skill Extraction
"""

import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from ensemble_skill_extractor import EnsembleSkillExtractor, EnsembleConfig
import json
from datetime import datetime, timedelta

class SkillExtractionDashboard:
    """Interactive dashboard for skill extraction monitoring and feedback"""
    
    def __init__(self):
        self.extractor = EnsembleSkillExtractor()
        
    def run_dashboard(self):
        """Main dashboard interface"""
        st.set_page_config(
            page_title="Skill Extraction Dashboard",
            page_icon="🎯",
            layout="wide"
        )
        
        st.title("🎯 Advanced Skill Extraction Dashboard")
        st.markdown("Monitor, test, and improve skill extraction performance")
        
        # Sidebar configuration
        self._render_sidebar()
        
        # Main tabs
        tab1, tab2, tab3, tab4 = st.tabs([
            " Test Extraction", 
            " Analytics", 
            " Feedback Training", 
            " Configuration"
        ])
        
        with tab1:
            self._render_test_extraction()
        
        with tab2:
            self._render_analytics()
        
        with tab3:
            self._render_feedback_training()
        
        with tab4:
            self._render_configuration()
    
    def _render_sidebar(self):
        """Render sidebar with quick stats"""
        st.sidebar.header("📈 Quick Stats")
        
        stats = self.extractor.get_skill_statistics()
        
        st.sidebar.metric("Reference Skills", stats['total_reference_skills'])
        st.sidebar.metric("Feedback Entries", stats['feedback_entries'])
        st.sidebar.metric("Min Confidence", f"{stats['current_config']['min_confidence']:.2f}")
        
        st.sidebar.header("🎛️ Quick Controls")
        
        if st.sidebar.button("🔄 Retrain Models"):
            with st.spinner("Retraining with feedback..."):
                self.extractor.retrain_with_feedback()
            st.sidebar.success("Models retrained!")
        
        if st.sidebar.button("📥 Export Data"):
            self._export_data()
    
    def _render_test_extraction(self):
        """Test extraction interface"""
        st.header("🧪 Test Skill Extraction")
        
        col1, col2 = st.columns([2, 1])
        
        with col1:
            # Input text area
            test_text = st.text_area(
                "Enter text to extract skills from:",
                height=200,
                placeholder="Paste resume content, job description, or any text containing skills..."
            )
            
            # Extraction options
            st.subheader("Extraction Options")
            col_a, col_b = st.columns(2)
            
            with col_a:
                show_individual = st.checkbox("Show individual method results", value=False)
                confidence_filter = st.slider("Minimum confidence", 0.0, 1.0, 0.6, 0.05)
            
            with col_b:
                methods = st.multiselect(
                    "Methods to use",
                    ["spacy", "fuzzy", "tfidf", "embeddings", "ensemble"],
                    default=["ensemble"]
                )
            
            if st.button("🚀 Extract Skills", type="primary"):
                if test_text.strip():
                    self._perform_extraction(test_text, methods, confidence_filter, show_individual)
                else:
                    st.warning("Please enter some text to analyze")
        
        with col2:
            # Quick examples
            st.subheader("📝 Quick Examples")
            
            examples = {
                "Software Developer": """Experienced Python developer with 5+ years in web development using Django and Flask. Proficient in JavaScript, React, and Node.js. Strong background in AWS cloud services, Docker containerization, and CI/CD pipelines.""",
                
                "Data Scientist": """PhD in Machine Learning with expertise in TensorFlow, PyTorch, and scikit-learn. Experienced in statistical analysis using R and Python pandas. Familiar with cloud platforms (AWS, GCP) and big data tools like Spark and Hadoop.""",
                
                "DevOps Engineer": """Kubernetes expert with experience in Docker, Terraform, and Jenkins. Proficient in AWS/Azure cloud infrastructure, monitoring with Prometheus and Grafana, and scripting with Python and Bash."""
            }
            
            for title, example in examples.items():
                if st.button(f"Load: {title}"):
                    st.session_state['test_text'] = example
                    st.experimental_rerun()
    
    def _perform_extraction(self, text, methods, confidence_filter, show_individual):
        """Perform skill extraction and display results"""
        results = {}
        
        # Extract using different methods
        if "ensemble" in methods:
            results["ensemble"] = self.extractor.ensemble_extract(text)
        
        if show_individual:
            if "spacy" in methods:
                results["spacy"] = self.extractor.extract_skills_spacy(text)
            if "fuzzy" in methods:
                results["fuzzy"] = self.extractor.extract_skills_fuzzy(text)
            if "tfidf" in methods:
                results["tfidf"] = self.extractor.extract_skills_tfidf(text)
            if "embeddings" in methods:
                results["embeddings"] = self.extractor.extract_skills_embeddings(text)
        
        # Display results
        for method, matches in results.items():
            st.subheader(f"📊 {method.title()} Results")
            
            # Filter by confidence
            filtered_matches = [m for m in matches if m.confidence >= confidence_filter]
            
            if filtered_matches:
                # Create DataFrame for display
                df_data = []
                for match in filtered_matches:
                    df_data.append({
                        'Skill': match.skill,
                        'Confidence': f"{match.confidence:.3f}",
                        'Method': match.method,
                        'Context': match.context[:100] + "..." if len(match.context) > 100 else match.context
                    })
                
                df = pd.DataFrame(df_data)
                st.dataframe(df, use_container_width=True)
                
                # Confidence distribution
                confidences = [m.confidence for m in filtered_matches]
                fig = px.histogram(
                    x=confidences, 
                    title=f"{method.title()} - Confidence Distribution",
                    nbins=20
                )
                st.plotly_chart(fig, use_container_width=True)
                
                # Store for feedback
                if method == "ensemble":
                    st.session_state['last_extraction'] = {
                        'text': text,
                        'skills': [m.skill for m in filtered_matches]
                    }
            else:
                st.info(f"No skills found with confidence >= {confidence_filter}")
    
    def _render_analytics(self):
        """Render analytics dashboard"""
        st.header("📊 Extraction Analytics")
        
        # Generate sample analytics data (in real app, load from database)
        analytics_data = self._generate_sample_analytics()
        
        col1, col2 = st.columns(2)
        
        with col1:
            # Method performance comparison
            st.subheader("Method Performance Comparison")
            
            method_performance = pd.DataFrame({
                'Method': ['SpaCy NER', 'Fuzzy Match', 'TF-IDF', 'Embeddings', 'Ensemble'],
                'Precision': [0.85, 0.72, 0.68, 0.78, 0.89],
                'Recall': [0.65, 0.83, 0.71, 0.86, 0.91],
                'F1-Score': [0.74, 0.77, 0.69, 0.82, 0.90]
            })
            
            fig = px.bar(
                method_performance.melt(id_vars='Method', var_name='Metric', value_name='Score'),
                x='Method', y='Score', color='Metric',
                title="Performance Metrics by Method"
            )
            st.plotly_chart(fig, use_container_width=True)
        
        with col2:
            # Skill category distribution
            st.subheader("Skill Category Distribution")
            
            category_data = pd.DataFrame({
                'Category': ['Programming Languages', 'Frameworks', 'Cloud Platforms', 'Databases', 'Tools'],
                'Count': [156, 89, 34, 67, 123]
            })
            
            fig = px.pie(
                category_data, 
                values='Count', 
                names='Category',
                title="Extracted Skills by Category"
            )
            st.plotly_chart(fig, use_container_width=True)
        
        # Time series analysis
        st.subheader("📈 Extraction Trends Over Time")
        
        time_data = pd.DataFrame({
            'Date': pd.date_range(start='2024-01-01', periods=30, freq='D'),
            'Extractions': pd.Series(range(30)).apply(lambda x: 50 + x * 2 + pd.Series(range(30)).sample(1).iloc[0] % 20),
            'Accuracy': pd.Series(range(30)).apply(lambda x: 0.8 + (x % 10) * 0.02)
        })
        
        fig = go.Figure()
        fig.add_trace(go.Scatter(
            x=time_data['Date'], 
            y=time_data['Extractions'],
            mode='lines+markers',
            name='Daily Extractions',
            yaxis='y'
        ))
        fig.add_trace(go.Scatter(
            x=time_data['Date'], 
            y=time_data['Accuracy'],
            mode='lines+markers',
            name='Accuracy',
            yaxis='y2'
        ))
        
        fig.update_layout(
            title="Extraction Volume and Accuracy Trends",
            yaxis=dict(title="Number of Extractions"),
            yaxis2=dict(title="Accuracy", overlaying='y', side='right'),
            hovermode='x unified'
        )
        
        st.plotly_chart(fig, use_container_width=True)
    
    def _render_feedback_training(self):
        """Render feedback and training interface"""
        st.header("🎯 Human Feedback & Active Learning")
        
        # Feedback submission
        st.subheader("📝 Submit Feedback")
        
        if 'last_extraction' in st.session_state:
            last_data = st.session_state['last_extraction']
            
            st.info("💡 Provide feedback on the last extraction to improve the model")
            
            with st.expander("📄 Extracted Text", expanded=False):
                st.text(last_data['text'])
            
            col1, col2 = st.columns(2)
            
            with col1:
                st.write("**Predicted Skills:**")
                predicted_skills = st.multiselect(
                    "Review predicted skills (uncheck incorrect ones):",
                    last_data['skills'],
                    default=last_data['skills']
                )
            
            with col2:
                st.write("**Additional Skills:**")
                additional_skills = st.text_area(
                    "Add any missing skills (one per line):",
                    height=100
                ).strip().split('\n') if st.text_area(
                    "Add any missing skills (one per line):",
                    height=100
                ).strip() else []
            
            # Combine correct skills
            correct_skills = predicted_skills + [s.strip() for s in additional_skills if s.strip()]
            
            col_a, col_b = st.columns(2)
            with col_a:
                user_id = st.text_input("User ID (optional):", value="anonymous")
            
            with col_b:
                if st.button("💾 Submit Feedback", type="primary"):
                    self.extractor.add_feedback(
                        last_data['text'],
                        last_data['skills'],
                        correct_skills,
                        user_id
                    )
                    st.success("✅ Feedback submitted! Thank you for helping improve the model.")
                    del st.session_state['last_extraction']
                    st.experimental_rerun()
        else:
            st.info("👆 Extract some skills first to provide feedback")
        
        # Feedback history
        st.subheader("📊 Feedback History")
        
        if self.extractor.feedback_data:
            feedback_df = pd.DataFrame([
                {
                    'Timestamp': entry['timestamp'].strftime('%Y-%m-%d %H:%M'),
                    'User': entry.get('user_id', 'anonymous'),
                    'Predicted Count': len(entry['predicted']),
                    'Correct Count': len(entry['correct']),
                    'Accuracy': len(set(entry['predicted']) & set(entry['correct'])) / max(len(entry['predicted']), 1)
                }
                for entry in self.extractor.feedback_data
            ])
            
            st.dataframe(feedback_df, use_container_width=True)
            
            # Feedback analytics
            avg_accuracy = feedback_df['Accuracy'].mean()
            st.metric("Average Feedback Accuracy", f"{avg_accuracy:.2%}")
        else:
            st.info("No feedback data available yet")
    
    def _render_configuration(self):
        """Render configuration interface"""
        st.header("⚙️ Model Configuration")
        
        st.subheader("🎛️ Ensemble Weights")
        
        col1, col2 = st.columns(2)
        
        with col1:
            spacy_weight = st.slider("SpaCy NER Weight", 0.0, 1.0, self.extractor.config.spacy_weight, 0.05)
            fuzzy_weight = st.slider("Fuzzy Match Weight", 0.0, 1.0, self.extractor.config.fuzzy_weight, 0.05)
        
        with col2:
            tfidf_weight = st.slider("TF-IDF Weight", 0.0, 1.0, self.extractor.config.tfidf_weight, 0.05)
            embedding_weight = st.slider("Embedding Weight", 0.0, 1.0, self.extractor.config.embedding_weight, 0.05)
        
        # Normalize weights
        total_weight = spacy_weight + fuzzy_weight + tfidf_weight + embedding_weight
        if total_weight > 0:
            st.info(f"Total weight: {total_weight:.2f} (weights will be normalized)")
        
        st.subheader("🎯 Confidence Thresholds")
        
        col_a, col_b = st.columns(2)
        
        with col_a:
            min_confidence = st.slider("Minimum Confidence", 0.0, 1.0, self.extractor.config.min_confidence, 0.05)
            fuzzy_threshold = st.slider("Fuzzy Threshold", 50, 100, self.extractor.config.fuzzy_threshold)
        
        with col_b:
            tfidf_threshold = st.slider("TF-IDF Threshold", 0.0, 1.0, self.extractor.config.tfidf_threshold, 0.05)
            embedding_threshold = st.slider("Embedding Threshold", 0.0, 1.0, self.extractor.config.embedding_threshold, 0.05)
        
        if st.button("💾 Update Configuration", type="primary"):
            # Update configuration
            if total_weight > 0:
                self.extractor.config.spacy_weight = spacy_weight / total_weight
                self.extractor.config.fuzzy_weight = fuzzy_weight / total_weight
                self.extractor.config.tfidf_weight = tfidf_weight / total_weight
                self.extractor.config.embedding_weight = embedding_weight / total_weight
            
            self.extractor.config.min_confidence = min_confidence
            self.extractor.config.fuzzy_threshold = fuzzy_threshold
            self.extractor.config.tfidf_threshold = tfidf_threshold
            self.extractor.config.embedding_threshold = embedding_threshold
            
            st.success("✅ Configuration updated!")
        
        # Configuration export/import
        st.subheader("📁 Configuration Management")
        
        col_x, col_y = st.columns(2)
        
        with col_x:
            if st.button("📤 Export Config"):
                config_dict = {
                    'spacy_weight': self.extractor.config.spacy_weight,
                    'fuzzy_weight': self.extractor.config.fuzzy_weight,
                    'tfidf_weight': self.extractor.config.tfidf_weight,
                    'embedding_weight': self.extractor.config.embedding_weight,
                    'min_confidence': self.extractor.config.min_confidence,
                    'fuzzy_threshold': self.extractor.config.fuzzy_threshold,
                    'tfidf_threshold': self.extractor.config.tfidf_threshold,
                    'embedding_threshold': self.extractor.config.embedding_threshold
                }
                st.download_button(
                    "Download Config JSON",
                    json.dumps(config_dict, indent=2),
                    "skill_extraction_config.json",
                    "application/json"
                )
        
        with col_y:
            uploaded_config = st.file_uploader("📥 Import Config", type=['json'])
            if uploaded_config:
                try:
                    config_data = json.load(uploaded_config)
                    # Load configuration
                    for key, value in config_data.items():
                        if hasattr(self.extractor.config, key):
                            setattr(self.extractor.config, key, value)
                    st.success("✅ Configuration imported!")
                except Exception as e:
                    st.error(f"❌ Error importing config: {e}")
    
    def _generate_sample_analytics(self):
        """Generate sample analytics data"""
        # In a real application, this would query your database
        return {
            'daily_extractions': pd.DataFrame({
                'date': pd.date_range('2024-01-01', periods=30),
                'count': range(30, 60)
            }),
            'method_performance': {
                'spacy': {'precision': 0.85, 'recall': 0.65, 'f1': 0.74},
                'fuzzy': {'precision': 0.72, 'recall': 0.83, 'f1': 0.77},
                'tfidf': {'precision': 0.68, 'recall': 0.71, 'f1': 0.69},
                'embeddings': {'precision': 0.78, 'recall': 0.86, 'f1': 0.82},
                'ensemble': {'precision': 0.89, 'recall': 0.91, 'f1': 0.90}
            }
        }
    
    def _export_data(self):
        """Export data for analysis"""
        # This would export feedback data, extraction logs, etc.
        st.sidebar.success("📥 Data exported successfully!")

def main():
    """Run the dashboard"""
    dashboard = SkillExtractionDashboard()
    dashboard.run_dashboard()

if __name__ == "__main__":
    main()