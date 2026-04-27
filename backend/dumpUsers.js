const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres', 'postgres.czctqusnljzhxmzfviqd', 'bilatnahamis', {
    host: 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    dialect: 'postgres'
});

async function run() {
    try {
        const [results] = await sequelize.query('SELECT id, email, type, "isVerified", "isLocked", "loginAttempts", "lockedUntil" FROM users');
        console.log('--- ALL USERS ---');
        results.forEach(u => {
            console.log(`ID: ${u.id} | Email: "${u.email}" | Type: ${u.type} | Verified: ${u.isVerified} | Locked: ${u.isLocked} | Attempts: ${u.loginAttempts}`);
        });
        console.log('-----------------');
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await sequelize.close();
    }
}
run();
