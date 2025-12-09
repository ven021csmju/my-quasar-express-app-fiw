const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());  // อนุญาต cross-origin จาก frontend
app.use(express.json());

// สร้างโฟลเดอร์ logs ถ้ายังไม่มี (สำหรับ volume demo)
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Endpoint demo: Return Git + Docker info และ log request
app.get('/', (req, res) => {
  const logMessage = `Request at ${new Date().toISOString()}: ${req.ip}\n`;
  fs.appendFileSync(path.join(logsDir, 'access.log'), logMessage);

  res.json({
    git: {
      title: 'Advanced Git Workflow',
      detail: 'ใช้ branch protection บน GitHub, code review ใน PR, และ squash merge เพื่อ history สะอาด'
    },
    docker: {
      title: 'Advanced Docker',
      detail: 'ใช้ multi-stage build, healthcheck ใน Dockerfile, และ orchestration ด้วย Compose/Swarm'
    }
  });
});

// Serve frontend static files if a build exists (tries common locations)
const possibleIndexPaths = [
  path.join(__dirname, '..', 'frontend', 'dist', 'spa', 'index.html'),
  path.join(__dirname, '..', 'frontend', 'dist', 'index.html'),
  path.join(__dirname, '..', 'frontend', 'index.html'),
  path.join(__dirname, '..', 'frontend', 'public', 'index.html')
];

let servedIndexPath = null;
for (const p of possibleIndexPaths) {
  if (fs.existsSync(p)) {
    servedIndexPath = p;
    break;
  }
}

if (servedIndexPath) {
  const staticDir = path.dirname(servedIndexPath);
  app.use(express.static(staticDir));

  // 👇 ใช้ regex แทน wildcard route
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(servedIndexPath);
  });
}


// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
