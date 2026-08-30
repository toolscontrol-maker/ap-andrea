import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\Users\\angel chisvert\\Desktop\\ANDREA APP';

const envContent = `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyCoOQUfW0CwUpJGBElhUy2T3fy0_znH73Q
EXPO_PUBLIC_SUPABASE_URL=https://qxnsksrdqmrsjsqxyxtq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_KUj-Fe-pc8rGo4FPb6wOIQ_JTikwRfz
`;

fs.writeFileSync(path.join(projectRoot, '.env'), envContent, 'utf8');
fs.writeFileSync(path.join(projectRoot, 'apps', 'mobile', '.env'), envContent, 'utf8');
fs.writeFileSync(path.join(projectRoot, 'apps', 'mobile', '.env.local'), envContent, 'utf8');

console.log('✅ .env files updated with active Supabase project.');
