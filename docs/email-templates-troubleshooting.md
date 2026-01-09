# Email Template Troubleshooting Útmutató

## Áttekintés

Ez az útmutató segít a leggyakoribb problémák diagnosztizálásában és megoldásában az email template adatbázis integráció során.

## Diagnosztikai Eszközök

### 1. Rendszer Állapot Ellenőrzése

```typescript
// scripts/system-health-check.ts
import { db } from '$lib/server/database';
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';
import { PerformanceMonitor } from '$lib/server/database/repositories';

async function systemHealthCheck() {
  console.log('🔍 Rendszer állapot ellenőrzése...\n');

  // Adatbázis kapcsolat
  try {
    await db.select().from(emailTemplates).limit(1);
    console.log('✅ Adatbázis kapcsolat: OK');
  } catch (error) {
    console.log('❌ Adatbázis kapcsolat: HIBA');
    console.error('   ', error.message);
  }

  // Template repository
  try {
    const repository = new DatabaseTemplateRepository(db);
    const templates = await repository.getAllActiveTemplates();
    console.log(`✅ Template repository: OK (${templates.length} aktív template)`);
  } catch (error) {
    console.log('❌ Template repository: HIBA');
    console.error('   ', error.message);
  }

  // Cache állapot
  try {
    const monitor = new PerformanceMonitor();
    const metrics = await monitor.getMetrics();
    console.log(`✅ Cache: OK (hit rate: ${metrics.cacheHitRate}%)`);
  } catch (error) {
    console.log('❌ Cache: HIBA');
    console.error('   ', error.message);
  }

  // Template validáció
  try {
    const repository = new DatabaseTemplateRepository(db);
    const templates = await repository.getAllActiveTemplates();

    let validCount = 0;
    for (const template of templates) {
      try {
        // Alapvető validáció
        if (template.subjectTemplate && template.htmlTemplate) {
          validCount++;
        }
      } catch (error) {
        console.log(`⚠️  Template validáció hiba: ${template.type}`);
      }
    }

    console.log(`✅ Template validáció: ${validCount}/${templates.length} valid`);
  } catch (error) {
    console.log('❌ Template validáció: HIBA');
    console.error('   ', error.message);
  }
}

systemHealthCheck();
```

### 2. Részletes Diagnosztika

```typescript
// scripts/detailed-diagnostics.ts
import { db } from '$lib/server/database';
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';

async function detailedDiagnostics() {
  console.log('🔬 Részletes diagnosztika...\n');

  const repository = new DatabaseTemplateRepository(db);

  // Template statisztikák
  const templates = await repository.getAllActiveTemplates();
  console.log('📊 Template Statisztikák:');
  console.log(`   Összes aktív template: ${templates.length}`);

  const typeStats = templates.reduce((acc, t) => {
    acc[t.type] = (acc[t.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(typeStats).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  // Méret statisztikák
  const sizes = templates.map(t => ({
    type: t.type,
    subjectSize: t.subjectTemplate.length,
    htmlSize: t.htmlTemplate.length,
    textSize: t.textTemplate?.length || 0
  }));

  console.log('\n📏 Méret Statisztikák:');
  const avgHtmlSize = sizes.reduce((sum, s) => sum + s.htmlSize, 0) / sizes.length;
  console.log(`   Átlagos HTML méret: ${Math.round(avgHtmlSize)} karakter`);

  const largeTemplates = sizes.filter(s => s.htmlSize > 10000);
  if (largeTemplates.length > 0) {
    console.log(`   ⚠️  Nagy template-ek (>10KB): ${largeTemplates.length}`);
    largeTemplates.forEach(t => {
      console.log(`      ${t.type}: ${t.htmlSize} karakter`);
    });
  }

  // Hiányzó mezők
  console.log('\n🔍 Hiányzó Mezők Ellenőrzése:');
  templates.forEach(template => {
    const issues = [];

    if (!template.subjectTemplate) issues.push('subject');
    if (!template.htmlTemplate) issues.push('html');
    if (!template.requiredData || template.requiredData.length === 0) issues.push('requiredData');

    if (issues.length > 0) {
      console.log(`   ⚠️  ${template.type}: hiányzó ${issues.join(', ')}`);
    }
  });
}

detailedDiagnostics();
```

## Gyakori Problémák és Megoldások

### 1. Template Nem Található

**Tünetek:**

- `TEMPLATE_NOT_FOUND` hiba
- Email küldés sikertelen
- Üres template válasz

**Diagnosztika:**

```typescript
// Template létezésének ellenőrzése
const template = await repository.getTemplateByType('email-verification');
if (!template) {
  console.log('Template nem található az adatbázisban');

  // Ellenőrzés, hogy deaktív-e
  const allTemplates = await db.select()
    .from(emailTemplates)
    .where(eq(emailTemplates.type, 'email-verification'));

  if (allTemplates.length > 0) {
    console.log('Template létezik, de inaktív');
  }
}
```

**Megoldások:**

1. **Template aktiválása:**

```typescript
await repository.updateTemplate(templateId, { isActive: true });
```

2. **Template létrehozása:**

```typescript
await repository.createTemplate({
  type: 'email-verification',
  name: 'Email Verification',
  subjectTemplate: 'Verify your email',
  htmlTemplate: '<p>Please verify: {{verificationUrl}}</p>',
  textTemplate: 'Please verify: {{verificationUrl}}',
  requiredData: ['verificationUrl'],
  optionalData: []
});
```

3. **Migráció futtatása:**

```typescript
const migrationService = new TemplateMigrationService(db);
await migrationService.migrateBuiltInTemplates();
```

### 2. Adatbázis Kapcsolat Problémák

**Tünetek:**

- `DATABASE_CONNECTION_ERROR`
- Timeout hibák
- Kapcsolat megszakadás

**Diagnosztika:**

```typescript
// Kapcsolat tesztelése
try {
  const startTime = Date.now();
  await db.select().from(emailTemplates).limit(1);
  const duration = Date.now() - startTime;

  console.log(`Adatbázis válaszidő: ${duration}ms`);

  if (duration > 1000) {
    console.log('⚠️  Lassú adatbázis kapcsolat');
  }
} catch (error) {
  console.error('Adatbázis kapcsolat hiba:', error);
}
```

**Megoldások:**

1. **Connection Pool beállítások:**

```typescript
// drizzle.config.ts
export default {
  // ...
  dbCredentials: {
    // ...
    max: 20,        // Maximum kapcsolatok
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000
  }
};
```

2. **Retry logika:**

```typescript
async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      const delay = Math.pow(2, i) * 1000; // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

3. **Kapcsolat monitoring:**

```typescript
// Kapcsolat állapot ellenőrzése
setInterval(async () => {
  try {
    await db.select().from(emailTemplates).limit(1);
  } catch (error) {
    console.error('Adatbázis kapcsolat elveszett:', error);
    // Újracsatlakozás vagy riasztás
  }
}, 30000); // 30 másodpercenként
```

### 3. Cache Problémák

**Tünetek:**

- Régi template tartalom
- Lassú lekérdezések
- `CACHE_ERROR` hibák

**Diagnosztika:**

```typescript
// Cache állapot ellenőrzése
const cache = new TemplateCache();

// Cache méret
const cacheSize = await cache.getSize();
console.log(`Cache méret: ${cacheSize} bejegyzés`);

// Cache hit rate
const monitor = new PerformanceMonitor();
const metrics = await monitor.getMetrics();
console.log(`Cache hit rate: ${metrics.cacheHitRate}%`);

// Specifikus kulcs ellenőrzése
const key = `template:type:email-verification`;
const cached = await cache.get(key);
console.log(`Cache tartalom (${key}):`, cached ? 'létezik' : 'hiányzik');
```

**Megoldások:**

1. **Cache törlése:**

```typescript
// Teljes cache törlése
await cache.clear();

// Specifikus template cache törlése
await repository.invalidateCache('email-verification');
```

2. **Cache warm-up:**

```typescript
// Cache előmelegítése
await repository.warmUpCache();
```

3. **Cache beállítások optimalizálása:**

```typescript
const cache = new TemplateCache({
  ttl: 3600,           // 1 óra
  maxSize: 1000,       // Maximum bejegyzések
  checkPeriod: 600     // Cleanup gyakoriság
});
```

### 4. Template Renderelési Hibák

**Tünetek:**

- `TEMPLATE_VALIDATION_FAILED`
- Hiányzó változók
- Formázási problémák

**Diagnosztika:**

```typescript
// Template renderelés tesztelése
const template = await repository.getTemplateByType('email-verification');
const testData = {
  name: 'Test User',
  verificationUrl: 'https://example.com/verify'
};

try {
  const engine = new TemplateEngine();
  const rendered = await engine.render(template, testData);
  console.log('✅ Template renderelés sikeres');
} catch (error) {
  console.error('❌ Template renderelés hiba:', error);

  // Hiányzó változók ellenőrzése
  const requiredVars = template.requiredData;
  const providedVars = Object.keys(testData);
  const missingVars = requiredVars.filter(v => !providedVars.includes(v));

  if (missingVars.length > 0) {
    console.error('Hiányzó változók:', missingVars);
  }
}
```

**Megoldások:**

1. **Template validáció:**

```typescript
import { TemplateSecurityValidator } from '$lib/server/database/repositories';

const validator = new TemplateSecurityValidator();
const validation = await validator.validateTemplate(template);

if (!validation.valid) {
  console.error('Template validáció hibák:', validation.errors);

  // Automatikus javítás (ha lehetséges)
  const fixed = await validator.fixTemplate(template);
  await repository.updateTemplate(template.id, fixed);
}
```

2. **Változó ellenőrzés:**

```typescript
function validateTemplateData(template: DatabaseEmailTemplate, data: any) {
  const missing = template.requiredData.filter(key => !(key in data));

  if (missing.length > 0) {
    throw new Error(`Hiányzó kötelező változók: ${missing.join(', ')}`);
  }

  return true;
}
```

### 5. Teljesítmény Problémák

**Tünetek:**

- Lassú template lekérdezések
- Magas CPU használat
- Memory leak-ek

**Diagnosztika:**

```typescript
// Teljesítmény mérés
const monitor = new PerformanceMonitor();

// Lekérdezési idők
const startTime = Date.now();
const template = await repository.getTemplateByType('email-verification');
const queryTime = Date.now() - startTime;

console.log(`Lekérdezési idő: ${queryTime}ms`);

if (queryTime > 100) {
  console.log('⚠️  Lassú lekérdezés');
}

// Memory használat
const memUsage = process.memoryUsage();
console.log('Memory használat:', {
  rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
  heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB'
});
```

**Megoldások:**

1. **Indexek optimalizálása:**

```sql
-- Composite index létrehozása
CREATE INDEX CONCURRENTLY idx_email_templates_type_active
ON email_templates (type, is_active)
WHERE is_active = true;

-- Partial index aktív template-ekre
CREATE INDEX CONCURRENTLY idx_email_templates_active
ON email_templates (type)
WHERE is_active = true;
```

2. **Batch lekérdezések:**

```typescript
// Több template egyszerre
const templates = await repository.getTemplatesByTypes([
  'email-verification',
  'password-reset',
  'welcome-email'
]);
```

3. **Connection pooling:**

```typescript
// Optimalizált pool beállítások
const pool = new Pool({
  max: 20,
  min: 5,
  acquireTimeoutMillis: 30000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200
});
```

### 6. Migráció Problémák

**Tünetek:**

- Duplikált template-ek
- Hiányzó template-ek
- Migráció megszakadás

**Diagnosztika:**

```typescript
// Migráció állapot ellenőrzése
const migrationService = new TemplateMigrationService(db);

// Duplikátumok keresése
const duplicates = await db.select()
  .from(emailTemplates)
  .groupBy(emailTemplates.type)
  .having(sql`COUNT(*) > 1`);

if (duplicates.length > 0) {
  console.log('⚠️  Duplikált template-ek találhatók:', duplicates);
}

// Hiányzó built-in template-ek
const builtInTypes = Object.keys(builtInTemplates);
const existingTypes = (await repository.getAllActiveTemplates()).map(t => t.type);
const missing = builtInTypes.filter(type => !existingTypes.includes(type));

if (missing.length > 0) {
  console.log('⚠️  Hiányzó template-ek:', missing);
}
```

**Megoldások:**

1. **Duplikátumok eltávolítása:**

```typescript
async function removeDuplicates() {
  const duplicates = await db.select()
    .from(emailTemplates)
    .where(sql`id NOT IN (
      SELECT MIN(id)
      FROM email_templates
      GROUP BY type
    )`);

  for (const duplicate of duplicates) {
    await db.delete(emailTemplates).where(eq(emailTemplates.id, duplicate.id));
    console.log(`Duplikátum törölve: ${duplicate.type} (${duplicate.id})`);
  }
}
```

2. **Hiányzó template-ek pótlása:**

```typescript
async function addMissingTemplates() {
  const missing = await findMissingTemplates();

  for (const type of missing) {
    const builtIn = builtInTemplates[type];
    if (builtIn) {
      await repository.createTemplate({
        type,
        name: builtIn.name,
        subjectTemplate: builtIn.subject,
        htmlTemplate: builtIn.html,
        textTemplate: builtIn.text || '',
        requiredData: builtIn.requiredData || [],
        optionalData: builtIn.optionalData || []
      });

      console.log(`Template hozzáadva: ${type}`);
    }
  }
}
```

## Monitoring és Riasztások

### 1. Alapvető Monitoring

```typescript
// scripts/monitoring.ts
import { PerformanceMonitor } from '$lib/server/database/repositories';

async function setupMonitoring() {
  const monitor = new PerformanceMonitor();

  setInterval(async () => {
    const metrics = await monitor.getMetrics();

    // Teljesítmény riasztások
    if (metrics.averageQueryTime > 500) {
      console.warn('⚠️  Lassú lekérdezések:', metrics.averageQueryTime + 'ms');
    }

    if (metrics.cacheHitRate < 80) {
      console.warn('⚠️  Alacsony cache hit rate:', metrics.cacheHitRate + '%');
    }

    if (metrics.errorRate > 5) {
      console.error('❌ Magas hibaarány:', metrics.errorRate + '%');
    }

  }, 60000); // Percenként
}

setupMonitoring();
```

### 2. Health Check Endpoint

```typescript
// src/routes/api/health/email-templates/+server.ts
import { json } from '@sveltejs/kit';
import { db } from '$lib/server/database';
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';

export async function GET() {
  try {
    const repository = new DatabaseTemplateRepository(db);

    // Alapvető ellenőrzések
    const templates = await repository.getAllActiveTemplates();
    const isHealthy = templates.length > 0;

    return json({
      status: isHealthy ? 'healthy' : 'unhealthy',
      templateCount: templates.length,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
```

## Hibaelhárítási Checklist

### Amikor template nem található:

- [ ] Ellenőrizze, hogy a template létezik az adatbázisban
- [ ] Ellenőrizze, hogy a template aktív-e
- [ ] Futtassa a migrációt, ha szükséges
- [ ] Ellenőrizze a template típus helyesírását

### Amikor lassú a rendszer:

- [ ] Ellenőrizze az adatbázis indexeket
- [ ] Ellenőrizze a cache hit rate-et
- [ ] Ellenőrizze a connection pool beállításokat
- [ ] Futtasson teljesítmény profilozást

### Amikor cache problémák vannak:

- [ ] Törölje a cache-t
- [ ] Ellenőrizze a cache TTL beállításokat
- [ ] Futtasson cache warm-up-ot
- [ ] Ellenőrizze a memory használatot

### Amikor migráció sikertelen:

- [ ] Ellenőrizze az adatbázis kapcsolatot
- [ ] Ellenőrizze a jogosultságokat
- [ ] Keresse meg a duplikátumokat
- [ ] Futtassa a validációt

## Támogatás és Eszkalálás

Ha a fenti megoldások nem segítenek:

1. **Logok gyűjtése:**
   - Alkalmazás logok
   - Adatbázis logok
   - Rendszer metrikák

2. **Reprodukálható teszt eset:**
   - Minimális kód példa
   - Teszt adatok
   - Környezeti változók

3. **Rendszer információk:**
   - Node.js verzió
   - PostgreSQL verzió
   - Alkalmazás verzió
   - Környezet (dev/staging/prod)

4. **Eszkalálási útvonal:**
   - Fejlesztői csapat
   - DevOps csapat
   - Adatbázis adminisztrátor
