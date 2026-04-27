const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize('postgres', 'postgres.czctqusnljzhxmzfviqd', 'bilatnahamis', {
    host: 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    dialect: 'postgres'
});

async function run() {
    try {
        const [results] = await sequelize.query('SELECT id, email, type, password, "isVerified", "isLocked" FROM users WHERE email = \'business@gmail.com\'');
        if (results.length > 0) {
            const user = results[0];
            console.log('User:', user.email);
            console.log('Stored Hash:', user.password);
            
            const isMatch = await bcrypt.compare('Scrapair123!', user.password);
            console.log('Does "Scrapair123!" match?', isMatch);
            
            const expectedHashPrefix = '$2a$10$';
            console.log('Hash starts with expected prefix?', user.password.startsWith(expectedHashPrefix));
        } else {
            console.log('User not found');
        }
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await sequelize.close();
    }
}
run();
