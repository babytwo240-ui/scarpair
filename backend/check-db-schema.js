#!/usr/bin/env node

/**
 * DATABASE SCHEMA DIAGNOSTIC TOOL
 * Checks current database schema and identifies missing tables
 * Run: node check-db-schema.js
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

const EXPECTED_TABLES = {
  'Main App': [
    'users',
    'materials',
    'waste_posts',
    'collections',
    'conversations',
    'messages',
    'notifications',
    'post_messages',
    'reviews',
    'password_audits',
    'user_ratings',
    'post_ratings',
    'reports',
    'system_logs'
  ],
  'Admin App': [
    'admin_users',
    'admin_mfa_backup_codes',
    'admin_requests',
    'admin_sessions',
    'admin_session_pending_mfa',
    'admin_http_sessions',
    'admin_rate_limits'
  ]
};

async function checkDatabase() {
  try {
    console.log('\n🔍 Connecting to database...');
    console.log(`Host: ${process.env.DB_HOST}`);
    console.log(`Database: ${process.env.DB_NAME}`);
    
    await sequelize.authenticate();
    console.log('✅ Connected successfully\n');

    // Get all tables in public schema
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    const existingTables = await sequelize.query(query, { raw: true });
    const tableNames = new Set(existingTables[0].map(t => t.table_name));

    console.log('📊 DATABASE SCHEMA STATUS\n');
    console.log('═'.repeat(70));

    let mainMissing = [];
    let adminMissing = [];

    for (const [category, tables] of Object.entries(EXPECTED_TABLES)) {
      console.log(`\n${category}:`);
      console.log('-'.repeat(70));
      
      let missing = [];
      for (const table of tables) {
        if (tableNames.has(table)) {
          console.log(`  ✅ ${table}`);
        } else {
          console.log(`  ❌ ${table} (MISSING)`);
          missing.push(table);
        }
      }
      
      if (category === 'Main App') mainMissing = missing;
      if (category === 'Admin App') adminMissing = missing;
    }

    // Show additional tables not in expected list
    const expectedSet = new Set(
      Object.values(EXPECTED_TABLES).flat()
    );
    const additionalTables = Array.from(tableNames).filter(t => !expectedSet.has(t));
    
    if (additionalTables.length > 0) {
      console.log(`\n📌 Additional Tables Found:`);
      console.log('-'.repeat(70));
      for (const table of additionalTables) {
        console.log(`  ℹ️  ${table}`);
      }
    }

    // Show SequelizeMeta (migrations table)
    if (tableNames.has('SequelizeMeta')) {
      const migrations = await sequelize.query('SELECT name FROM "SequelizeMeta" ORDER BY name;', { raw: true });
      console.log(`\n📝 Applied Migrations (${migrations[0].length}):`);
      console.log('-'.repeat(70));
      for (const m of migrations[0]) {
        console.log(`  ✔️  ${m.name}`);
      }
    }

    // Summary
    console.log('\n' + '═'.repeat(70));
    console.log('\n📋 MIGRATION SUMMARY\n');
    
    const totalExpected = Object.values(EXPECTED_TABLES).flat().length;
    const totalExisting = Array.from(tableNames).filter(t => expectedSet.has(t)).length;
    
    console.log(`Total Expected Tables: ${totalExpected}`);
    console.log(`Total Existing Tables: ${totalExisting}`);
    console.log(`Missing Tables: ${totalExpected - totalExisting}\n`);

    if (mainMissing.length === 0 && adminMissing.length === 0) {
      console.log('✅ All tables exist! No migrations needed.');
    } else {
      console.log('⚠️  Missing Tables by Category:\n');
      if (mainMissing.length > 0) {
        console.log(`  Main App (${mainMissing.length}): ${mainMissing.join(', ')}`);
      }
      if (adminMissing.length > 0) {
        console.log(`  Admin App (${adminMissing.length}): ${adminMissing.join(', ')}`);
      }
      console.log('\n💡 Run: npm run db:migrate  (in backend/)');
      console.log('💡 Run: npm run db:migrate  (in admin/backend/)');
    }

    console.log('\n' + '═'.repeat(70) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('  1. Database is accessible');
    console.error('  2. .env.local file exists in current folder');
    console.error('  3. Database credentials are correct\n');
    process.exit(1);
  }
}

checkDatabase();
