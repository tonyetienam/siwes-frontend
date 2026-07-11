import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const AcademicSupervisorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch students in the department
  const fetchStudents = useCallback(async () => {
    try {
      const res = await fetch('https://siwes-backend-g2kvs.onrender.com/api/academic/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStudents(data);
    } catch (err) { 
      console.error('Error fetching students:', err);
    } finally { 
      setLoading(false); 
    }
  }, [token]);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

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
          
          {!loading && students.length === 0 && (
            <p style={{color: '#718096'}}>No students assigned to your department yet.</p>
          )}

          {!loading && students.map((student) => (
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