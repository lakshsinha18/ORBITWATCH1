import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  satellite1: { type: String, required: true },
  satellite2: { type: String, required: true },
  distanceKm: { type: Number, required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  timestamp: { type: Date, default: Date.now },
  message: { type: String, required: true },
  timeToImpactSec: { type: Number, default: -1 }
});

export const Alert = mongoose.model('Alert', alertSchema);
