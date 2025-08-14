const express = require("express"),
  mysql = require("mysql2/promise"),
  bcrypt = require("bcrypt"),
  jwt = require("jsonwebtoken"),
  cors = require("cors"),
  bodyParser = require("body-parser");

const app = express(),
  PORT = 5000,
  HOST = "0.0.0.0",
  JWT_SECRET = "abcd";

app.use(cors()), app.use(bodyParser.json()), app.use(express.json());

const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "wristbud",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },
  pool = mysql.createPool(dbConfig),
  authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization,
      token = authHeader && authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Access token required" });
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ error: "Invalid or expired token" });
      (req.user = user), next();
    });
  };

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.get("/api", (req, res) => {
  res.json({
    message: "WristBud API Server",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      auth: { register: "POST /api/register", login: "POST /api/login" },
      user: {
        profile: "GET /api/profile",
        updateProfile: "PUT /api/profile",
      },
      health_data: {
        update: "POST /api/update_health",
        get: "GET /api/health_data",
      },
      alerts: {
        emergency: "POST /api/emergency_alert",
        list: "GET /api/alerts",
      },
      demo: {
        critical: "POST /api/demo/critical",
        abnormal: "POST /api/demo/abnormal",
        normal: "POST /api/demo/normal",
      },
      admin: {
        criticalUsers: "GET /api/critical-users",
        smsStatus: "POST /api/sms-status",
      },
    },
    timestamp: new Date().toISOString(),
  });
});

app.post("/api/register", async (req, res) => {
  try {
    const {
      email: email,
      password: password,
      name: name,
      emergency_contact: emergency_contact,
      emergency_phone: emergency_phone,
    } = req.body;
    if (!email || !password || !name)
      return res
        .status(400)
        .json({ error: "Email, password, and name are required" });
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0)
      return res.status(409).json({ error: "User already exists" });
    const saltRounds = 10,
      hashedPassword = await bcrypt.hash(password, saltRounds),
      [result] = await pool.execute(
        "INSERT INTO users (email, password, name, emergency_contact, emergency_phone, created_at) VALUES (?, ?, ?, ?, ?, NOW())",
        [
          email,
          hashedPassword,
          name,
          emergency_contact || null,
          emergency_phone || null,
        ]
      ),
      token = jwt.sign({ userId: result.insertId, email: email }, JWT_SECRET, {
        expiresIn: "24h",
      });
    res
      .status(201)
      .json({
        message: "User registered successfully",
        user_id: result.insertId,
        token: token,
        email: email,
      });
  } catch (error) {
    console.error("Registration error:", error),
      res.status(500).json({ error: "Internal server error" });
  }
});

// Enhanced login with PHP password_hash support
app.post("/api/login", async (req, res) => {
  try {
    const { email: email, password: password } = req.body;
    console.log("🔐 Login attempt for:", email);
    
    if (!email || !password)
      return res
        .status(400)
        .json({ error: "Email and password are required" });
    
    const [users] = await pool.execute(
      "SELECT id, email, password, name FROM users WHERE email = ?",
      [email]
    );
    
    if (users.length === 0) {
      console.log("❌ User not found:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const user = users[0];
    console.log("👤 User found:", user.email, "ID:", user.id);
    console.log("🔑 Stored password hash:", user.password.substring(0, 20) + "...");
    
    let passwordMatch = false;
    
    // Check if password is PHP password_hash format (starts with $2y$)
    if (user.password.startsWith('$2y$')) {
      console.log("🔍 Detected PHP password_hash format");
      // PHP password_hash uses $2y$ which is compatible with bcrypt
      // We can use bcrypt.compare by replacing $2y$ with $2b$
      const bcryptHash = user.password.replace('$2y$', '$2b$');
      passwordMatch = await bcrypt.compare(password, bcryptHash);
    } else if (user.password.startsWith('$2b$')) {
      console.log("🔍 Using bcrypt verification");
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      console.log("🔍 Unknown password hash format");
      passwordMatch = false;
    }
    
    console.log("🔐 Password match result:", passwordMatch);
    
    if (!passwordMatch) {
      console.log("❌ Password verification failed");
      return res.status(401).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h",
    });
    
    console.log("✅ Login successful for user:", user.id);
    
    res.json({
      message: "Login successful",
      user_id: user.id,
      token: token,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Enhanced health data update with location support
app.post("/api/update_health", authenticateToken, async (req, res) => {
  try {
    const {
        heart_rate: heart_rate,
        systolic: systolic,
        diastolic: diastolic,
        spo2: spo2,
        temperature: temperature,
        status: status,
        activity: activity,
        context_tag: context_tag,
        location_latitude: location_latitude,
        location_longitude: location_longitude,
        location_address: location_address,
      } = req.body,
      userId = req.user.userId;
    if (!(heart_rate && systolic && diastolic && spo2 && temperature))
      return res
        .status(400)
        .json({ error: "All health metrics are required" });
    const [result] = await pool.execute(
      "INSERT INTO health_data (user_id, heart_rate, systolic, diastolic, spo2, temperature, status, activity, context_tag, location_latitude, location_longitude, location_address, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        userId,
        heart_rate,
        systolic,
        diastolic,
        spo2,
        temperature,
        status || "normal",
        activity || null,
        context_tag || null,
        location_latitude || null,
        location_longitude || null,
        location_address || null,
      ]
    );
    if (status === "critical") {
      await pool.execute(
        "INSERT INTO alerts (user_id, alert_type, message, severity, location_latitude, location_longitude, location_address, created_at) VALUES (?, 'health_critical', ?, 'high', ?, ?, ?, NOW())",
        [
          userId,
          `Critical health values detected: HR=${heart_rate}, BP=${systolic}/${diastolic}, SpO2=${spo2}%, Temp=${temperature}°F`,
          location_latitude || null,
          location_longitude || null,
          location_address || null,
        ]
      );
    }
    res.json({
      message: "Health data updated successfully",
      data_id: result.insertId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Health data update error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/health_data", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId,
      limit = parseInt(req.query.limit) || 10,
      [healthData] = await pool.execute(
        "SELECT * FROM health_data WHERE user_id = ? ORDER BY recorded_at DESC LIMIT ?",
        [userId, limit]
      );
    res.json({ data: healthData, count: healthData.length });
  } catch (error) {
    console.error("Get health data error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Enhanced emergency alert with location support
app.post("/api/emergency_alert", authenticateToken, async (req, res) => {
  try {
    const {
        heart_rate: heart_rate,
        blood_pressure: blood_pressure,
        spo2: spo2,
        temperature: temperature,
        location: location,
        location_latitude: location_latitude,
        location_longitude: location_longitude,
        location_address: location_address,
        message: message,
      } = req.body,
      userId = req.user.userId,
      [users] = await pool.execute(
        "SELECT name, email, emergency_contact, emergency_phone FROM users WHERE id = ?",
        [userId]
      );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });
    const user = users[0],
      alertMessage = `EMERGENCY ALERT for ${user.name}: HR=${heart_rate}, BP=${blood_pressure}, SpO2=${spo2}%, Temp=${temperature}°F. Location: ${location_address || location || 'Unknown'}. ${message || "Immediate assistance required."}`,
      [alertResult] = await pool.execute(
        "INSERT INTO alerts (user_id, alert_type, message, severity, location_latitude, location_longitude, location_address, created_at) VALUES (?, 'emergency', ?, 'critical', ?, ?, ?, NOW())",
        [userId, alertMessage, location_latitude || null, location_longitude || null, location_address || location || null]
      );
    await pool.execute(
      "INSERT INTO emergency_events (user_id, heart_rate, blood_pressure, spo2, temperature, location_latitude, location_longitude, location_address, message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        userId,
        heart_rate,
        blood_pressure,
        spo2,
        temperature,
        location_latitude || null,
        location_longitude || null,
        location_address || location || null,
        message || "Auto-generated emergency alert",
      ]
    );
    console.log("🚨 EMERGENCY ALERT TRIGGERED:", {
      user: user.name,
      email: user.email,
      emergency_contact: user.emergency_contact,
      emergency_phone: user.emergency_phone,
      vitals: {
        heart_rate: heart_rate,
        blood_pressure: blood_pressure,
        spo2: spo2,
        temperature: temperature,
      },
      location: location_address || location || 'Unknown',
      timestamp: new Date().toISOString(),
    });
    res.json({
      message: "Emergency alert sent successfully",
      alert_id: alertResult.insertId,
      emergency_contact: user.emergency_contact,
      emergency_phone: user.emergency_phone,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Emergency alert error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/alerts", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId,
      limit = parseInt(req.query.limit) || 20,
      [alerts] = await pool.execute(
        "SELECT * FROM alerts WHERE user_id = ? ORDER BY created_at DESC LIMIT ?",
        [userId, limit]
      );
    res.json({ alerts: alerts, count: alerts.length });
  } catch (error) {
    console.error("Get alerts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Enhanced demo endpoints with location support
app.post("/api/demo/critical", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { location } = req.body;
    
    const demoData = {
      heart_rate: 180 + Math.floor(20 * Math.random()),
      systolic: 180 + Math.floor(20 * Math.random()),
      diastolic: 110 + Math.floor(10 * Math.random()),
      spo2: 85 + Math.floor(5 * Math.random()),
      temperature: 103 + 2 * Math.random(),
      status: "critical",
      activity: "Demo Mode - Critical",
      context_tag: "Demo",
    };
    
    await pool.execute(
      "INSERT INTO health_data (user_id, heart_rate, systolic, diastolic, spo2, temperature, status, activity, context_tag, location_address, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        userId,
        demoData.heart_rate,
        demoData.systolic,
        demoData.diastolic,
        demoData.spo2,
        demoData.temperature,
        demoData.status,
        demoData.activity,
        demoData.context_tag,
        location || "Demo Location - Critical Emergency",
      ]
    );
    res.json({ message: "Critical demo data generated", data: demoData });
  } catch (error) {
    console.error("Demo critical error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/demo/abnormal", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { location } = req.body;
    
    const demoData = {
      heart_rate:
        Math.random() > 0.5
          ? 45 + Math.floor(5 * Math.random())
          : 140 + Math.floor(10 * Math.random()),
      systolic: 160 + Math.floor(10 * Math.random()),
      diastolic: 95 + Math.floor(5 * Math.random()),
      spo2: 90 + Math.floor(2 * Math.random()),
      temperature:
        Math.random() > 0.5
          ? 94 + 1 * Math.random()
          : 100.5 + 1 * Math.random(),
      status: "abnormal",
      activity: "Demo Mode - Abnormal",
      context_tag: "Demo",
    };
    
    await pool.execute(
      "INSERT INTO health_data (user_id, heart_rate, systolic, diastolic, spo2, temperature, status, activity, context_tag, location_address, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        userId,
        demoData.heart_rate,
        demoData.systolic,
        demoData.diastolic,
        demoData.spo2,
        demoData.temperature,
        demoData.status,
        demoData.activity,
        demoData.context_tag,
        location || "Demo Location - Abnormal Values",
      ]
    );
    res.json({ message: "Abnormal demo data generated", data: demoData });
  } catch (error) {
    console.error("Demo abnormal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/demo/normal", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { location } = req.body;
    
    const demoData = {
      heart_rate: 60 + Math.floor(40 * Math.random()), // 60-100 BPM
      systolic: 110 + Math.floor(20 * Math.random()), // 110-130 mmHg
      diastolic: 70 + Math.floor(15 * Math.random()), // 70-85 mmHg
      spo2: 95 + Math.floor(5 * Math.random()), // 95-100%
      temperature: 97.5 + 1.5 * Math.random(), // 97.5-99°F
      status: "normal",
      activity: "Demo Mode - Normal Activity",
      context_tag: "Demo",
    };
    
    await pool.execute(
      "INSERT INTO health_data (user_id, heart_rate, systolic, diastolic, spo2, temperature, status, activity, context_tag, location_address, recorded_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",
      [
        userId,
        demoData.heart_rate,
        demoData.systolic,
        demoData.diastolic,
        demoData.spo2,
        demoData.temperature,
        demoData.status,
        demoData.activity,
        demoData.context_tag,
        location || "Demo Location - Normal Activity",
      ]
    );
    res.json({ message: "Normal demo data generated", data: demoData });
  } catch (error) {
    console.error("Demo normal error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/critical-users", async (req, res) => {
  try {
    const [criticalUsers] = await pool.execute(`
      SELECT DISTINCT 
          u.id as user_id,
          u.name,
          u.email,
          u.emergency_contact,
          u.emergency_phone,
          a.id as alert_id,
          a.message as alert_message,
          a.location_address,
          a.created_at,
          hd.heart_rate,
          CONCAT(hd.systolic, '/', hd.diastolic) as blood_pressure,
          hd.spo2,
          hd.temperature
      FROM users u
      INNER JOIN alerts a ON u.id = a.user_id
      LEFT JOIN health_data hd ON u.id = hd.user_id
      WHERE a.alert_type = 'emergency' 
      AND a.severity = 'critical'
      AND a.created_at >= DATE_SUB(NOW(), INTERVAL 1 HOUR)
      AND u.emergency_phone IS NOT NULL
      AND u.emergency_phone != ''
      ORDER BY a.created_at DESC
    `);
    res.json({
      users: criticalUsers,
      count: criticalUsers.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Get critical users error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/sms-status", async (req, res) => {
  try {
    const {
      user_id: user_id,
      alert_id: alert_id,
      phone_number: phone_number,
      status: status,
      timestamp: timestamp,
    } = req.body;
    await pool.execute(
      "INSERT INTO sms_log (user_id, alert_id, phone_number, status, sent_at) VALUES (?, ?, ?, ?, FROM_UNIXTIME(?))",
      [user_id, alert_id, phone_number, status, timestamp / 1000]
    );
    res.json({ message: "SMS status recorded successfully" });
  } catch (error) {
    console.error("SMS status error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId,
      [users] = await pool.execute(
        "SELECT id, email, name, emergency_contact, emergency_phone, created_at FROM users WHERE id = ?",
        [userId]
      );
    if (users.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json({ user: users[0] });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/api/profile", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId,
      {
        name: name,
        emergency_contact: emergency_contact,
        emergency_phone: emergency_phone,
      } = req.body;
    await pool.execute(
      "UPDATE users SET name = ?, emergency_contact = ?, emergency_phone = ? WHERE id = ?",
      [name, emergency_contact, emergency_phone, userId]
    );
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

app.listen(PORT, HOST, () => {
  console.log(`🚀 WristBud Express Server running on ${HOST}:${PORT}`);
  console.log(`📊 Health API: http://localhost:${PORT}/api/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
});

process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully");
  await pool.end();
  process.exit(0);
});