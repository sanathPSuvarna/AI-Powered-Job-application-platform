const ProfileSummary = ({ profile }) => {
    if (!profile) {
        return <div>Loading profile...</div>;
    }

    return (
        <div className="profile-summary">
            <div className="profile-header">
                <h3>{profile.first_name} {profile.last_name}</h3>
            </div>
            
            <div className="profile-details">
                <div className="detail-item">
                    <label>Professional Status:</label>
                    <span>{profile.professional_status}</span>
                </div>
                experience_years:    
                {profile.experience_years && (
                    <div className="detail-item">
                        <label>Experience:</label>
                        <span>{profile.experience_years} years</span>
                    </div>
                )}
                
                {profile.bio && (
                    <div className="detail-item">
                        <label>Bio:</label>
                        <p>{profile.bio}</p>
                    </div>
                )}
                
                {profile.resume_url && (
                    <div className="detail-item">
                        <label>Resume:</label>
                        <a href={profile.resume_url} target="_blank" rel="noopener noreferrer">
                            View Resume
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileSummary;
