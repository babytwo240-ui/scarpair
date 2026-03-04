"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseConfig = exports.supabaseClient = void 0;
exports.validateAwsConfig = validateAwsConfig;
const supabase_js_1 = require("@supabase/supabase-js");
exports.supabaseClient = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
exports.supabaseConfig = {
    url: process.env.SUPABASE_URL || '',
    bucket: process.env.SUPABASE_STORAGE_BUCKET || 'message-images',
    anonKey: process.env.SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
};
function validateAwsConfig() {
    const requiredVars = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
    const missingVars = requiredVars.filter(v => !process.env[v]);
    if (missingVars.length > 0) {
        console.warn(`⚠️  Missing Supabase environment variables: ${missingVars.join(', ')}`);
        console.warn('Image uploads will be disabled. Configure these variables:');
        console.warn('   SUPABASE_URL');
        console.warn('   SUPABASE_ANON_KEY');
        console.warn('   SUPABASE_SERVICE_ROLE_KEY');
    }
    else {
        console.log('✅ Supabase Storage configured and ready for image uploads');
    }
}
exports.default = exports.supabaseClient;
//# sourceMappingURL=aws.js.map