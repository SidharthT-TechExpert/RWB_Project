import '../config/env';
import mongoose from 'mongoose';
import { loadSecretsFromInfisical } from '../config/infisical';
import { User } from '../models/User';
import { ROLES } from '../constants';
import { hashPassword } from '../utils';
import { logger } from '../config/logger';

async function seedAdminToDatabase(uri: string, dbName: string, adminData: any) {
  try {
    const conn = await mongoose.createConnection(uri, {
      dbName,
      maxPoolSize: 5,
      serverSelectionTimeoutMS: 5000,
    }).asPromise();

    const UserModel = conn.model('User', User.schema);

    await UserModel.findOneAndUpdate(
      { email: adminData.email.toLowerCase() },
      {
        $set: {
          name: adminData.name,
          email: adminData.email.toLowerCase(),
          password: adminData.password,
          role: ROLES.ADMIN,
          isEmailVerified: true,
          isPhoneVerified: true,
          isActive: true,
          isSuspended: false,
          loginAttempts: 0,
        },
        $unset: { lockUntil: 1 },
      },
      { upsert: true, new: true }
    );

    logger.info(`✅ Admin user seeded to database [${dbName}] on ${uri.split('@').pop() || 'local'}`);
    await conn.close();
  } catch (err: any) {
    logger.warn(`Could not seed to database [${dbName}]: ${err.message}`);
  }
}

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin.info@qickbite.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@321';
  const adminName = process.env.ADMIN_NAME || 'QuickBite Super Admin';

  try {
    logger.info('Initializing Multi-Database Admin Creation Script...');

    // 1. Load Infisical secrets if available
    try {
      await loadSecretsFromInfisical();
    } catch {
      logger.info('Using local environment variables');
    }

    const hashedPassword = await hashPassword(adminPassword);

    const adminPayload = {
      name: adminName,
      email: adminEmail,
      password: hashedPassword,
    };

    // Target database names to seed
    const targetDbNames = ['qickbite_prod', 'test', 'quickbite'];

    // 2. Seed Local MongoDB
    const localUri = 'mongodb://127.0.0.1:27017';
    for (const dbName of targetDbNames) {
      await seedAdminToDatabase(localUri, dbName, adminPayload);
    }

    // 3. Seed Remote Atlas MongoDB if MONGODB_URI is provided
    const remoteUri = process.env.MONGODB_URI;
    if (remoteUri && remoteUri.includes('mongodb')) {
      let rawUri = remoteUri.trim().replace(/^["']|["']$/g, '');
      const uri = rawUri.replace('mongodb://localhost:', 'mongodb://127.0.0.1:');
      for (const dbName of targetDbNames) {
        await seedAdminToDatabase(uri, dbName, adminPayload);
      }
    }

    console.log('\n================================================');
    console.log('🎉 ADMIN CREDENTIALS SEEDED ACROSS ALL DATABASES:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role:     ${ROLES.ADMIN}`);
    console.log('   Databases: qickbite_prod, test, quickbite');
    console.log('================================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to create/update Admin user:', error);
    process.exit(1);
  }
}

createAdmin();
