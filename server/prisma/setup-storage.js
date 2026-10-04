import supabase from '../src/config/supabase.js';

if (!supabase) {
  console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY belum di-set di .env');
  process.exit(1);
}

async function ensureBucket(name, isPublic) {
  const { data: list } = await supabase.storage.listBuckets();
  const exists = list?.some((b) => b.name === name);
  if (exists) {
    console.log(`bucket ${name}: sudah ada`);
    return;
  }
  const { error } = await supabase.storage.createBucket(name, { public: isPublic });
  if (error) {
    console.error(`bucket ${name}: GAGAL ->`, error.message);
  } else {
    console.log(`bucket ${name}: dibuat (public=${isPublic})`);
  }
}

await ensureBucket('avatars', true);
await ensureBucket('covers', true);
console.log('Selesai');