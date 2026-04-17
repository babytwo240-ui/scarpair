#!/usr/bin/env node

/**
 * SCRAPAIR ADMIN MIGRATION HELPER
 * 
 * Interactive script to safely execute admin migrations
 * Includes pre-checks, execution, and verification
 * 
 * Run: node admin-migration-helper.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { Sequelize } = require('sequelize');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(color, text) {
  console.log(`${colors[color]}${text}${colors.reset}`);
}

function header(text) {
  console.log('\n' + '═'.repeat(80));
  log('bright', text);
  console.log('═'.repeat(80) + '\n');
}

function section(text) {
  console.log('\n' + '─'.repeat(80));
  log('cyan', text);
  console.log('─'.repeat(80) + '\n');
}

async function runCommand(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      shell: true,
      stdio: 'inherit'
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(true);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function checkPrerequisites() {
  header('📋 CHECKING PREREQUISITES');

  try {
    // Check if .env.local exists in admin/backend
    const adminEnvPath = path.join(__dirname, '..', 'admin', 'backend', '.env.local');
    log('blue', `Checking .env.local at: ${adminEnvPath}`);
    if (!fs.existsSync(adminEnvPath)) {
      log('red', `❌ .env.local not found in admin/backend/`);
      return false;
    }
    log('green', '✅ .env.local exists\n');

    // Load env
    require('dotenv').config({ path: adminEnvPath });

    // Check database connection
    log('blue', 'Connecting to database...');
    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: { require: true, rejectUnauthorized: false }
        }
      }
    );

    await sequelize.authenticate();
    log('green', '✅ Database connection successful\n');

    // Check required tables
    const tables = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `, { raw: true });

    const tableNames = new Set(tables[0].map(t => t.table_name));
    log('blue', 'Checking prerequisite tables...\n');

    const required = ['admin_users', 'system_logs'];
    let allExist = true;

    for (const table of required) {
      if (tableNames.has(table)) {
        log('green', `  ✅ ${table}`);
      } else {
        log('red', `  ❌ ${table} (MISSING)`);
        allExist = false;
      }
    }

    console.log();

    if (!allExist) {
      log('red', '❌ Prerequisites not met! All prerequisite tables must exist.');
      return false;
    }

    log('green', '✅ All prerequisites met!\n');

    // Get missing tables
    const missing = [
      'admin_mfa_backup_codes',
      'admin_requests',
      'admin_session_pending_mfa',
      'admin_http_sessions',
      'admin_rate_limits'
    ].filter(t => !tableNames.has(t));

    log('yellow', `Found ${missing.length} missing tables that will be created.\n`);

    await sequelize.close();
    return true;
  } catch (error) {
    log('red', `❌ Error: ${error.message}\n`);
    return false;
  }
}

async function checkMigrationFiles() {
  header('📁 CHECKING MIGRATION FILES');

  const migrationsPath = path.join(__dirname, '..', 'admin', 'backend', 'src', 'migrations');
  
  log('blue', `Migration directory: ${migrationsPath}\n`);

  if (!fs.existsSync(migrationsPath)) {
    log('red', `❌ Migrations directory not found!\n`);
    return false;
  }

  const requiredFiles = [
    '20250407_create_admin_mfa_backup_codes.js',
    '20250407_create_admin_pending_mfa_sessions.js',
    '20250407_create_admin_sessions_store.js',
    '20250407_add_admin_security_fields.js',
    '20250407_add_mfa_to_admin_users.js',
    '20250408_add_password_change_tracking.js',
    '20250408_add_admin_id_to_system_logs.js',
    '20250407_create_rating_tables.js',
    '20260408_add_hierarchy_system.js',
    '20260409_add_timestamp_to_system_logs.js',
    '20260409_add_unlock_approval_fields.js',
    '20260409_add_unlock_reason_to_admin_users.js',
    '20260410_add_admin_query_indexes.js',
    '20260410_create_admin_rate_limits.js',
    '20260410_split_admin_session_tables.js'
  ];

  let missing = [];
  let found = [];

  for (const file of requiredFiles) {
    if (fs.existsSync(path.join(migrationsPath, file))) {
      log('green', `  ✅ ${file}`);
      found.push(file);
    } else {
      log('yellow', `  ⚠️  ${file} (not found)`);
      missing.push(file);
    }
  }

  console.log();
  log('cyan', `Found: ${found.length}/${requiredFiles.length} files\n`);

  if (missing.length > 0) {
    log('yellow', '⚠️  Some migration files are missing. This is expected if they haven\'t been committed yet.');
    log('yellow', 'The sequelize-cli will skip them automatically.\n');
  }

  return true;
}

async function executeMigrations() {
  header('▶️  EXECUTING MIGRATIONS');

  const adminBackendPath = path.join(__dirname, '..', 'admin', 'backend');

  log('blue', 'Running migrations with sequelize-cli...\n');

  try {
    // Run migration command
    await runCommand('npm', ['run', 'db:migrate'], adminBackendPath);
    log('green', '\n✅ Migrations executed successfully!\n');
    return true;
  } catch (error) {
    log('red', `❌ Migration failed: ${error.message}\n`);
    return false;
  }
}

async function verifyResults() {
  header('✔️  VERIFYING RESULTS');

  try {
    const adminEnvPath = path.join(__dirname, '..', 'admin', 'backend', '.env.local');
    require('dotenv').config({ path: adminEnvPath });

    const sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASSWORD,
      {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        dialect: 'postgres',
        logging: false,
        dialectOptions: {
          ssl: { require: true, rejectUnauthorized: false }
        }
      }
    );

    await sequelize.authenticate();

    const tables = await sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
    `, { raw: true });

    const tableNames = new Set(tables[0].map(t => t.table_name));

    const expectedTables = [
      'admin_mfa_backup_codes',
      'admin_requests',
      'admin_session_pending_mfa',
      'admin_http_sessions',
      'admin_rate_limits'
    ];

    log('blue', 'Checking for newly created tables:\n');

    let allCreated = true;
    for (const table of expectedTables) {
      if (tableNames.has(table)) {
        log('green', `  ✅ ${table}`);
      } else {
        log('red', `  ❌ ${table}`);
        allCreated = false;
      }
    }

    console.log();

    // Get migration count
    const migrations = await sequelize.query('SELECT COUNT(*) as count FROM "SequelizeMeta"', { raw: true });
    const migrationCount = migrations[0][0].count;

    log('cyan', `Total migrations applied: ${migrationCount}\n`);

    await sequelize.close();

    if (allCreated) {
      log('green', '✅ All expected tables created successfully!\n');
      return true;
    } else {
      log('yellow', '⚠️  Some expected tables were not created. Check migration outputs above.\n');
      return false;
    }
  } catch (error) {
    log('red', `❌ Verification failed: ${error.message}\n`);
    return false;
  }
}

async function main() {
  log('bright', '\n');
  log('bright', '██████╗ ███████╗ █████╗ ██████╗ ░░░░░░ ███╗   ███╗██╗ ██████╗ ');
  log('bright', '██╔══██╗██╔════╝██╔══██╗██╔══██╗░░░░░░ ████╗ ████║██║██╔════╝ ');
  log('bright', '██████╔╝███████╗███████║██████╔╝█████╗ ██╔████╔██║██║██║  ███╗');
  log('bright', '██╔══██╗╚════██║██╔══██║██╔═══╝ ╚════╝ ██║╚██╔╝██║██║██║   ██║');
  log('bright', '██║  ██║███████║██║  ██║██║           ██║ ╚═╝ ██║██║╚██████╔╝');
  log('bright', '╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝           ╚═╝     ╚═╝╚═╝ ╚═════╝ ');
  log('bright', '\n');
  log('bright', 'ADMIN DATABASE MIGRATION HELPER v1.0\n');

  // Step 1: Check prerequisites
  log('yellow', '📋 Step 1 of 4: Checking prerequisites...\n');
  const preReqOk = await checkPrerequisites();

  if (!preReqOk) {
    log('red', '❌ Cannot proceed. Prerequisites not met.\\n');
    process.exit(1);
  }

  // Step 2: Check migration files
  log('yellow', '📁 Step 2 of 4: Checking migration files...\n');
  const filesOk = await checkMigrationFiles();

  // Step 3: Execute migrations
  log('yellow', '▶️  Step 3 of 4: Executing migrations...\n');
  const migrationOk = await executeMigrations();

  if (!migrationOk) {
    log('red', '⚠️  Migrations may have failed. Check the output above.\\n');
    // Don't exit, continue to verification
  }

  // Step 4: Verify
  log('yellow', '✔️  Step 4 of 4: Verifying results...\n');
  const verifyOk = await verifyResults();

  // Summary
  header('📊 MIGRATION SUMMARY');

  log('cyan', 'Steps Completed:\n');
  log('green', '  ✅ Prerequisites checked');
  log('green', '  ✅ Migration files verified');
  if (migrationOk) log('green', '  ✅ Migrations executed');
  else log('yellow', '  ⚠️  Migrations completed (check for errors)');
  if (verifyOk) log('green', '  ✅ Verification passed');
  else log('yellow', '  ⚠️  Verification incomplete');

  console.log();

  if (verifyOk) {
    log('green', '\n🎉 MIGRATION COMPLETED SUCCESSFULLY!\n');
    log('cyan', 'Next steps:\n');
    log('cyan', '  1. Initialize admin database:');
    log('cyan', '     cd admin/backend && node scripts/initDatabase.js\n');
    log('cyan', '  2. Create test admins:');
    log('cyan', '     node scripts/createTestAdmins.js\n');
    log('cyan', '  3. Start admin backend:');
    log('cyan', '     npm run dev\n');
  } else {
    log('yellow', '\n⚠️  MIGRATION COMPLETED WITH ISSUES\n');
    log('yellow', 'Review the output above for any errors and retry if needed.\n');
  }

  process.exit(verifyOk ? 0 : 1);
}

main().catch((error) => {
  log('red', `\n❌ Unexpected error: ${error.message}\n`);
  process.exit(1);
});
