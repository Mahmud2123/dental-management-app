// server.js - Main Express Server
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database initialization
const dbPath = path.join(__dirname, 'dental.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
    initializeDatabase();
    seedDatabase();
  }
});

// Initialize database tables
function initializeDatabase() {
  // Users table for authentication
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Patients table
  db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      phone TEXT,
      address TEXT,
      blood_group TEXT,
      genotype TEXT,
      occupation TEXT,
      religion TEXT,
      state TEXT,
      nationality TEXT DEFAULT 'Nigerian',
      marital_status TEXT,
      next_of_kin TEXT,
      past_dental_history TEXT,
      family_history TEXT,
      past_medical_history TEXT,
      rhesus TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Treatments table
  db.run(`
    CREATE TABLE IF NOT EXISTS treatments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      patient_name TEXT,
      date TEXT NOT NULL,
      treatment1 TEXT,
      treatment2 TEXT,
      treatment3 TEXT,
      treatment4 TEXT,
      treatment5 TEXT,
      treatment6 TEXT,
      treatment7 TEXT,
      extra_oral TEXT,
      intra_oral TEXT,
      treatment_plan TEXT,
      next_treatment_date TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
  `);

  // Payments table
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      patient_name TEXT,
      address TEXT,
      treatment TEXT,
      amount DECIMAL(10,2) NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT DEFAULT 'Cash',
      status TEXT DEFAULT 'Completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
  `);
  // Appointments table
  db.run(`
    CREATE TABLE IF NOT EXISTS appointments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id TEXT NOT NULL,
      patient_name TEXT,
      treatment TEXT,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT DEFAULT 'scheduled',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (patient_id) REFERENCES patients (id)
    )
  `);

  // Create default admin user
  const defaultPassword = bcrypt.hashSync('dada', 10);
  db.run(`
    INSERT OR IGNORE INTO users (username, password, role) 
    VALUES ('atinukeade', ?, 'admin')
  `, [defaultPassword]);

  console.log('Database tables initialized');
}

// Seed database with Nigerian data
function seedDatabase() {
  // Nigerian names and data for seeding
  const nigerianNames = [
    'Chinwe Okoro', 'Adebola Johnson', 'Ngozi Eze', 'Chinedu Okafor', 'Amina Mohammed',
    'Tunde Williams', 'Funke Adebayo', 'Emeka Nwankwo', 'Zainab Abdullahi', 'Oluwatobi Brown'
  ];
  
  const nigerianStates = ['Lagos', 'Abuja', 'Kano', 'Rivers', 'Oyo', 'Edo', 'Delta', 'Enugu', 'Kaduna', 'Ogun'];
  const occupations = ['Teacher', 'Engineer', 'Doctor', 'Business Owner', 'Farmer', 'Student', 'Civil Servant', 'Nurse', 'Accountant', 'Lawyer'];
  const religions = ['Christianity', 'Islam', 'Traditional', 'Other'];
  const treatments = ['Routine Checkup', 'Teeth Cleaning', 'Filling', 'Extraction', 'Root Canal'];
  const times = ['09:00 AM', '10:30 AM', '02:00 PM', '04:00 PM'];

  // Check if we already have patients to avoid duplicate seeding
  db.get('SELECT COUNT(*) as count FROM patients', (err, row) => {
    if (err) {
      console.error('Error checking patient count:', err);
      return;
    }
    
    if (row.count === 0) {
      console.log('Seeding database with sample Nigerian patient data...');
      
      // Insert sample patients
      const insertPatient = db.prepare(`
        INSERT INTO patients (
          id, name, age, gender, phone, address, blood_group, genotype, occupation,
          religion, state, nationality, marital_status, next_of_kin, past_dental_history,
          family_history, past_medical_history, rhesus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (let i = 0; i < 10; i++) {
        const name = nigerianNames[i];
        const age = Math.floor(Math.random() * 50) + 18;
        const gender = i % 2 === 0 ? 'Male' : 'Female';
        const phone = `+23480${Math.floor(Math.random() * 9000000) + 1000000}`;
        const address = `${Math.floor(Math.random() * 100) + 1} Street, ${nigerianStates[i % nigerianStates.length]}`;
        const bloodGroup = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'][Math.floor(Math.random() * 8)];
        const genotype = ['AA', 'AS', 'SS'][Math.floor(Math.random() * 3)];
        const occupation = occupations[Math.floor(Math.random() * occupations.length)];
        const religion = religions[Math.floor(Math.random() * religions.length)];
        const state = nigerianStates[i % nigerianStates.length];
        const maritalStatus = ['Single', 'Married', 'Divorced', 'Widowed'][Math.floor(Math.random() * 4)];
        const nextOfKin = `Next of Kin ${i+1}`;
        
        insertPatient.run(
          `DN${String(i + 1).padStart(3, '0')}`,
          name,
          age,
          gender,
          phone,
          address,
          bloodGroup,
          genotype,
          occupation,
          religion,
          state,
          'Nigerian',
          maritalStatus,
          nextOfKin,
          'Regular dental checkups',
          'No significant family history',
          'No known medical conditions',
          'Positive'
        );
      }
      
      insertPatient.finalize();
      console.log('Sample patient data seeded successfully');
    }
  });

  // Seed sample appointments after patients
  const insertAppointment = db.prepare(`
  INSERT INTO appointments (
    patient_id, patient_name, treatment, date, time, status, notes
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
`);

const dates = ['2025-09-20', '2025-09-22', '2025-09-25', '2025-09-27', '2025-09-30'];

for (let i = 0; i < 5; i++) {
  const patientId = `DN${String(i + 1).padStart(3, '0')}`;
  const patientName = nigerianNames[i];
  const treatment = treatments[Math.floor(Math.random() * treatments.length)];
  const date = dates[i];
  const time = times[Math.floor(Math.random() * times.length)];
  const status = ['scheduled', 'confirmed', 'completed'][Math.floor(Math.random() * 3)];
  const notes = status === 'completed' ? 'Appointment completed successfully' : '';

  insertAppointment.run(
    patientId,
    patientName,
    treatment,
    date,
    time,
    status,
    notes
  );
}

insertAppointment.finalize();
console.log('Sample appointment data seeded successfully');

}

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate patient ID
function generatePatientId() {
  return new Promise((resolve, reject) => {
    db.get('SELECT COUNT(*) as count FROM patients', (err, row) => {
      if (err) reject(err);
      const count = row.count + 1;
      const id = `DN${String(count).padStart(3, '0')}`;
      resolve(id);
    });
  });
}

// ====== AUTH ROUTES ======
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password required' });
  }

  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });
});

// Verify token endpoint
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ====== PATIENT ROUTES ======

// Get all patients
app.get('/api/patients', authenticateToken, (req, res) => {
  db.all('SELECT * FROM patients ORDER BY created_at DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patients' });
    }
    res.json(rows);
  });
});

// Get single patient
app.get('/api/patients/:id', authenticateToken, (req, res) => {
  db.get('SELECT * FROM patients WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patient' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json(row);
  });
});

// Create new patient
app.post('/api/patients', authenticateToken, async (req, res) => {
  try {
    const patientId = await generatePatientId();
    const {
      name, age, gender, phone, address, blood_group, genotype, occupation,
      religion, state, nationality = 'Nigerian', marital_status, next_of_kin,
      past_dental_history, family_history, past_medical_history, rhesus
    } = req.body;

    if (!name || !age || !gender) {
      return res.status(400).json({ error: 'Name, age, and gender are required' });
    }

    const query = `
      INSERT INTO patients (
        id, name, age, gender, phone, address, blood_group, genotype, occupation,
        religion, state, nationality, marital_status, next_of_kin, past_dental_history,
        family_history, past_medical_history, rhesus
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      patientId, name, age, gender, phone, address, blood_group, genotype, occupation,
      religion, state, nationality, marital_status, next_of_kin, past_dental_history,
      family_history, past_medical_history, rhesus
    ], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to create patient' });
      }
      res.status(201).json({ 
        message: 'Patient created successfully', 
        patientId,
        id: this.lastID 
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update patient
app.put('/api/patients/:id', authenticateToken, (req, res) => {
  const {
    name, age, gender, phone, address, blood_group, genotype, occupation,
    religion, state, nationality, marital_status, next_of_kin,
    past_dental_history, family_history, past_medical_history, rhesus
  } = req.body;

  const query = `
    UPDATE patients SET 
      name = ?, age = ?, gender = ?, phone = ?, address = ?, blood_group = ?,
      genotype = ?, occupation = ?, religion = ?, state = ?, nationality = ?,
      marital_status = ?, next_of_kin = ?, past_dental_history = ?,
      family_history = ?, past_medical_history = ?, rhesus = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [
    name, age, gender, phone, address, blood_group, genotype, occupation,
    religion, state, nationality, marital_status, next_of_kin, past_dental_history,
    family_history, past_medical_history, rhesus, req.params.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update patient' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient updated successfully' });
  });
});

// Delete patient
app.delete('/api/patients/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM patients WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete patient' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    res.json({ message: 'Patient deleted successfully' });
  });
});

// Search patients
app.get('/api/patients/search/:query', authenticateToken, (req, res) => {
  const query = `%${req.params.query}%`;
  db.all(`
    SELECT * FROM patients 
    WHERE name LIKE ? OR id LIKE ? OR phone LIKE ?
    ORDER BY name
  `, [query, query, query], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Search failed' });
    }
    res.json(rows);
  });
});

// ====== TREATMENT ROUTES ======

// Get all treatments
app.get('/api/treatments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM treatments ORDER BY date DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch treatments' });
    }
    res.json(rows);
  });
});

// Get treatments for a specific patient
app.get('/api/treatments/patient/:patientId', authenticateToken, (req, res) => {
  db.all('SELECT * FROM treatments WHERE patient_id = ? ORDER BY date DESC', 
    [req.params.patientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patient treatments' });
    }
    res.json(rows);
  });
});

// Create new treatment
app.post('/api/treatments', authenticateToken, (req, res) => {
  const {
    patient_id, patient_name, date, treatments, extra_oral, intra_oral,
    treatment_plan, next_treatment_date
  } = req.body;

  if (!patient_id || !date) {
    return res.status(400).json({ error: 'Patient ID and date are required' });
  }

  // Convert treatments array to individual fields
  const treatmentFields = {
    treatment1: treatments && treatments[0] ? treatments[0] : null,
    treatment2: treatments && treatments[1] ? treatments[1] : null,
    treatment3: treatments && treatments[2] ? treatments[2] : null,
    treatment4: treatments && treatments[3] ? treatments[3] : null,
    treatment5: treatments && treatments[4] ? treatments[4] : null,
    treatment6: treatments && treatments[5] ? treatments[5] : null,
    treatment7: treatments && treatments[6] ? treatments[6] : null,
  };

  const query = `
    INSERT INTO treatments (
      patient_id, patient_name, date, treatment1, treatment2, treatment3,
      treatment4, treatment5, treatment6, treatment7, extra_oral, intra_oral,
      treatment_plan, next_treatment_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    patient_id, patient_name, date, treatmentFields.treatment1, treatmentFields.treatment2,
    treatmentFields.treatment3, treatmentFields.treatment4, treatmentFields.treatment5,
    treatmentFields.treatment6, treatmentFields.treatment7, extra_oral, intra_oral,
    treatment_plan, next_treatment_date
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create treatment record' });
    }
    res.status(201).json({ 
      message: 'Treatment record created successfully',
      id: this.lastID 
    });
  });
});

// Update treatment
app.put('/api/treatments/:id', authenticateToken, (req, res) => {
  const {
    patient_id, patient_name, date, treatments, extra_oral, intra_oral,
    treatment_plan, next_treatment_date
  } = req.body;

  const treatmentFields = {
    treatment1: treatments && treatments[0] ? treatments[0] : null,
    treatment2: treatments && treatments[1] ? treatments[1] : null,
    treatment3: treatments && treatments[2] ? treatments[2] : null,
    treatment4: treatments && treatments[3] ? treatments[3] : null,
    treatment5: treatments && treatments[4] ? treatments[4] : null,
    treatment6: treatments && treatments[5] ? treatments[5] : null,
    treatment7: treatments && treatments[6] ? treatments[6] : null,
  };

  const query = `
    UPDATE treatments SET 
      patient_id = ?, patient_name = ?, date = ?, treatment1 = ?, treatment2 = ?,
      treatment3 = ?, treatment4 = ?, treatment5 = ?, treatment6 = ?, treatment7 = ?,
      extra_oral = ?, intra_oral = ?, treatment_plan = ?, next_treatment_date = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [
    patient_id, patient_name, date, treatmentFields.treatment1, treatmentFields.treatment2,
    treatmentFields.treatment3, treatmentFields.treatment4, treatmentFields.treatment5,
    treatmentFields.treatment6, treatmentFields.treatment7, extra_oral, intra_oral,
    treatment_plan, next_treatment_date, req.params.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update treatment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    res.json({ message: 'Treatment updated successfully' });
  });
});

// Delete treatment
app.delete('/api/treatments/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM treatments WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete treatment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Treatment not found' });
    }
    res.json({ message: 'Treatment deleted successfully' });
  });
});

// ====== PAYMENT ROUTES ======

// Get all payments
app.get('/api/payments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM payments ORDER BY date DESC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch payments' });
    }
    res.json(rows);
  });
});

// Get payments for a specific patient
app.get('/api/payments/patient/:patientId', authenticateToken, (req, res) => {
  db.all('SELECT * FROM payments WHERE patient_id = ? ORDER BY date DESC', 
    [req.params.patientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patient payments' });
    }
    res.json(rows);
  });
});

// Create new payment
app.post('/api/payments', authenticateToken, (req, res) => {
  const {
    patient_id, patient_name, address, treatment, amount, date,
    payment_method = 'Cash', status = 'Completed'
  } = req.body;

  if (!patient_id || !amount || !date) {
    return res.status(400).json({ error: 'Patient ID, amount, and date are required' });
  }

  const query = `
    INSERT INTO payments (
      patient_id, patient_name, address, treatment, amount, date, payment_method, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    patient_id, patient_name, address, treatment, amount, date, payment_method, status
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create payment record' });
    }
    res.status(201).json({ 
      message: 'Payment record created successfully',
      id: this.lastID 
    });
  });
});

// Update payment
app.put('/api/payments/:id', authenticateToken, (req, res) => {
  const {
    patient_id, patient_name, address, treatment, amount, date,
    payment_method, status
  } = req.body;

  const query = `
    UPDATE payments SET 
      patient_id = ?, patient_name = ?, address = ?, treatment = ?, amount = ?,
      date = ?, payment_method = ?, status = ?
    WHERE id = ?
  `;

  db.run(query, [
    patient_id, patient_name, address, treatment, amount, date,
    payment_method, status, req.params.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update payment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment updated successfully' });
  });
});

// Delete payment
app.delete('/api/payments/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM payments WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete payment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    res.json({ message: 'Payment deleted successfully' });
  });
});

   
// ====== APPOINTMENT ROUTES ======

// Get all appointments
app.get('/api/appointments', authenticateToken, (req, res) => {
  db.all('SELECT * FROM appointments ORDER BY date DESC, time ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch appointments' });
    }
    
    res.json(rows);
  });
});

// Get appointments for a specific patient
app.get('/api/appointments/patient/:patientId', authenticateToken, (req, res) => {
  db.all('SELECT * FROM appointments WHERE patient_id = ? ORDER BY date DESC, time ASC', 
    [req.params.patientId], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch patient appointments' });
    }
    res.json(rows);
  });
});

// Create new appointment
app.post('/api/appointments', authenticateToken, (req, res) => {
  const {
    patient_id, patient_name, treatment, date, time, status = 'scheduled', notes
  } = req.body;

  if (!patient_id || !date || !time) {
    return res.status(400).json({ error: 'Patient ID, date, and time are required' });
  }

  const query = `
    INSERT INTO appointments (
      patient_id, patient_name, treatment, date, time, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(query, [
    patient_id, patient_name, treatment, date, time, status, notes
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to create appointment' });
    }
    res.status(201).json({ 
      message: 'Appointment created successfully',
      id: this.lastID 
    });
  });
});

// Update appointment
app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  const {
    patient_id, patient_name, treatment, date, time, status, notes
  } = req.body;

  const query = `
    UPDATE appointments SET 
      patient_id = ?, patient_name = ?, treatment = ?, date = ?, time = ?,
      status = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `;

  db.run(query, [
    patient_id, patient_name, treatment, date, time, status, notes, req.params.id
  ], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update appointment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment updated successfully' });
  });
});

// Delete appointment
app.delete('/api/appointments/:id', authenticateToken, (req, res) => {
  db.run('DELETE FROM appointments WHERE id = ?', [req.params.id], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete appointment' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  });
});



// ====== DASHBOARD/ANALYTICS ROUTES ======

// Get dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, (req, res) => {
  const stats = {};
  
  // Get total patients
  db.get('SELECT COUNT(*) as count FROM patients', (err, result) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
    stats.totalPatients = result.count;
    
    // Get total treatments
    db.get('SELECT COUNT(*) as count FROM treatments', (err, result) => {
      if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
      stats.totalTreatments = result.count;
      
      // Get total revenue
      db.get('SELECT SUM(amount) as total FROM payments', (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
        stats.totalRevenue = result.total || 0;
        
        // Get recent patients
        db.all('SELECT * FROM patients ORDER BY created_at DESC LIMIT 5', (err, patients) => {
          if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
          stats.recentPatients = patients;
          
          // Get recent payments
          db.all('SELECT * FROM payments ORDER BY date DESC LIMIT 5', (err, payments) => {
            if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
            stats.recentPayments = payments.map(payment => ({
              id: payment.id,
              patient: payment.patient_name,
              treatment: payment.treatment,
              amount: payment.amount,
              date: payment.date,
              method: payment.payment_method || 'Cash'
            }));
            
            // Get upcoming appointments (today and future, non-cancelled)
            const today = new Date().toISOString().split('T')[0];
            db.all(`
              SELECT * FROM appointments 
              WHERE date >= ? AND status != 'cancelled' 
              ORDER BY date ASC, time ASC 
              LIMIT 5
            `, [today], (err, appointments) => {
              if (err) return res.status(500).json({ error: 'Failed to fetch stats' });
              stats.upcomingAppointments = appointments.map(appointment => ({
                id: appointment.id,
                patient: appointment.patient_name,
                treatment: appointment.treatment,
                time: appointment.time,
                status: appointment.status
              }));
              
              res.json(stats);
            });
          });
        });
      });
    });
  });
});



// ====== REPORT ROUTES ======

// Generate patient report
app.get('/api/reports/patients', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  let query = 'SELECT * FROM patients';
  const params = [];
  
  if (startDate && endDate) {
    query += ' WHERE created_at BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  
  query += ' ORDER BY created_at DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate patient report' });
    }
    res.json(rows);
  });
});

// Generate treatment report
app.get('/api/reports/treatments', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  let query = 'SELECT * FROM treatments';
  const params = [];
  
  if (startDate && endDate) {
    query += ' WHERE date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  
  query += ' ORDER BY date DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate treatment report' });
    }
    res.json(rows);
  });
});

// Generate appointment report
app.get('/api/reports/appointments', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  let query = 'SELECT * FROM appointments';
  const params = [];
  
  if (startDate && endDate) {
    query += ' WHERE date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  
  query += ' ORDER BY date DESC, time ASC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate appointment report' });
    }
    res.json(rows);
  });
});

// Generate payment report
app.get('/api/reports/payments', authenticateToken, (req, res) => {
  const { startDate, endDate } = req.query;
  let query = 'SELECT * FROM payments';
  const params = [];
  
  if (startDate && endDate) {
    query += ' WHERE date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  }
  
  query += ' ORDER BY date DESC';
  
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to generate payment report' });
    }
    res.json(rows);
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Dental Management System API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error(err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Dental Management System API running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;