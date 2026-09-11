import { User } from '../modules/users/user.model.js';
import { PasswordService } from '../services/password.service.js';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { ROLES } from '../constants/roles.js';
import { AUTH_CONSTANTS } from '../constants/auth.constants.js';

const seedAdmin = async () => {
  try {
    await connectDatabase();

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    if (!adminEmail || !adminPassword) {
      logger.error('❌ ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required to seed admin user.');
      process.exit(1);
    }

    if (adminPassword.length < 10) {
      logger.error('❌ ADMIN_PASSWORD must be at least 10 characters long.');
      process.exit(1);
    }

    const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existingAdmin) {
      logger.info(`⚠️ Admin user already exists: ${adminEmail}`);
      await disconnectDatabase();
      process.exit(0);
    }

    const passwordHash = await PasswordService.hashPassword(adminPassword);

    const admin = await User.create({
      name: adminName,
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: ROLES.ADMIN,
      accountStatus: AUTH_CONSTANTS.ACCOUNT_STATUS.ACTIVE,
      isEmailVerified: true,
    });

    logger.info(`✅ Admin user created successfully: ${admin.email}`);
    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to seed admin user:', { error: error.message });
    process.exit(1);
  }
};

seedAdmin();
