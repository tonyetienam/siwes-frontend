import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const AcademicSupervisorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch applications
  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('https://siwes-backend-5l8q.onrender.com/api/applications/company', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setApplications(data);
    } catch (err) { 
      console.error('Error fetching applications:', err);
    } finally { 
      setLoading(false); 
    }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📚 Academic Supervisor Dashboard</h1>
        <div className="user-info">
          <span>👤 {user.name} ({user.role})</span>
          <button onClick={logout} className="btn-danger">Logout</button>
        </div>
      </header>

      <main className="app-main">
        <div className="form-card">
          <h3>Student Oversight</h3>
          
          {loading && <p>Loading data...</p>}
          
          {!loading && applications.length === 0 && (
            <p style={{color: '#718096'}}>No student applications or logs assigned to your department yet.</p>
          )}

          {!loading && applications.map((app) => (
            <div key={app._id} style={{
              background: '#f7fafc', 
              padding: '15px', 
              marginBottom: '15px', 
              borderRadius: '6px', 
              borderLeft: '4px solid #3182ce'
            }}>
              <h4 style={{margin: '0 0 5px 0'}}>{app.studentId ? app.studentId.name : 'Unknown Student'}</h4>
              <p style={{margin: '0', fontSize: '14px', color: '#4a5568'}}>
                <strong>Email:</strong> {app.studentId ? app.studentId.email : 'N/A'}
              </p>
              <p style={{margin: '0', fontSize: '14px', color: '#4a5568'}}>
                <strong>Applied for:</strong> {app.internshipId ? app.internshipId.title : 'Unknown Position'}
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
          ))}
        </div>
      </main>
    </div>
  );
};

export default AcademicSupervisorDashboard;