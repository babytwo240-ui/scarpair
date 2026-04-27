const axios = require('axios');

async function test() {
    console.log('--- Testing Login Fix ---');
    const baseUrl = 'http://localhost:5000/api';
    
    // Testing with business@gmail.com (lowercase in DB)
    const testCases = [
        { email: 'business@gmail.com', password: 'Scrapair123!', label: 'Exact match' },
        { email: ' BUSINESS@gmail.com ', password: 'Scrapair123!', label: 'Case & Space mismatch' }
    ];

    for (const tc of testCases) {
        try {
            console.log(`Testing [${tc.label}] with email: "${tc.email}"`);
            const response = await axios.post(`${baseUrl}/auth/business/login`, {
                email: tc.email,
                password: tc.password
            });
            console.log(`✅ Success: ${response.data.message}`);
        } catch (error) {
            console.log(`❌ Failed: ${error.response?.data?.error || error.message}`);
        }
    }
}

test();
