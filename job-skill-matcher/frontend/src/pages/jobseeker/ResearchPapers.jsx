import React, { useState, useEffect } from 'react';
import './ResearchPapers.css';

const ResearchPapers = () => {
    const [papers, setPapers] = useState([]);
    const [newPaper, setNewPaper] = useState({
        title: '',
        publication_date: '',
        journal_name: '',
        paper_url: ''
    });

    useEffect(() => {
        fetchPapers();
    }, []);

    const fetchPapers = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/research-papers', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPapers(data);
            }
        } catch (error) {
            console.error('Error fetching papers:', error);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewPaper(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/research-papers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newPaper)
            });

            if (response.ok) {
                fetchPapers();
                setNewPaper({
                    title: '',
                    publication_date: '',
                    journal_name: '',
                    paper_url: ''
                });
            }
        } catch (error) {
            console.error('Error adding paper:', error);
        }
    };

    const handleDelete = async (paperId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/research-papers/${paperId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                setPapers(papers.filter(paper => paper.paper_id !== paperId));
            }
        } catch (error) {
            console.error('Error deleting paper:', error);
        }
    };

    return (
        <div className="research-papers-container">
            <h2>Research Papers</h2>

            {/* Add New Paper Form */}
            <div className="add-paper-form">
                <h3>Add New Research Paper</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="title">Title:</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={newPaper.title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="publication_date">Publication Date:</label>
                        <input
                            type="date"
                            id="publication_date"
                            name="publication_date"
                            value={newPaper.publication_date}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="journal_name">Journal Name:</label>
                        <input
                            type="text"
                            id="journal_name"
                            name="journal_name"
                            value={newPaper.journal_name}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="paper_url">Paper URL:</label>
                        <input
                            type="url"
                            id="paper_url"
                            name="paper_url"
                            value={newPaper.paper_url}
                            onChange={handleInputChange}
                        />
                    </div>

                    <button type="submit" className="add-btn">
                        Add Paper
                    </button>
                </form>
            </div>

            {/* Papers List */}
            <div className="papers-list">
                <h3>My Research Papers</h3>
                {papers.length === 0 ? (
                    <p>No research papers added yet.</p>
                ) : (
                    papers.map(paper => (
                        <div key={paper.paper_id} className="paper-item">
                            <h4>{paper.title}</h4>
                            <p><strong>Published:</strong> {new Date(paper.publication_date).toLocaleDateString()}</p>
                            <p><strong>Journal:</strong> {paper.journal_name}</p>
                            {paper.paper_url && (
                                <p>
                                    <strong>URL:</strong> 
                                    <a href={paper.paper_url} target="_blank" rel="noopener noreferrer">
                                        View Paper
                                    </a>
                                </p>
                            )}
                            <button 
                                onClick={() => handleDelete(paper.paper_id)}
                                className="delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ResearchPapers;
