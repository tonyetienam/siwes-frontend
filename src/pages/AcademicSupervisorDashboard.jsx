import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const AcademicSupervisorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      // SAFETY CHECK: If user has no department, stop and show message
      if (!user.department) {
        setLoading(false);
        setError("You do not have a department assigned. Please contact an Admin.");
        return;
      }

      try {
        const res = await fetch('https://siwes-backend-g2kvs.onrender.com/api/academic/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setStudents(data);
        } else {
          setError(data.error || 'Failed to fetch students.');
        }
      } catch (err) {
        setError('Network error connecting to the backend.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [token, user.department]);

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
          <h3>Students in Your Department</h3>
          
          {loading && <p>Loading students...</p>}
          
          {error && (
            <div style={{ background: '#fed7d7', padding: '15px', borderRadius: '6px', color: '#9b2c2c', marginBottom: '15px' }}>
              <strong>Notice:</strong> {error}
            </div>
          )}

          {!loading && !error && students.length === 0 && (
            <p style={{color: '#718096'}}>No students assigned to your department yet.</p>
          )}

          {!loading && !error && students.map((student) => (
            <div key={student._id} style={{
              background: '#f7fafc', 
              padding: '15px', 
              marginBottom: '15px', 
              borderRadius: '6px', 
              borderLeft: '4px solid #3182ce'
            }}>
              <h4 style={{margin: '0 0 5px 0'}}>{student.name}</h4>
              <p style={{margin: '0', fontSize: '14px', color: '#4a5568'}}>
                <strong>Email:</strong> {student.email}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AcademicSupervisorDashboard;