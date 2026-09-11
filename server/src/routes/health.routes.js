import { Router } from 'express';
import mongoose from 'mongoose';
import { metricsCollector } from '../metrics/metricsCollector.js';
import { env } from '../config/env.js';

const router = Router();

/**
 * Basic Liveness Endpoint
 */
router.get('/health', (_req, res) => {
  return res.status(200).json({
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
    service: 'classiq-api',
  });
});

/**
 * Production Readiness Endpoint
 */
router.get('/ready', async (_req, res) => {
  try {
    const dbState = mongoose.connection.readyState;
    // 1 = connected
    if (dbState !== 1) {
      return res.status(503).json({
        status: 'degraded',
        reason: 'MongoDB database not connected',
        dbState,
      });
    }

    return res.status(200).json({
      status: 'ready',
      database: 'connected',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return res.status(503).json({
      status: 'degraded',
      reason: err.message,
    });
  }
});

/**
 * Prometheus Metrics Endpoint
 */
router.get('/metrics', (_req, res) => {
  res.setHeader('Content-Type', 'text/plain; version=0.0.4');
  return res.status(200).send(metricsCollector.getMetricsPrometheusFormat());
});

export default router;
