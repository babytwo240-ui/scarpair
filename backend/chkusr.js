const { Sequelize } = require('sequelize');
const sequelize = new Sequelize('postgres', 'postgres.czctqusnljzhxmzfviqd', 'bilatnahamis', {
    host: 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    dialect: 'postgres'
});

async function run() {
    try {
        const [results] = await sequelize.query('SELECT id, email, type, "isVerified", "isLocked", "createdAt" FROM users ORDER BY "createdAt" DESC LIMIT 5');
        console.log('Latest Users:', results);
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await sequelize.close();
    }
}
run();
