import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const StudentDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [view, setView] = useState('browse');
  const [internships, setInternships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Fetch Open Internships
  const fetchInternships = async () => {
    const res = await fetch('http://localhost:5000/api/internships', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setInternships(data);
  };

  // 2. Fetch My Applications
  const fetchMyApplications = async () => {
    const res = await fetch('http://localhost:5000/api/applications/my', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setMyApplications(data);
  };

  useEffect(() => {
    fetchInternships();
    fetchMyApplications();
  }, []);

  // 3. Apply for an Internship
  const handleApply = async (internshipId) => {
    if (!window.confirm('Are you sure you want to apply for this internship?')) return;
    
    try {
      const res = await fetch('http://localhost:5000/api/applications', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ internshipId })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Application submitted successfully!');
        fetchMyApplications(); // Refresh applications list
      } else {
        alert(data.error || 'Failed to apply.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  // Filter internships by title or company name
  const filteredInternships = internships.filter((job) => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.companyId && job.companyId.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Student Dashboard</h1>
        <div className="user-info">
          <span>👤 {user.name} ({user.role})</span>
          <button onClick={logout} className="btn-danger">Logout</button>
        </div>
      </header>

      <nav className="app-nav">
        <button onClick={() => setView('browse')} className={view === 'browse' ? 'active' : ''}>Browse Internships</button>
        <button onClick={() => setView('myApps')} className={view === 'myApps' ? 'active' : ''}>My Applications</button>
      </nav>

      <main className="app-main">
        <div className="form-card">
          
          {/* BROWSE INTERNSHIPS VIEW */}
          {view === 'browse' && (
            <>
              <h3>Available Internships</h3>
              <input 
                type="text" 
                placeholder="Search by title or company..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{marginBottom: '20px', width: '100%'}}
              />
              
              {filteredInternships.length === 0 ? (
                <p style={{color: '#718096'}}>No internships available at the moment.</p>
              ) : (
                filteredInternships.map((job) => (
                  <div key={job._id} style={{background: '#f7fafc', padding: '15px', marginBottom: '15px', borderRadius: '6px', borderLeft: '4px solid #3182ce', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <h4 style={{margin: '0 0 5px 0'}}>{job.title}</h4>
                      <p style={{margin: '0', fontSize: '14px', color: '#4a5568'}}>
                        <strong>Company:</strong> {job.companyId ? job.companyId.name : 'Unknown'}
                      </p>
                      <p style={{margin: '0', fontSize: '14px', color: '#718096'}}>
                        <strong>Location:</strong> {job.location}
                      </p>
                    </div>
                    <button 
                      onClick={() => handleApply(job._id)} 
                      className="btn-primary"
                      style={{width: 'auto', padding: '8px 16px', fontSize: '14px', marginTop: '0'}}
                    >
                      Apply Now
                    </button>
                  </div>
                ))
              )}
            </>
          )}

          {/* MY APPLICATIONS VIEW */}
          {view === 'myApps' && (
            <>
              <h3>My Application History</h3>
              {myApplications.length === 0 ? (
                <p style={{color: '#718096'}}>You haven't applied for any internships yet.</p>
              ) : (
                myApplications.map((app) => (
                  <div key={app._id} style={{background: '#f7fafc', padding: '15px', marginBottom: '15px', borderRadius: '6px', borderLeft: '4px solid #805ad5'}}>
                    <h4 style={{margin: '0 0 5px 0'}}>{app.internshipId ? app.internshipId.title : 'Unknown Position'}</h4>
                    <p style={{margin: '0', fontSize: '14px', color: '#4a5568'}}>
                      <strong>Company:</strong> {app.internshipId && app.internshipId.companyId ? app.internshipId.companyId.name : 'N/A'}
                    </p>
                    <p style={{margin: '0', fontSize: '14px', color: '#4a5568'}}>
                      <strong>Applied on:</strong> {new Date(app.appliedDate).toLocaleDateString()}
                    </p>
                    <div style={{marginTop: '10px'}}>
                      <strong>Status: </strong>
                      <span style={{
                        padding: '4px 12px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: 'bold',
                        backgroundColor: app.status === 'Pending' ? '#fefcbf' : app.status === 'Accepted' ? '#c6f6d5' : '#fed7d7',
                        color: app.status === 'Pending' ? '#975a16' : app.status === 'Accepted' ? '#22543d' : '#9b2c2c'
                      }}>
                        {app.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;