import '../config/env';
import { connectDatabase } from '../config/database';
import { loadSecretsFromInfisical } from '../config/infisical';
import { User } from '../models/User';
import { ROLES } from '../constants';
import { hashPassword } from '../utils';
import { logger } from '../config/logger';

async function createAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'admin.info@qickbite.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@321';
  const adminName = process.env.ADMIN_NAME || 'QuickBite Super Admin';

  try {
    logger.info('Initializing Admin Creation Script...');

    // 1. Fetch secrets from Infisical if configured
    await loadSecretsFromInfisical();

    // 2. Connect to MongoDB
    await connectDatabase();

    // 3. Hash the admin password
    const hashedPassword = await hashPassword(adminPassword);

    // 4. Check if user already exists
    let admin = await User.findOne({ email: adminEmail.toLowerCase() });

    if (admin) {
      // Update existing user to Admin role and set password
      admin.password = hashedPassword;
      admin.role = ROLES.ADMIN;
      admin.isEmailVerified = true;
      admin.isActive = true;
      admin.isSuspended = false;
      await admin.save();

      logger.info(`✅ Admin user updated successfully: ${adminEmail}`);
    } else {
      // Create new Admin user
      admin = await User.create({
        name: adminName,
        email: adminEmail.toLowerCase(),
        password: hashedPassword,
        role: ROLES.ADMIN,
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        isSuspended: false,
      });

      logger.info(`✅ New Admin user created successfully: ${adminEmail}`);
    }

    console.log('\n================================================');
    console.log('🎉 ADMIN CREDENTIALS CONFIGURED:');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Role:     ${ROLES.ADMIN}`);
    console.log('================================================\n');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to create/update Admin user:', error);
    process.exit(1);
  }
}

createAdmin();
