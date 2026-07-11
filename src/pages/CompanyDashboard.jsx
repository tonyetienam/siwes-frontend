import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const CompanyDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [view, setView] = useState('dashboard');
  const [company, setCompany] = useState({ name: '', address: '', industry: '', description: '', contactEmail: user.email });
  const [internship, setInternship] = useState({ title: '', description: '', requirements: '', location: '', deadline: '' });
  const [myInternships, setMyInternships] = useState([]);

  // Define fetchMyInternships with useCallback
  const fetchMyInternships = useCallback(async () => {
    try {
      const res = await fetch('https://siwes-backend-5l8q.onrender.com/api/internships/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMyInternships(data);
    } catch (err) {
      console.error("Error fetching internships:", err);
    }
  }, [token]);

  // Fetch internships on load
  useEffect(() => {
    fetchMyInternships();
  }, [fetchMyInternships]);

  const handleApiCall = async (url, data, method = 'POST') => {
    try {
      const res = await fetch(`https://siwes-backend-5l8q.onrender.com${url}`, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      if (res.ok) {
        alert(result.message || 'Success!');
        fetchMyInternships(); // Refresh list after posting
        setView('dashboard');
        setInternship({ title: '', description: '', requirements: '', location: '', deadline: '' });
      } else {
        alert('Error: ' + (result.error || 'Something went wrong'));
      }
    } catch (err) {
      alert('Error connecting to backend.');
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Company HR Dashboard</h1>
        <div className="user-info">
          <span>👤 {user.name} ({user.role})</span>
          <button onClick={logout} className="btn-danger">Logout</button>
        </div>
      </header>

      <nav className="app-nav">
        <button onClick={() => setView('dashboard')} className={view === 'dashboard' ? 'active' : ''}>Dashboard</button>
        <button onClick={() => setView('registerCompany')} className={view === 'registerCompany' ? 'active' : ''}>Register Company</button>
        <button onClick={() => setView('postInternship')} className={view === 'postInternship' ? 'active' : ''}>Post Internship</button>
        <button onClick={() => setView('myInternships')} className={view === 'myInternships' ? 'active' : ''}>My Postings</button>
      </nav>

      <main className="app-main">
        <div className="form-card">
          {view === 'dashboard' && (
            <>
              <h3>Welcome, {user.name}!</h3>
              <p>Use the menu above to manage your company profile and post new internships.</p>
            </>
          )}

          {view === 'registerCompany' && (
            <>
              <h3>Register Your Company</h3>
              <input placeholder="Company Name" value={company.name} onChange={(e) => setCompany({...company, name: e.target.value})} />
              <input placeholder="Address" value={company.address} onChange={(e) => setCompany({...company, address: e.target.value})} />
              <input placeholder="Industry (e.g. Tech, Engineering)" value={company.industry} onChange={(e) => setCompany({...company, industry: e.target.value})} />
              <textarea placeholder="Company Description" value={company.description} onChange={(e) => setCompany({...company, description: e.target.value})} />
              <button onClick={() => handleApiCall('/api/company/register', company)} className="btn-primary">Register Company</button>
            </>
          )}

          {view === 'postInternship' && (
            <>
              <h3>Post New Internship</h3>
              <input placeholder="Internship Title" value={internship.title} onChange={(e) => setInternship({...internship, title: e.target.value})} />
              <textarea placeholder="Job Description" value={internship.description} onChange={(e) => setInternship({...internship, description: e.target.value})} />
              <textarea placeholder="Requirements" value={internship.requirements} onChange={(e) => setInternship({...internship, requirements: e.target.value})} />
              <input placeholder="Location" value={internship.location} onChange={(e) => setInternship({...internship, location: e.target.value})} />
              <input type="date" placeholder="Application Deadline" value={internship.deadline} onChange={(e) => setInternship({...internship, deadline: e.target.value})} />
              <button onClick={() => handleApiCall('/api/internships', internship)} className="btn-primary">Post Internship</button>
            </>
          )}

          {view === 'myInternships' && (
            <>
              <h3>My Posted Internships</h3>
              {myInternships.length === 0 ? (
                <p style={{color: '#718096'}}>You haven't posted any internships yet.</p>
              ) : (
                myInternships.map((job) => (
                  <div key={job._id} style={{background: '#f7fafc', padding: '15px', marginBottom: '15px', borderRadius: '6px', borderLeft: '4px solid #38a169'}}>
                    <h4 style={{margin: '0 0 5px 0'}}>{job.title}</h4>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                    <p style={{fontSize: '0.95em', color: '#4a5568'}}><strong>Status:</strong> <span style={{color: job.status === 'Open' ? '#38a169' : '#e53e3e'}}>{job.status}</span></p>
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

export default CompanyDashboard;