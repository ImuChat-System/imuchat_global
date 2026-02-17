// 🧪 Test Supabase Connection - Mobile
// Run: npx ts-node test-supabase.ts

import { supabase } from './services/supabase';

async function testSupabaseConnection() {
    console.log('🔍 Testing Supabase connection...\n');

    try {
        // Test 1: Database connection
        console.log('1️⃣ Testing database connection...');
        const { data, error } = await supabase.from('profiles').select('id').limit(1);

        if (error) {
            console.log('❌ Database connection failed:', error.message);
            return false;
        }
        console.log('✅ Database connection successful!');

        // Test 2: Auth status
        console.log('\n2️⃣ Testing auth status...');
        const { data: session } = await supabase.auth.getSession();
        console.log('📱 Current session:', session.session ? 'Logged in' : 'Not logged in');

        // Test 3: Storage buckets
        console.log('\n3️⃣ Testing storage buckets...');
        const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

        if (bucketsError) {
            console.log('⚠️ Storage test failed:', bucketsError.message);
        } else {
            console.log('✅ Storage buckets:', buckets?.map(b => b.name).join(', '));
        }

        console.log('\n🎉 Supabase setup is ready!');
        console.log('\n📋 Next steps:');
        console.log('   1. Run the SQL schema in Supabase dashboard');
        console.log('   2. Test signup/login flow');
        console.log('   3. Start building authentication screens');

        return true;

    } catch (err) {
        console.log('💥 Connection test failed:', err);
        return false;
    }
}

// Run the test
testSupabaseConnection();