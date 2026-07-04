import { query, schemaQualified } from '../config/database';
import { hashPassword } from '../utils/bcrypt';
import dotenv from 'dotenv';

dotenv.config();

async function seedSuperAdmin() {
  console.log('🚀 Starting Super Admin seed...');
  
  try {
    // Super Admin məlumatları
    const superAdmin = {
      name: 'Mursal Sadigli',
      email: 'sadiqli2024@gmail.com',
      password: 'sadigli2024!',
      role: 'SUPER_ADMIN',
    };

    // 1. Email ilə istifadəçini yoxla
    const check = await query(
      `SELECT id, name, email, role FROM ${schemaQualified}.users WHERE email = $1`,
      [superAdmin.email]
    );

    // 2. Əgər varsa, məlumatları göstər
    if (check.rows.length > 0) {
      console.log('✅ Super Admin already exists!');
      console.log('📋 User Info:');
      console.log(`   👤 Name: ${check.rows[0].name}`);
      console.log(`   📧 Email: ${check.rows[0].email}`);
      console.log(`   🎭 Role: ${check.rows[0].role}`);
      console.log(`   🆔 ID: ${check.rows[0].id}`);
      
      // Əgər rol SUPER_ADMIN deyilsə, yenilə
      if (check.rows[0].role !== 'SUPER_ADMIN') {
        console.log('⚠️  Updating role to SUPER_ADMIN...');
        await query(
          `UPDATE ${schemaQualified}.users 
           SET role = 'SUPER_ADMIN', 
               permissions = '{}'::JSONB,
               updated_at = CURRENT_TIMESTAMP
           WHERE email = $1`,
          [superAdmin.email]
        );
        console.log('✅ Role updated to SUPER_ADMIN!');
      }
      return;
    }

    // 3. Yoxdursa, yeni yarat
    const hashedPassword = await hashPassword(superAdmin.password);
    
    const result = await query(
      `INSERT INTO ${schemaQualified}.users (
        name,
        email,
        password,
        role,
        permissions,
        is_active,
        status,
        must_change_password,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)
      RETURNING id, name, email, role`,
      [
        superAdmin.name,
        superAdmin.email,
        hashedPassword,
        superAdmin.role,
        JSON.stringify([]), // permissions
        true, // is_active
        'ACTIVE',
        false, // must_change_password
      ]
    );

    console.log('✅ Super Admin created successfully!');
    console.log('📋 User Info:');
    console.log(`   👤 Name: ${result.rows[0].name}`);
    console.log(`   📧 Email: ${result.rows[0].email}`);
    console.log(`   🎭 Role: ${result.rows[0].role}`);
    console.log(`   🆔 ID: ${result.rows[0].id}`);
    console.log(`   🔑 Password: ${superAdmin.password}`);

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

// İşlət
seedSuperAdmin()
  .then(() => {
    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  });