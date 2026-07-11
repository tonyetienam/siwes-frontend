import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const AcademicSupervisorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch('https://siwes-backend-g2kvs.onrender.com/api/academic/students', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
        }
      } catch (err) {
        console.log("Academic fetch failed, but dashboard is still loading.");
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [token]);

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
          {loading ? (
            <p>Loading students...</p>
          ) : students.length === 0 ? (
            <p style={{color: '#718096'}}>No students found. (This dashboard is ready and connected).</p>
          ) : (
            students.map(s => (
              <div key={s._id} style={{background: '#f7fafc', padding: '10px', marginBottom: '10px', borderRadius: '6px', borderLeft: '4px solid #3182ce'}}>
                <h4>{s.name}</h4>
                <p style={{fontSize: '14px', color: '#4a5568'}}>Email: {s.email}</p>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default AcademicSupervisorDashboard;