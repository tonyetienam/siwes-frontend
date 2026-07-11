import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const DeptCoordinatorDashboard = () => {
  const { user, token, logout } = useContext(AuthContext);
  const [students, setStudents] = useState([]);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    const res = await fetch('http://localhost:5000/api/dept/students', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) setStudents(data);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>📋 Department Coordinator Dashboard</h1>
        <div className="user-info">
          <span>👤 {user.name} ({user.department})</span>
          <button onClick={logout} className="btn-danger">Logout</button>
        </div>
      </header>
      <main className="app-main">
        <div className="form-card">
          <h3>Students in Your Department</h3>
          {students.length === 0 ? <p>No students assigned to this department.</p> : (
            students.map(s => <div key={s._id} style={{padding: '10px', borderBottom: '1px solid #eee'}}>{s.name} ({s.email})</div>)
          )}
        </div>
      </main>
    </div>
  );
};
export default DeptCoordinatorDashboard;