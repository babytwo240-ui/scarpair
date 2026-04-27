const { Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const sequelize = new Sequelize('postgres', 'postgres.czctqusnljzhxmzfviqd', 'bilatnahamis', {
    host: 'aws-1-ap-northeast-1.pooler.supabase.com',
    port: 6543,
    dialect: 'postgres'
});

async function run() {
    try {
        const hash = await bcrypt.hash('Scrapair123!', 10);
        await sequelize.query(`UPDATE users SET password = :hash`, {
            replacements: { hash }
        });
        console.log('All user passwords have been reset to Scrapair123!');
    } catch (e) {
        console.error('Error resetting passwords:', e);
    } finally {
        await sequelize.close();
    }
}

run();
