import test from 'node:test';
import assert from 'node:assert/strict';

// Mock storage implementation simulating browser/device storage
let isStorageFailing = false;
const memoryStorage = new Map();

const StorageEngine = {
  safeParse(raw, defaultValue, validator) {
    if (raw === null || raw === undefined || raw === '') {
      return defaultValue;
    }
    try {
      const parsed = JSON.parse(raw);
      if (validator && !validator(parsed)) {
        return defaultValue;
      }
      return parsed;
    } catch (err) {
      return defaultValue;
    }
  },

  async getRaw(key) {
    if (isStorageFailing) throw new Error('Storage device failure');
    return memoryStorage.get(key) ?? null;
  },

  async setRaw(key, value) {
    if (isStorageFailing) throw new Error('Storage quota exceeded');
    memoryStorage.set(key, value);
  },

  async getItem(key, defaultValue, validator) {
    try {
      const raw = await this.getRaw(key);
      return this.safeParse(raw, defaultValue, validator);
    } catch {
      return defaultValue;
    }
  },

  async setItem(key, value) {
    try {
      await this.setRaw(key, JSON.stringify(value));
    } catch (e) {
      // Graceful error logging
    }
  },

  async updateItem(key, updater, defaultValue, validator) {
    const current = await this.getItem(key, defaultValue, validator);
    const updated = updater(current);
    await this.setItem(key, updated);
    return updated;
  },

  async removeItem(key) {
    memoryStorage.delete(key);
  },

  async backupKey(key) {
    const raw = await this.getRaw(key);
    if (raw !== null) {
      const backupKey = `${key}_backup_${Date.now()}`;
      await this.setRaw(backupKey, raw);
      return backupKey;
    }
    return null;
  },

  async getBackupKeys(baseKey) {
    const keys = [];
    for (const k of memoryStorage.keys()) {
      if (k.includes('_backup_')) {
        if (!baseKey || k.startsWith(baseKey)) {
          keys.push(k);
        }
      }
    }
    return keys.sort().reverse();
  },

  async restoreBackup(backupKey, targetKey) {
    const raw = await this.getRaw(backupKey);
    if (raw === null) return false;
    await this.setRaw(targetKey, raw);
    return true;
  },

  async migrateKey(sourceKey, targetKey, migrationFn, defaultValue, validator) {
    const existingTargetRaw = await this.getRaw(targetKey);
    if (existingTargetRaw !== null) {
      return this.safeParse(existingTargetRaw, defaultValue, validator);
    }
    const sourceRaw = await this.getRaw(sourceKey);
    if (sourceRaw === null) {
      return defaultValue;
    }
    await this.backupKey(sourceKey);
    const parsedOld = JSON.parse(sourceRaw);
    const migrated = migrationFn(parsedOld);
    if (validator && !validator(migrated)) {
      return defaultValue;
    }
    await this.setItem(targetKey, migrated);
    return migrated;
  },

  async exportAllLocalData() {
    const exportBundle = {
      version: 1,
      exportedAt: new Date().toISOString(),
      client: 'Andrea App (Local Beta)',
      keys: {},
    };
    for (const [k, v] of memoryStorage.entries()) {
      try {
        exportBundle.keys[k] = JSON.parse(v);
      } catch {
        exportBundle.keys[k] = v;
      }
    }
    return JSON.stringify(exportBundle, null, 2);
  },

  async importAllLocalData(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object' || !parsed.keys || typeof parsed.keys !== 'object') {
        return { success: false, importedKeys: 0, error: 'Formato inválido' };
      }
      let count = 0;
      for (const [k, v] of Object.entries(parsed.keys)) {
        await this.setItem(k, v);
        count++;
      }
      return { success: true, importedKeys: count };
    } catch (e) {
      return { success: false, importedKeys: 0, error: e.message };
    }
  },

  async clearAllData() {
    memoryStorage.clear();
  }
};

test('1. JSON Corrupto: Debería devolver fallback seguro sin lanzar error ni romper app', async () => {
  memoryStorage.set('test_corrupt', '{unclosed-json-string:::');
  const fallback = [{ id: 'safe-fallback' }];
  const res = await StorageEngine.getItem('test_corrupt', fallback);
  assert.deepEqual(res, fallback);
});

test('2. Validator Fallido: Debería rechazar payload con schema incorrecto y retornar fallback', async () => {
  memoryStorage.set('test_schema', JSON.stringify({ wrongProp: 123 }));
  const isWish = (val) => typeof val === 'object' && val !== null && 'title' in val;
  const fallback = { title: 'Deseo por defecto' };
  const res = await StorageEngine.getItem('test_schema', fallback, isWish);
  assert.deepEqual(res, fallback);
});

test('3. Migración Segura: Debería migrar versión anterior, crear backup y guardar target', async () => {
  const oldPlaces = [{ id: 'p1', name: 'Le Favole', visitsCount: 1 }];
  memoryStorage.set('andrea_places_v3', JSON.stringify(oldPlaces));

  const migrated = await StorageEngine.migrateKey(
    'andrea_places_v3',
    'andrea_places_v4',
    (oldList) => oldList.map(p => ({ id: p.id, name: p.name, visits: [{ id: 'v1', date: '2025-07-15' }] })),
    []
  );

  assert.equal(migrated.length, 1);
  assert.equal(migrated[0].visits[0].date, '2025-07-15');
  const backups = await StorageEngine.getBackupKeys('andrea_places_v3');
  assert.ok(backups.length >= 1);
});

test('4. Restore Backup: Debería restaurar datos exactos desde una copia previa', async () => {
  memoryStorage.set('andrea_wishes_backup_12345', JSON.stringify([{ id: 'w1', title: 'Viaje a Roma' }]));
  const ok = await StorageEngine.restoreBackup('andrea_wishes_backup_12345', 'andrea_wishes_v1');
  assert.ok(ok);
  const restored = await StorageEngine.getItem('andrea_wishes_v1', []);
  assert.equal(restored[0].title, 'Viaje a Roma');
});

test('5. Borrado Selectivo: Debería eliminar solo la clave indicada conservando las demás', async () => {
  memoryStorage.set('key_a', JSON.stringify({ a: 1 }));
  memoryStorage.set('key_b', JSON.stringify({ b: 2 }));
  await StorageEngine.removeItem('key_a');
  assert.equal(await StorageEngine.getItem('key_a', null), null);
  assert.deepEqual(await StorageEngine.getItem('key_b', null), { b: 2 });
});

test('6. Borrado Total: Debería limpiar todas las claves locales de forma atómica', async () => {
  memoryStorage.set('key_1', 'val1');
  memoryStorage.set('key_2', 'val2');
  await StorageEngine.clearAllData();
  assert.equal(memoryStorage.size, 0);
});

test('7. Almacenamiento no disponible / Quota Error: No debe tumbar el proceso', async () => {
  isStorageFailing = true;
  const res = await StorageEngine.getItem('any_key', 'fallback_on_error');
  assert.equal(res, 'fallback_on_error');
  isStorageFailing = false;
});

test('8. Export / Import Bundle: Debería exportar e importar datos locales conservando estructura', async () => {
  memoryStorage.set('andrea_wishes_v1', JSON.stringify([{ id: 'w1', title: 'Cena de San Valentín' }]));
  memoryStorage.set('andrea_places_v4', JSON.stringify([{ id: 'p1', name: 'Alqueria del Pou' }]));

  const exportedJson = await StorageEngine.exportAllLocalData();
  assert.ok(exportedJson.includes('Alqueria del Pou'));

  await StorageEngine.clearAllData();
  assert.equal(memoryStorage.size, 0);

  const importResult = await StorageEngine.importAllLocalData(exportedJson);
  assert.equal(importResult.success, true);
  assert.equal(importResult.importedKeys >= 2, true);

  const restoredWishes = await StorageEngine.getItem('andrea_wishes_v1', []);
  assert.equal(restoredWishes[0].title, 'Cena de San Valentín');
});
