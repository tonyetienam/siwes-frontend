import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const StudentDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [view, setView] = useState('browse');
  const [internships, setInternships] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [myLogs, setMyLogs] = useState([]);
  const [myAttendance, setMyAttendance] = useState([]);
  
  // Logbook State
  const [logContent, setLogContent] = useState('');
  const [logFile, setLogFile] = useState(null);

  // 1. Fetch Open Internships & Applications
  const fetchData = useCallback(async () => {
    try {
      // UPDATED: Added '/api' correctly to all endpoints
      const intRes = await fetch('https://siwes-backend-5l8q.onrender.com/api/internships', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const intData = await intRes.json();
      if (intRes.ok) setInternships(intData);

      const appRes = await fetch('https://siwes-backend-5l8q.onrender.com/api/applications/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const appData = await appRes.json();
      if (appRes.ok) setMyApplications(appData);
    } catch (err) { console.error(err); }
  }, [token]);

  // 2. Fetch Logs & Attendance
  const fetchActivity = useCallback(async () => {
    try {
      const logRes = await fetch('https://siwes-backend-5l8q.onrender.com/api/logbooks/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const logData = await logRes.json();
      if (logRes.ok) setMyLogs(logData);

      const attRes = await fetch('https://siwes-backend-5l8q.onrender.com/api/attendance/my', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const attData = await attRes.json();
      if (attRes.ok) setMyAttendance(attData);
    } catch (err) { console.error(err); }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  // 3. Apply for an Internship
  const handleApply = async (internshipId) => {
    if (!window.confirm('Are you sure you want to apply?')) return;
    try {
      const res = await fetch('https://siwes-backend-5l8q.onrender.com/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ internshipId })
      });
      const data = await res.json();
      if (res.ok) { alert('Application submitted!'); fetchData(); }
      else alert(data.error || 'Failed to apply.');
    } catch (err) { alert('Network error.'); }
  };

  // 4. Submit Logbook
  const handleSubmitLog = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('content', logContent);
    if (logFile) formData.append('attachment', logFile);
    
    try {
      const res = await fetch('https://siwes-backend-5l8q.onrender.com/api/logbooks', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) { alert('Logbook submitted!'); setLogContent(''); setLogFile(null); fetchActivity(); }
      else alert(data.error || 'Failed to submit log.');
    } catch (err) { alert('Network error.'); }
  };

  // 5. Check-in Attendance
  const handleCheckIn = async () => {
    try {
      const res = await fetch('https://siwes-backend-5l8q.onrender.com/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ location: 'Office/Site' })
      });
      const data = await res.json();
      if (res.ok) { alert('Checked in successfully!'); fetchActivity(); }
      else alert(data.error || 'Failed to check in.');
    } catch (err) { alert('Network error.'); }
  };

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
        <button onClick={() => setView('logbook')} className={view === 'logbook' ? 'active' : ''}>Daily Logbook</button>
        <button onClick={() => setView('attendance')} className={view === 'attendance' ? 'active' : ''}>Attendance</button>
      </nav>

      <main className="app-main">
        <div className="form-card">
          {view === 'browse' && (
            <>
              <h3>Browse Internships</h3>
              {internships.length === 0 ? (<p>No internships available.</p>) : (
                internships.map(job => (
                  <div key={job._id} style={{background: '#f7fafc', padding: '15px', marginBottom: '15px', borderRadius: '6px', borderLeft: '4px solid #3182ce', display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                      <h4>{job.title}</h4>
                      <p><strong>Company:</strong> {job.companyId ? job.companyId.name : 'Unknown'}</p>
                      <p><strong>Location:</strong> {job.location}</p>
                    </div>
                    <button onClick={() => handleApply(job._id)} className="btn-primary" style={{width: 'auto', padding: '8px 16px', fontSize: '14px', marginTop: '0'}}>Apply</button>
                  </div>
                ))
              )}
            </>
          )}

          {view === 'myApps' && (
            <>
              <h3>My Applications</h3>
              {myApplications.length === 0 ? (<p>No applications yet.</p>) : (
                myApplications.map(app => (
                  <div key={app._id} style={{background: '#f7fafc', padding: '15px', marginBottom: '15px', borderRadius: '6px', borderLeft: '4px solid #805ad5'}}>
                    <h4>{app.internshipId ? app.internshipId.title : 'Unknown'}</h4>
                    <p><strong>Company:</strong> {app.internshipId?.companyId?.name || 'N/A'}</p>
                    <span style={{padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', backgroundColor: app.status === 'Pending' ? '#fefcbf' : app.status === 'Accepted' ? '#c6f6d5' : '#fed7d7'}}>{app.status}</span>
                  </div>
                ))
              )}
            </>
          )}

          {view === 'logbook' && (
            <>
              <h3>Daily Logbook</h3>
              <form onSubmit={handleSubmitLog}>
                <textarea placeholder="What did you do today?" value={logContent} onChange={(e) => setLogContent(e.target.value)} required />
                <input type="file" onChange={(e) => setLogFile(e.target.files[0])} style={{marginBottom: '10px'}} />
                <button type="submit" className="btn-primary">Submit Log</button>
              </form>
              <hr />
              <h4>My Log History</h4>
              {myLogs.length === 0 ? (<p>No logs yet.</p>) : (
                myLogs.map(log => (
                  <div key={log._id} style={{borderBottom: '1px solid #e2e8f0', padding: '10px 0'}}>
                    <p><strong>{new Date(log.date).toLocaleDateString()}</strong></p>
                    <p>{log.content}</p>
                    {/* UPDATED: Added full Render URL for file downloads */}
                    {log.fileUrl && <a href={`https://siwes-backend-5l8q.onrender.com${log.fileUrl}`} target="_blank" rel="noreferrer">📎 View Attachment</a>}
                    <br /><span style={{color: '#718096', fontSize: '12px'}}>Status: {log.status}</span>
                  </div>
                ))
              )}
            </>
          )}

          {view === 'attendance' && (
            <>
              <h3>Attendance Record</h3>
              <button onClick={handleCheckIn} className="btn-primary" style={{width: 'auto', padding: '10px 20px', marginBottom: '20px'}}>📌 Check-In Today</button>
              {myAttendance.length === 0 ? (<p>No attendance records.</p>) : (
                myAttendance.map(att => (
                  <div key={att._id} style={{background: '#f7fafc', padding: '10px', marginBottom: '10px', borderRadius: '6px', display: 'flex', justifyContent: 'space-between'}}>
                    <span>{new Date(att.date).toLocaleDateString()}</span>
                    <span style={{color: '#38a169', fontWeight: 'bold'}}>{att.status}</span>
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
