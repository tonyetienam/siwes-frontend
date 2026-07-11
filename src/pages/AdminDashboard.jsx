import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import '../App.css';

const AdminDashboard = () => {
  const { token, logout } = useContext(AuthContext);
  const [view, setView] = useState('users');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [logs, setLogs] = useState([]);

  // 1. Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('https://siwes-backend-5l8q.onrender.com/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  }, [token]);

  // 2. Fetch Stats for Charts
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('https://siwes-backend-5l8q.onrender.com/api/admin/dashboard/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, [token]);

  // 3. Fetch Recent Activity Logs
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch('https://siwes-backend-5l8q.onrender.com/api/admin/logs/recent', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setLogs(data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchLogs();
  }, [fetchUsers, fetchStats, fetchLogs]);

  const updateRole = async (id, newRole) => {
    try {
      const res = await fetch(`https://siwes-backend-5l8q.onrender.com/api/admin/users/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) { 
        alert('Role updated!'); 
        fetchUsers(); 
      } else {
        alert('Failed to update role.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await fetch(`https://siwes-backend-5l8q.onrender.com/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { 
        alert('User deleted!'); 
        fetchUsers(); 
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      alert('Network error.');
    }
  };

  // Chart Data
  const pieData = [
    { name: 'Pending', value: stats.pendingApps || 0 },
    { name: 'Accepted', value: stats.acceptedApps || 0 },
    { name: 'Rejected', value: stats.rejectedApps || 0 }
  ];
  const COLORS = ['#f6ad55', '#48bb78', '#fc8181'];

  return (
    <div className="app-container">
      <header className="app-header">
        <h2>👑 Admin Control Panel</h2>
        <button onClick={logout} className="btn-danger">Logout</button>
      </header>

      {/* NEW CLICKABLE TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
        <button 
          onClick={() => setView('users')} 
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '6px', 
            border: view === 'users' ? '2px solid #3182ce' : '1px solid #e2e8f0',
            backgroundColor: view === 'users' ? '#ebf8ff' : 'transparent',
            fontWeight: view === 'users' ? 'bold' : 'normal',
            cursor: 'pointer',
            color: view === 'users' ? '#2b6cb0' : '#4a5568'
          }}
        >
          Manage Users
        </button>
        <button 
          onClick={() => setView('analytics')} 
          style={{ 
            flex: 1, 
            padding: '10px', 
            borderRadius: '6px', 
            border: view === 'analytics' ? '2px solid #3182ce' : '1px solid #e2e8f0',
            backgroundColor: view === 'analytics' ? '#ebf8ff' : 'transparent',
            fontWeight: view === 'analytics' ? 'bold' : 'normal',
            cursor: 'pointer',
            color: view === 'analytics' ? '#2b6cb0' : '#4a5568'
          }}
        >
          Analytics Dashboard
        </button>
      </div>

      <main className="app-main">
        <div className="form-card">

          {/* --- VIEW 1: MANAGE USERS --- */}
          {view === 'users' && (
            <div className="table-container">
              <h3>Manage System Users</h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>
                        <select 
                          className="role-select" 
                          defaultValue={u.role} 
                          onChange={(e) => updateRole(u._id, e.target.value)}
                        >
                          <option value="student">Student</option>
                          <option value="admin">Admin</option>
                          <option value="company_hr">Company HR</option>
                          <option value="industry_supervisor">Industry Supervisor</option>
                          <option value="academic_supervisor">Academic Supervisor</option>
                          <option value="department_coordinator">Dept. Coordinator</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => deleteUser(u._id)} className="delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* --- VIEW 2: ANALYTICS & LOGS --- */}
          {view === 'analytics' && (
            <>
              <h3>System Analytics & Activity Log</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: '#ebf8ff', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ margin: 0, color: '#2b6cb0' }}>{stats.totalStudents || 0}</h4>
                  <small>Total Students</small>
                </div>
                <div style={{ background: '#f0fff4', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ margin: 0, color: '#22543d' }}>{stats.totalInternships || 0}</h4>
                  <small>Active Internships</small>
                </div>
                <div style={{ background: '#fffaf0', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
                  <h4 style={{ margin: 0, color: '#9c4221' }}>{stats.pendingApps || 0}</h4>
                  <small>Pending Approvals</small>
                </div>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', marginBottom: '40px' }}>
                {/* Pie Chart */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4>Application Status Breakdown</h4>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" innerRadius={40} outerRadius={80}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Activity Log */}
                <div style={{ flex: 1, minWidth: '250px' }}>
                  <h4>Recent Activity Log</h4>
                  {logs.length === 0 ? (
                    <p style={{ color: '#718096' }}>No recent actions.</p>
                  ) : (
                    logs.map(log => (
                      <div key={log._id} style={{ borderBottom: '1px solid #e2e8f0', padding: '8px 0', fontSize: '14px' }}>
                        <strong>{log.studentId?.name || 'Unknown Student'}</strong> was{' '}
                        <span style={{ fontWeight: 'bold', color: log.status === 'Accepted' ? '#38a169' : '#e53e3e' }}>
                          {log.status}
                        </span>
                        {' '}for <em>{log.internshipId?.title || 'an internship'}</em>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;