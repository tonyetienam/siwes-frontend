import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const IndustrySupervisorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEvalModal, setShowEvalModal] = useState(false);
  const [evalStudentId, setEvalStudentId] = useState('');
  const [evalScore, setEvalScore] = useState('');
  const [evalComments, setEvalComments] = useState('');

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/applications/company', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setApplications(data);
    } catch (err) { alert('Error fetching applications.'); } finally { setLoading(false); }
  }, [token]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  // Standard Accept (No Email)
  const handleAccept = async (appId) => {
    if (!window.confirm('Accept this student? (Email will NOT be sent)')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'Accepted' })
      });
      if (res.ok) { alert('Student Accepted!'); fetchApplications(); }
    } catch (err) { alert('Network error.'); }
  };

  // Accept with Email Notification
  const handleAcceptWithEmail = async (appId) => {
    if (!window.confirm('Accept this student AND send an Email notification?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}/accept-with-email`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { 
        alert('✅ Student Accepted! Check your terminal console for the Email Preview URL.');
        fetchApplications(); 
      }
    } catch (err) { alert('Network error.'); }
  };

  const handleReject = async (appId) => {
    if (!window.confirm('Reject this application?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'Rejected' })
      });
      if (res.ok) { alert('Application Rejected.'); fetchApplications(); }
    } catch (err) { alert('Network error.'); }
  };

  // Open Evaluation Modal
  const openEvalModal = (studentId) => {
    setEvalStudentId(studentId);
    setShowEvalModal(true);
  };

  // Submit Evaluation
  const submitEvaluation = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ studentId: evalStudentId, score: evalScore, comments: evalComments })
      });
      if (res.ok) { 
        alert('Evaluation Submitted Successfully!'); 
        setShowEvalModal(false); 
        setEvalScore(''); setEvalComments('');
      } else {
        alert('Failed to submit evaluation.');
      }
    } catch (err) { alert('Network error.'); }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Industry Supervisor Dashboard</h1>
        <div className="user-info">
          <span>👤 {user.name} ({user.role})</span>
          <button onClick={logout} className="btn-danger">Logout</button>
        </div>
      </header>

      <main className="app-main">
        <div className="form-card">
          <h3>Pending Applications for Your Company</h3>
          {loading && <p>Loading applications...</p>}
          {!loading && applications.length === 0 && <p style={{color: '#718096'}}>No applications found yet. Wait for students to apply!</p>}

          {!loading && applications.map((app) => (
            <div key={app._id} style={{ background: '#f7fafc', padding: '15px', marginBottom: '15px', borderRadius: '6px', borderLeft: app.status === 'Pending' ? '4px solid #ed8936' : '4px solid #38a169' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div>
                  <h4 style={{ margin: 0 }}>{app.studentId?.name || 'Unknown'}</h4>
                  <p style={{ fontSize: '14px', color: '#4a5568', margin: '4px 0' }}>Email: {app.studentId?.email}</p>
                  <p style={{ fontSize: '14px', color: '#718096' }}>Applied for: {app.internshipId?.title}</p>
                  <div style={{ marginTop: '10px' }}>
                    <strong>Status: </strong>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: app.status === 'Pending' ? '#fefcbf' : '#c6f6d5', color: app.status === 'Pending' ? '#975a16' : '#22543d' }}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {app.status === 'Pending' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                    <button onClick={() => handleAccept(app._id)} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', background: '#3182ce' }}>✓ Accept</button>
                    <button onClick={() => handleAcceptWithEmail(app._id)} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', background: '#38a169' }}>✉️ Accept & Email</button>
                    <button onClick={() => handleReject(app._id)} style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '6px' }}>✗ Reject</button>
                  </div>
                )}
                
                {app.status === 'Accepted' && (
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={() => openEvalModal(app.studentId?._id)} className="btn-primary" style={{ width: 'auto', padding: '8px 16px', fontSize: '12px', background: '#805ad5' }}>📝 Submit Final Evaluation</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Evaluation Modal (Overlay) */}
      {showEvalModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', maxWidth: '90%' }}>
            <h3 style={{ marginTop: 0 }}>Evaluate Student Performance</h3>
            <input type="number" placeholder="Score (0-100)" value={evalScore} onChange={(e) => setEvalScore(e.target.value)} style={{ width: '100%', padding: '10px', margin: '8px 0', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
            <textarea placeholder="Enter comments..." value={evalComments} onChange={(e) => setEvalComments(e.target.value)} style={{ width: '100%', padding: '10px', margin: '8px 0', borderRadius: '6px', border: '1px solid #e2e8f0', minHeight: '100px' }} />
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowEvalModal(false)} style={{ padding: '10px 20px', background: '#a0aec0', color: 'white', border: 'none', borderRadius: '6px' }}>Cancel</button>
              <button onClick={submitEvaluation} className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IndustrySupervisorDashboard;