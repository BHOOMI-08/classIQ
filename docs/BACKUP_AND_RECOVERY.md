# ClassIQ Database Backup & Disaster Recovery Guide

Procedures for database backups, point-in-time recovery, secret rotation, and operational disaster recovery.

---

## 1. MongoDB Atlas Automated Backups
- **Continuous Backups**: Enable MongoDB Atlas Continuous Cloud Backups with Point-in-Time Recovery (PITR) for a 7-day window.
- **Automated Snapshots**: Daily automated cluster snapshots retained for 30 days.

## 2. Command-Line Backup & Restore

### Backup Database Snapshot (`mongodump`)
```bash
mongodump --uri="mongodb+srv://<username>:<password>@cluster0.mongodb.net/classiq" --out=/backups/$(date +%Y%m%d_%H%m%s)
```

### Restore Database Snapshot (`mongorestore`)
```bash
mongorestore --uri="mongodb+srv://<username>:<password>@cluster0.mongodb.net/classiq" --drop /backups/20260730_120000/classiq
```

---

## 3. Secret Rotation Strategy
- **JWT & HMAC Secrets**: Rotate `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `ATTENDANCE_HMAC_SECRET` quarterly.
- **Active Session Safety**: When rotating `ATTENDANCE_HMAC_SECRET`, ensure secret versioning resolves active session keys without invalidating in-flight QR scans.

---

## 4. Disaster Recovery RPO / RTO Targets
- **Recovery Point Objective (RPO)**: < 5 minutes (via MongoDB Atlas PITR oplog).
- **Recovery Time Objective (RTO)**: < 15 minutes.
