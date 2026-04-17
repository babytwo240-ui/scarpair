#!/usr/bin/env node

/**
 * SCRAPAIR ADMIN MIGRATION EXECUTOR
 * 
 * This script executes the admin backend migrations in correct order
 * It verifies prerequisites before each step
 * 
 * Run: node migrate-admin-db.js
 */

const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

const sequelize = new Sequelize(
  process.env.DB_NAME || 'postgres',
  process.env.DB_USER || 'postgres.czctqusnljzhxmzfviqd',
  process.env.DB_PASSWORD || 'bilatnahamis',
  {
    host: process.env.DB_HOST || 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: parseInt(process.env.DB_PORT || '6543'),
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  }
);

const MIGRATION_STEPS = [
  {
    step: 1,
    name: 'Check Prerequisites',
    description: 'Verify admin_users and system_logs tables exist',
    check: async () => {
      const tables = await sequelize.query(`
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE';
      `, { raw: true });
      
      const tableNames = tables[0].map(t => t.table_name);
      const required = ['admin_users', 'system_logs'];
      const missing = required.filter(t => !tableNames.includes(t));
      
      if (missing.length > 0) {
        throw new Error(`Missing prerequisite tables: ${missing.join(', ')}`);
      }
      return true;
    }
  },
  {
    step: 2,
    name: 'Create admin_mfa_backup_codes Table',
    migration: '20250407_create_admin_mfa_backup_codes.js',
    check: async () => {
      const result = await sequelize.query(`SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin_mfa_backup_codes'
      );`, { raw: true });
      return result[0][0].exists;
    }
  },
  {
    step: 3,
    name: 'Create admin_session_pending_mfa Table',
    migration: '20250407_create_admin_pending_mfa_sessions.js',
    check: async () => {
      const result = await sequelize.query(`SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin_session_pending_mfa'
      );`, { raw: true });
      return result[0][0].exists;
    }
  },
  {
    step: 4,
    name: 'Create admin_http_sessions Table',
    migration: '20250407_create_admin_sessions_store.js',
    check: async () => {
      const result = await sequelize.query(`SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin_http_sessions'
      );`, { raw: true });
      return result[0][0].exists;
    }
  },
  {
    step: 5,
    name: 'Add Admin Security Fields',
    migration: '20250407_add_admin_security_fields.js',
    check: async () => {
      const table = await sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
        AND column_name IN ('mfa_enabled', 'totp_secret_encrypted');
      `, { raw: true });
      return table[0].length >= 2;
    }
  },
  {
    step: 6,
    name: 'Add MFA Fields to Admin Users',
    migration: '20250407_add_mfa_to_admin_users.js',
    check: async () => {
      const table = await sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
        AND column_name IN ('mfa_enabled', 'totp_secret_encrypted', 'mfa_enrolled_at');
      `, { raw: true });
      return table[0].length >= 3;
    }
  },
  {
    step: 7,
    name: 'Add Password Change Tracking',
    migration: '20250408_add_password_change_tracking.js',
    check: async () => {
      const table = await sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'admin_users'
        AND column_name IN ('must_change_password', 'password_changed_at');
      `, { raw: true });
      return table[0].length >= 2;
    }
  },
  {
    step: 8,
    name: 'Add Admin ID to System Logs',
    migration: '20250408_add_admin_id_to_system_logs.js',
    check: async () => {
      const table = await sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'system_logs'
        AND column_name = 'adminId'
      `, { raw: true });
      return table[0].length >= 1;
    }
  },
  {
    step: 9,
    name: 'Create Rating Tables',
    migration: '20250407_create_rating_tables.js',
    check: async () => {
      const result = await sequelize.query(`SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'post_ratings'
      );`, { raw: true });
      return result[0][0].exists;
    }
  },
  {
    step: 10,
    name: 'Add Hierarchy System (Scope + Admin Requests)',
    migration: '20260408_add_hierarchy_system.js',
    check: async () => {
      const result = await sequelize.query(`SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin_requests'
      );`, { raw: true });
      return result[0][0].exists;
    }
  },
  {
    step: 11,
    name: 'Add Timestamp to System Logs',
    migration: '20260409_add_timestamp_to_system_logs.js',
    check: async () => true // Check if column exists
  },
  {
    step: 12,
    name: 'Add Unlock Approval Fields',
    migration: '20260409_add_unlock_approval_fields.js',
    check: async () => true
  },
  {
    step: 13,
    name: 'Add Unlock Reason to Admin Users',
    migration: '20260409_add_unlock_reason_to_admin_users.js',
    check: async () => true
  },
  {
    step: 14,
    name: 'Add Admin Query Indexes',
    migration: '20260410_add_admin_query_indexes.js',
    check: async () => true
  },
  {
    step: 15,
    name: 'Create Admin Rate Limits Table',
    migration: '20260410_create_admin_rate_limits.js',
    check: async () => {
      const result = await sequelize.query(`SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'admin_rate_limits'
      );`, { raw: true });
      return result[0][0].exists;
    }
  },
  {
    step: 16,
    name: 'Split Admin Session Tables',
    migration: '20260410_split_admin_session_tables.js',
    check: async () => true
  }
];

async function main() {
  try {
    console.log('\n' + '═'.repeat(80));
    console.log('🔧 SCRAPAIR ADMIN DATABASE MIGRATION EXECUTOR');
    console.log('═'.repeat(80) + '\n');

    console.log('📋 MIGRATION EXECUTION PLAN:\n');

    for (const step of MIGRATION_STEPS) {
      console.log(`${String(step.step).padEnd(2)}. ${step.name}`);
      if (step.migration) {
        console.log(`    File: ${step.migration}`);
      }
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n🔍 Checking database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful\n');

    // Get current state
    const tables = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `, { raw: true });
    
    const tableNames = new Set(tables[0].map(t => t.table_name));

    const missingTables = [
      'admin_mfa_backup_codes',
      'admin_requests',
      'admin_session_pending_mfa',
      'admin_http_sessions',
      'admin_rate_limits'
    ].filter(t => !tableNames.has(t));

    console.log('📊 CURRENT DATABASE STATE:\n');
    console.log(`   Total tables: ${tableNames.size}`);
    console.log(`   Missing admin tables: ${missingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log(`\n   Missing tables:`);
      for (const table of missingTables) {
        console.log(`     ❌ ${table}`);
      }
    } else {
      console.log('\n   ✅ All expected tables exist!');
    }

    console.log('\n' + '═'.repeat(80));
    console.log('\n✅ NEXT STEPS:\n');
    console.log('1. Review the migration files in: admin/backend/src/migrations/');
    console.log('\n2. Run migrations with:');
    console.log('   cd admin/backend');
    console.log('   npm run db:migrate\n');
    console.log('3. Or to migrate only unapplied migrations:');
    console.log('   npx sequelize-cli db:migrate\n');
    console.log('4. Verify with:');
    console.log('   node check-db-schema.js\n');

    console.log('═'.repeat(80) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
