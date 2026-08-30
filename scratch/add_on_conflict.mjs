import fs from 'fs';
import path from 'path';

const projectRoot = 'c:\\\\Users\\\\angel chisvert\\\\Desktop\\\\ANDREA APP';
const cloudSyncPath = path.join(projectRoot, 'apps', 'mobile', 'src', 'services', 'cloud-sync', 'CloudSyncEngine.ts');
let cloudSync = fs.readFileSync(cloudSyncPath, 'utf8');

// 1. Wishes upsert
cloudSync = cloudSync.replace(
  /updated_at: new Date\(\)\.toISOString\(\),\s*\}\);/,
  `updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });`
);

// 2. Saved Places upsert
cloudSync = cloudSync.replace(
  /visits: place\.visits,\s*updated_at: new Date\(\)\.toISOString\(\),\s*\}\);/,
  `visits: place.visits,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });`
);

// 3. Map Places upsert
cloudSync = cloudSync.replace(
  /is_milestone: mapPlace\.isMilestone \?\? false,\s*updated_at: new Date\(\)\.toISOString\(\),\s*\}\);/,
  `is_milestone: mapPlace.isMilestone ?? false,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });`
);

// 4. Couple Events upsert
cloudSync = cloudSync.replace(
  /status: event\.status,\s*updated_at: new Date\(\)\.toISOString\(\),\s*\}\);/,
  `status: event.status,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });`
);

fs.writeFileSync(cloudSyncPath, cloudSync, 'utf8');
console.log('✅ Added onConflict id to all Supabase upserts in CloudSyncEngine.ts');
