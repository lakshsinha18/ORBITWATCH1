import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { TelemetryService } from './services/TelemetryService';
import { Alert } from './models/Alert';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/alerts/history', async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ timestamp: -1 }).limit(100);
    res.json(alerts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Since TLE propagates with real time, we need a "simulation offset" if we want to force
// the satellites to move visibly or use a mocked time that increments faster than real time.
// For realism, let's stick to real time but increment it somewhat faster so it's interesting to look at.
let simulationTime = new Date();

setInterval(async () => {
  // advance time by 30 seconds per tick
  simulationTime = new Date(simulationTime.getTime() + 30 * 1000); 
  
  const positions = TelemetryService.getPositions(simulationTime);
  const alerts = await TelemetryService.evaluateCollisions(positions);

  io.emit('telemetry', positions);
  
  if (alerts.length > 0) {
    io.emit('alerts', alerts);
  }

}, 500);

const PORT = process.env.PORT || 4000;

async function bootstrap() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  
  await mongoose.connect(uri);
  console.log(`Connected to in-memory MongoDB at ${uri}`);

  httpServer.listen(PORT, () => {
    console.log(`OrbitWatch backend is running on http://localhost:${PORT}`);
  });
}

bootstrap().catch(console.error);
