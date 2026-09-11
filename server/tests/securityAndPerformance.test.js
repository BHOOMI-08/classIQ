import request from 'supertest';
import app from '../src/app.js';
import { CryptoService } from '../src/services/crypto.service.js';

describe('Security, Observability & Performance Controls', () => {
  test('Propagates X-Request-ID response header on requests', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.headers['x-request-id']).toBeDefined();
    expect(typeof res.headers['x-request-id']).toBe('string');
  });

  test('/health endpoint returns 200 with service liveness payload', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.service).toBe('classiq-api');
    expect(typeof res.body.uptimeSeconds).toBe('number');
  });

  test('/metrics endpoint returns Prometheus formatted plain text', async () => {
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_requests_total');
    expect(res.text).toContain('process_uptime_seconds');
  });

  test('HMAC QR signature verification invalidates tampered payloads', () => {
    const validToken = CryptoService.generateQrToken({
      tokenId: 'tok_1',
      sessionId: 'sess_123',
      classroomId: 'class_456',
      teacherId: 'teach_789',
      rotation: 1,
      issuedAt: Date.now(),
      expiresAt: Date.now() + 15000,
      nonce: 'nonce_abc',
    });

    const verification = CryptoService.verifyQrToken(validToken);
    expect(verification.valid).toBe(true);

    // Tamper payload byte (swap rotation number)
    const parts = validToken.split('.');
    const decodedPayload = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
    decodedPayload.rotation = 999;
    const tamperedPayload = Buffer.from(JSON.stringify(decodedPayload)).toString('base64url');
    const tamperedToken = `${tamperedPayload}.${parts[1]}`;

    const tamperedCheck = CryptoService.verifyQrToken(tamperedToken);
    expect(tamperedCheck.valid).toBe(false);
  });
});
