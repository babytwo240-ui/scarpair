import { User } from './src/models';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

async function check() {
    const envFileLocal = path.resolve(__dirname, './.env.local');
    dotenv.config({ path: fs.existsSync(envFileLocal) ? envFileLocal : path.resolve(__dirname, './.env') });

    try {
        const count = await User.count();
        console.log(`Total users in DB: ${count}`);
        
        const users = await User.findAll({
            attributes: ['id', 'email', 'type'],
            limit: 10
        });
        console.log('User sample:');
        users.forEach((u: any) => console.log(` - ${u.email} (${u.type})`));
        
        const target = await User.findOne({ where: { email: 'amama.1wellplayed@gmail.com' } });
        console.log(`Searching for amama.1wellplayed@gmail.com... Result: ${target ? 'FOUND' : 'NOT FOUND'}`);
        if (target) {
            console.log(`Type in DB: "${target.type}"`);
        }
    } catch (e) {
        console.error(e);
    } finally {
        process.exit(0);
    }
}

check();
