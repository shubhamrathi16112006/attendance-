const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ─── Simple Password Hashing (no bcrypt needed) ───────────────────────────────
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'attendx_salt_2024').digest('hex');
}

// ─── In-Memory Users Store ────────────────────────────────────────────────────
let users = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@attendx.com',
    passwordHash: hashPassword('admin123'),
    role: 'admin',
    avatar: 'AU',
    createdAt: new Date().toISOString(),
  }
];

// Active sessions: token → { userId, createdAt }
let sessions = {};

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.slice(7);
  const session = sessions[token];
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  const user = users.find(u => u.id === session.userId);
  if (!user) {
    delete sessions[token];
    return res.status(401).json({ error: 'User not found' });
  }
  req.user = user;
  req.token = token;
  next();
}

// ─── Auth Routes ──────────────────────────────────────────────────────────────

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const initials = name.trim().split(/\s+/).map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const user = {
    id: uuidv4(),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash: hashPassword(password),
    role: 'user',
    avatar: initials,
    createdAt: new Date().toISOString(),
  };

  users.push(user);

  // Auto-login after register
  const token = uuidv4();
  sessions[token] = { userId: user.id, createdAt: new Date().toISOString() };

  const { passwordHash, ...safeUser } = user;
  res.status(201).json({ token, user: safeUser, message: 'Account created successfully' });
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  if (user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = uuidv4();
  sessions[token] = { userId: user.id, createdAt: new Date().toISOString() };

  const { passwordHash, ...safeUser } = user;
  res.json({ token, user: safeUser, message: 'Logged in successfully' });
});

// POST /api/auth/logout
app.post('/api/auth/logout', requireAuth, (req, res) => {
  delete sessions[req.token];
  res.json({ message: 'Logged out successfully' });
});

// GET /api/auth/me — verify token & get current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  const { passwordHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

// ─── In-Memory Data Store ─────────────────────────────────────────────────────

let employees = [
  { id: 'e1', name: 'Arjun Mehta',   department: 'Engineering', role: 'Senior Developer',   email: 'arjun@company.com',  avatar: 'AM' },
  { id: 'e2', name: 'Priya Sharma',  department: 'Design',      role: 'UI/UX Lead',          email: 'priya@company.com',  avatar: 'PS' },
  { id: 'e3', name: 'Rahul Verma',   department: 'Marketing',   role: 'Marketing Manager',   email: 'rahul@company.com',  avatar: 'RV' },
  { id: 'e4', name: 'Sneha Patel',   department: 'HR',          role: 'HR Specialist',       email: 'sneha@company.com',  avatar: 'SP' },
  { id: 'e5', name: 'Kiran Nair',    department: 'Engineering', role: 'Backend Engineer',    email: 'kiran@company.com',  avatar: 'KN' },
  { id: 'e6', name: 'Divya Reddy',   department: 'Finance',     role: 'Financial Analyst',   email: 'divya@company.com',  avatar: 'DR' },
  { id: 'e7', name: 'Amit Joshi',    department: 'Engineering', role: 'DevOps Engineer',     email: 'amit@company.com',   avatar: 'AJ' },
  { id: 'e8', name: 'Meera Iyer',    department: 'Design',      role: 'Product Designer',    email: 'meera@company.com',  avatar: 'MI' },
];

function generateAttendance() {
  const records = [];
  const today = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    employees.forEach(emp => {
      const rand = Math.random();
      let status, checkIn, checkOut;
      if (rand < 0.75) {
        status = 'present';
        checkIn  = `${String(8  + Math.floor(Math.random()*2)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`;
        checkOut = `${String(17 + Math.floor(Math.random()*2)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`;
      } else if (rand < 0.88) {
        status = 'late';
        checkIn  = `${String(10 + Math.floor(Math.random()*2)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`;
        checkOut = `${String(18 + Math.floor(Math.random()*2)).padStart(2,'0')}:${String(Math.floor(Math.random()*60)).padStart(2,'0')}`;
      } else if (rand < 0.94) {
        status = 'absent'; checkIn = null; checkOut = null;
      } else {
        status = 'leave';  checkIn = null; checkOut = null;
      }
      records.push({ id: uuidv4(), employeeId: emp.id, date: dateStr, status, checkIn, checkOut, note: '' });
    });
  }
  return records;
}

let attendance = generateAttendance();

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: '✅ AttendX API is running',
    version: '2.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'POST /api/auth/logout',
      'GET  /api/auth/me',
      'GET  /api/employees',
      'POST /api/employees',
      'DELETE /api/employees/:id',
      'GET  /api/attendance',
      'POST /api/attendance',
      'PUT  /api/attendance/:id',
      'GET  /api/stats',
      'GET  /api/trend',
    ]
  });
});

// ─── Employee Routes (protected) ─────────────────────────────────────────────

app.get('/api/employees', requireAuth, (req, res) => {
  res.json(employees);
});

app.post('/api/employees', requireAuth, (req, res) => {
  const { name, department, role, email } = req.body;
  if (!name || !department || !role || !email)
    return res.status(400).json({ error: 'All fields required' });
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const emp = { id: uuidv4(), name, department, role, email, avatar: initials };
  employees.push(emp);
  res.status(201).json(emp);
});

app.delete('/api/employees/:id', requireAuth, (req, res) => {
  employees = employees.filter(e => e.id !== req.params.id);
  attendance = attendance.filter(a => a.employeeId !== req.params.id);
  res.json({ success: true });
});

// ─── Attendance Routes (protected) ───────────────────────────────────────────

app.get('/api/attendance', requireAuth, (req, res) => {
  const { date, employeeId, month } = req.query;
  let filtered = [...attendance];
  if (date)       filtered = filtered.filter(a => a.date === date);
  if (employeeId) filtered = filtered.filter(a => a.employeeId === employeeId);
  if (month)      filtered = filtered.filter(a => a.date.startsWith(month));
  const enriched = filtered.map(a => ({ ...a, employee: employees.find(e => e.id === a.employeeId) || null }));
  res.json(enriched);
});

app.post('/api/attendance', requireAuth, (req, res) => {
  const { employeeId, date, status, checkIn, checkOut, note } = req.body;
  if (!employeeId || !date || !status)
    return res.status(400).json({ error: 'employeeId, date, status required' });
  attendance = attendance.filter(a => !(a.employeeId === employeeId && a.date === date));
  const record = { id: uuidv4(), employeeId, date, status, checkIn: checkIn||null, checkOut: checkOut||null, note: note||'' };
  attendance.push(record);
  res.status(201).json({ ...record, employee: employees.find(e => e.id === employeeId)||null });
});

app.put('/api/attendance/:id', requireAuth, (req, res) => {
  const idx = attendance.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Record not found' });
  attendance[idx] = { ...attendance[idx], ...req.body };
  res.json({ ...attendance[idx], employee: employees.find(e => e.id === attendance[idx].employeeId)||null });
});

// ─── Stats & Trend (protected) ───────────────────────────────────────────────

app.get('/api/stats', requireAuth, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayRecords = attendance.filter(a => a.date === today);
  const present = todayRecords.filter(a => a.status === 'present').length;
  const late    = todayRecords.filter(a => a.status === 'late').length;
  const absent  = todayRecords.filter(a => a.status === 'absent').length;
  const onLeave = todayRecords.filter(a => a.status === 'leave').length;
  const currentMonth = today.slice(0, 7);
  const monthlyRecords = attendance.filter(a => a.date.startsWith(currentMonth));
  const totalWorkingDays = [...new Set(monthlyRecords.map(a => a.date))].length;
  const departmentStats = {};
  employees.forEach(emp => {
    if (!departmentStats[emp.department]) departmentStats[emp.department] = { total: 0, present: 0 };
    departmentStats[emp.department].total++;
  });
  monthlyRecords.filter(a => a.status === 'present' || a.status === 'late').forEach(a => {
    const emp = employees.find(e => e.id === a.employeeId);
    if (emp && departmentStats[emp.department]) departmentStats[emp.department].present++;
  });
  res.json({ today: { present, late, absent, onLeave, total: employees.length }, monthly: { totalWorkingDays, records: monthlyRecords.length }, departmentStats, totalEmployees: employees.length });
});

app.get('/api/trend', requireAuth, (req, res) => {
  const today = new Date();
  const trend = [];
  for (let d = 6; d >= 0; d--) {
    const date = new Date(today);
    date.setDate(today.getDate() - d);
    const dateStr = date.toISOString().split('T')[0];
    const dayRecords = attendance.filter(a => a.date === dateStr);
    trend.push({
      date: dateStr,
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      present: dayRecords.filter(a => a.status === 'present').length,
      late:    dayRecords.filter(a => a.status === 'late').length,
      absent:  dayRecords.filter(a => a.status === 'absent').length,
      leave:   dayRecords.filter(a => a.status === 'leave').length,
    });
  }
  res.json(trend);
});

app.listen(PORT, () => {
  console.log(`✅ AttendX API v2.0 running at http://localhost:${PORT}`);
  console.log(`   Default login: admin@attendx.com / admin123`);
});
