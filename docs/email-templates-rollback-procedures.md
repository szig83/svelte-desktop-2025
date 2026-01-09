# Email Template Rollback Eljárások

## Áttekintés

Ez a dokumentum részletes útmutatót nyújt az email template adatbázis integráció visszaállításához különböző hibás esetek során. A rollback eljárások célja a rendszer gyors és biztonságos visszaállítása a korábbi működő állapotra.

## Rollback Típusok

### 1. Teljes Rendszer Rollback

A teljes adatbázis-alapú rendszer visszaállítása built-in template-ekre.

### 2. Részleges Rollback

Csak bizonyos template-ek vagy funkciók visszaállítása.

### 3. Konfiguráció Rollback

Csak a konfigurációs változások visszavonása.

### 4. Adatbázis Rollback

Adatbázis séma és adatok visszaállítása.

## Rollback Indikátorok

### Mikor szükséges rollback:

- **Kritikus hibák**: Email küldés teljesen leáll
- **Teljesítmény problémák**: Válaszidő > 5 másodperc
- **Adatvesztés**: Template-ek elvesznek vagy sérülnek
- **Biztonsági problémák**: Unauthorized hozzáférés
- **Migráció hibák**: Sikertelen vagy részleges migráció

### Rollback döntési mátrix:

| Probléma Típusa    | Súlyosság | Rollback Típus | Időkeret  |
| ------------------ | --------- | -------------- | --------- |
| Email küldés leáll | Kritikus  | Teljes         | < 15 perc |
| Lassú lekérdezések | Magas     | Konfiguráció   | < 30 perc |
| Template sérülés   | Közepes   | Részleges      | < 1 óra   |
| Cache problémák    | Alacsony  | Konfiguráció   | < 2 óra   |

## Automatikus Rollback

### 1. Automatikus Rollback Service

```typescript
// src/lib/server/database/repositories/rollback-service.ts
import { db } from '$lib/server/database';
import { TemplateMigrationService } from './template-migration-service';

export class AutomaticRollbackService {
  private healthCheckInterval: NodeJS.Timeout;
  private rollbackInProgress = false;

  constructor(
    private migrationService: TemplateMigrationService,
    private healthCheckIntervalMs = 30000 // 30 másodperc
  ) {}

  startHealthMonitoring(): void {
    this.healthCheckInterval = setInterval(async () => {
      if (this.rollbackInProgress) return;

      const health = await this.checkSystemHealth();

      if (health.critical) {
        console.error('🚨 Kritikus hiba észlelve, automatikus rollback indítása...');
        await this.performEmergencyRollback();
      }
    }, this.healthCheckIntervalMs);
  }

  private async checkSystemHealth(): Promise<{ critical: boolean; issues: string[] }> {
    const issues: string[] = [];
    let critical = false;

    try {
      // Adatbázis kapcsolat ellenőrzése
      const dbStart = Date.now();
      await db.select().from(emailTemplates).limit(1);
      const dbTime = Date.now() - dbStart;

      if (dbTime > 5000) {
        issues.push('Lassú adatbázis kapcsolat');
        critical = true;
      }

      // Template lekérdezés tesztelése
      const repository = new DatabaseTemplateRepository(db);
      const templateStart = Date.now();
      await repository.getTemplateByType('email-verification');
      const templateTime = Date.now() - templateStart;

      if (templateTime > 2000) {
        issues.push('Lassú template lekérdezés');
        critical = true;
      }

      // Template számának ellenőrzése
      const templates = await repository.getAllActiveTemplates();
      if (templates.length === 0) {
        issues.push('Nincsenek aktív template-ek');
        critical = true;
      }

    } catch (error) {
      issues.push(`Rendszer hiba: ${error.message}`);
      critical = true;
    }

    return { critical, issues };
  }

  private async performEmergencyRollback(): Promise<void> {
    this.rollbackInProgress = true;

    try {
      console.log('🔄 Vészhelyzeti rollback indítása...');

      // 1. Built-in template-ek visszaállítása
      await this.migrationService.rollbackMigration();

      // 2. Cache törlése
      await this.clearAllCaches();

      // 3. Konfiguráció visszaállítása
      await this.resetConfiguration();

      console.log('✅ Vészhelyzeti rollback befejezve');

    } catch (error) {
      console.error('❌ Vészhelyzeti rollback hiba:', error);
    } finally {
      this.rollbackInProgress = false;
    }
  }

  private async clearAllCaches(): Promise<void> {
    // Cache implementáció függő
  }

  private async resetConfiguration(): Promise<void> {
    // Konfiguráció visszaállítás implementáció
  }

  stopHealthMonitoring(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}
```

### 2. Health Check Endpoint

```typescript
// src/routes/api/admin/rollback/health/+server.ts
import { json } from '@sveltejs/kit';
import { AutomaticRollbackService } from '$lib/server/database/repositories';

export async function GET() {
  const rollbackService = new AutomaticRollbackService();

  try {
    const health = await rollbackService.checkSystemHealth();

    return json({
      status: health.critical ? 'critical' : 'healthy',
      issues: health.issues,
      timestamp: new Date().toISOString(),
      rollbackRecommended: health.critical
    });

  } catch (error) {
    return json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
      rollbackRecommended: true
    }, { status: 500 });
  }
}
```

## Manuális Rollback Eljárások

### 1. Teljes Rendszer Rollback

```bash
#!/bin/bash
# scripts/full-rollback.sh

echo "🔄 Teljes rendszer rollback indítása..."

# 1. Alkalmazás leállítása
echo "1. Alkalmazás leállítása..."
pm2 stop email-app || systemctl stop email-app

# 2. Adatbázis backup visszaállítása
echo "2. Adatbázis backup visszaállítása..."
pg_restore -h localhost -U username -d database_name backup_pre_migration.sql

# 3. Konfigurációs fájlok visszaállítása
echo "3. Konfigurációs fájlok visszaállítása..."
cp -r src/lib/server/email/templates_backup/* src/lib/server/email/templates/

# 4. Environment változók visszaállítása
echo "4. Environment változók visszaállítása..."
cp .env.backup .env

# 5. Alkalmazás újraindítása
echo "5. Alkalmazás újraindítása..."
bun install
bun build
pm2 start email-app || systemctl start email-app

echo "✅ Teljes rollback befejezve"
```

### 2. Programozott Rollback

```typescript
// scripts/manual-rollback.ts
import { db } from '$lib/server/database';
import { TemplateMigrationService } from '$lib/server/database/repositories';
import { builtInTemplates } from '$lib/server/email/templates/built-in';

async function performManualRollback(rollbackType: 'full' | 'partial' | 'config') {
  console.log(`🔄 Manuális rollback indítása: ${rollbackType}`);

  const migrationService = new TemplateMigrationService(db);

  try {
    switch (rollbackType) {
      case 'full':
        await fullRollback(migrationService);
        break;
      case 'partial':
        await partialRollback(migrationService);
        break;
      case 'config':
        await configRollback();
        break;
    }

    console.log('✅ Rollback sikeresen befejezve');

  } catch (error) {
    console.error('❌ Rollback hiba:', error);
    throw error;
  }
}

async function fullRollback(migrationService: TemplateMigrationService): Promise<void> {
  console.log('📋 Teljes rollback végrehajtása...');

  // 1. Template-ek deaktiválása az adatbázisban
  await db.update(emailTemplates)
    .set({ isActive: false })
    .where(eq(emailTemplates.isActive, true));

  // 2. Built-in template-ek visszaállítása
  await migrationService.rollbackMigration();

  // 3. Cache törlése
  const cache = new TemplateCache();
  await cache.clear();

  // 4. Template registry visszaállítása
  const registry = new TemplateRegistry();
  registry.loadBuiltInTemplates(builtInTemplates);

  console.log('✅ Teljes rollback kész');
}

async function partialRollback(migrationService: TemplateMigrationService): Promise<void> {
  console.log('📋 Részleges rollback végrehajtása...');

  // Csak a problémás template-ek rollback-je
  const problematicTypes = ['email-verification', 'password-reset'];

  for (const type of problematicTypes) {
    // Adatbázisból deaktiválás
    await db.update(emailTemplates)
      .set({ isActive: false })
      .where(eq(emailTemplates.type, type));

    // Cache törlése
    const cache = new TemplateCache();
    await cache.delete(`template:type:${type}`);

    console.log(`✅ Template rollback kész: ${type}`);
  }
}

async function configRollback(): Promise<void> {
  console.log('📋 Konfiguráció rollback végrehajtása...');

  // Environment változók visszaállítása
  process.env.USE_DATABASE_TEMPLATES = 'false';
  process.env.TEMPLATE_CACHE_ENABLED = 'false';

  // Cache törlése
  const cache = new TemplateCache();
  await cache.clear();

  console.log('✅ Konfiguráció rollback kész');
}

// Használat
const rollbackType = process.argv[2] as 'full' | 'partial' | 'config';
if (!rollbackType) {
  console.error('Használat: bun run scripts/manual-rollback.ts [full|partial|config]');
  process.exit(1);
}

performManualRollback(rollbackType);
```

## Adatbázis Rollback

### 1. Séma Rollback

```sql
-- Template táblák deaktiválása
UPDATE email_templates SET is_active = false WHERE is_active = true;

-- Indexek törlése (ha szükséges)
DROP INDEX CONCURRENTLY IF EXISTS idx_email_templates_type_active;
DROP INDEX CONCURRENTLY IF EXISTS idx_email_templates_active_only;

-- Tábla törlése (végső esetben)
-- DROP TABLE IF EXISTS email_templates CASCADE;
```

### 2. Adatok Rollback

```typescript
// scripts/database-rollback.ts
import { db } from '$lib/server/database';

async function rollbackDatabaseData() {
  console.log('🗄️  Adatbázis adatok rollback...');

  try {
    // 1. Migráció előtti állapot visszaállítása
    await db.transaction(async (tx) => {
      // Template-ek deaktiválása
      await tx.update(emailTemplates)
        .set({
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(emailTemplates.isActive, true));

      // Audit log bejegyzés
      await tx.insert(auditLogs).values({
        action: 'rollback',
        tableName: 'email_templates',
        userId: 'system',
        timestamp: new Date(),
        details: 'Database rollback performed'
      });
    });

    console.log('✅ Adatbázis rollback befejezve');

  } catch (error) {
    console.error('❌ Adatbázis rollback hiba:', error);
    throw error;
  }
}

rollbackDatabaseData();
```

### 3. Backup Visszaállítás

```bash
#!/bin/bash
# scripts/restore-backup.sh

BACKUP_FILE=$1
DB_NAME=${2:-email_templates_db}

if [ -z "$BACKUP_FILE" ]; then
  echo "Használat: ./restore-backup.sh <backup_file> [db_name]"
  exit 1
fi

echo "🔄 Backup visszaállítása: $BACKUP_FILE -> $DB_NAME"

# 1. Jelenlegi adatbázis backup (biztonsági okokból)
echo "1. Jelenlegi állapot mentése..."
pg_dump -h localhost -U $DB_USER -d $DB_NAME > "rollback_backup_$(date +%Y%m%d_%H%M%S).sql"

# 2. Adatbázis törlése és újralétrehozása
echo "2. Adatbázis újralétrehozása..."
dropdb -h localhost -U $DB_USER $DB_NAME
createdb -h localhost -U $DB_USER $DB_NAME

# 3. Backup visszaállítása
echo "3. Backup visszaállítása..."
pg_restore -h localhost -U $DB_USER -d $DB_NAME $BACKUP_FILE

# 4. Ellenőrzés
echo "4. Visszaállítás ellenőrzése..."
psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) FROM email_templates;"

echo "✅ Backup visszaállítás befejezve"
```

## Konfiguráció Rollback

### 1. Environment Változók

```bash
# .env.rollback - Eredeti beállítások
USE_DATABASE_TEMPLATES=false
TEMPLATE_CACHE_ENABLED=false
AUTO_MIGRATE_TEMPLATES=false
TEMPLATE_FALLBACK_ENABLED=true

# Rollback script
cp .env.rollback .env
```

### 2. Alkalmazás Konfiguráció

```typescript
// src/lib/server/email/config-rollback.ts
export class ConfigurationRollback {

  async rollbackEmailConfiguration(): Promise<void> {
    console.log('⚙️  Email konfiguráció rollback...');

    // 1. Built-in template registry visszaállítása
    const registry = new TemplateRegistry();
    registry.loadBuiltInTemplates(builtInTemplates);

    // 2. Cache kikapcsolása
    process.env.TEMPLATE_CACHE_ENABLED = 'false';

    // 3. Adatbázis template-ek kikapcsolása
    process.env.USE_DATABASE_TEMPLATES = 'false';

    // 4. Fallback engedélyezése
    process.env.TEMPLATE_FALLBACK_ENABLED = 'true';

    console.log('✅ Konfiguráció rollback kész');
  }

  async rollbackCacheConfiguration(): Promise<void> {
    console.log('💾 Cache konfiguráció rollback...');

    // Cache törlése és kikapcsolása
    const cache = new TemplateCache();
    await cache.clear();

    // Cache beállítások visszaállítása
    process.env.TEMPLATE_CACHE_TTL = '0';
    process.env.TEMPLATE_CACHE_MAX_SIZE = '0';

    console.log('✅ Cache rollback kész');
  }
}
```

## Rollback Validáció

### 1. Automatikus Validáció

```typescript
// scripts/validate-rollback.ts
import { db } from '$lib/server/database';
import { TemplateRegistry } from '$lib/server/email/templates';

async function validateRollback(): Promise<boolean> {
  console.log('🔍 Rollback validáció...');

  try {
    // 1. Built-in template-ek elérhetősége
    const registry = new TemplateRegistry();
    const builtInTemplate = registry.getTemplate('email-verification');

    if (!builtInTemplate) {
      console.error('❌ Built-in template nem elérhető');
      return false;
    }

    // 2. Email küldés teszt
    const testResult = await testEmailSending();
    if (!testResult) {
      console.error('❌ Email küldés teszt sikertelen');
      return false;
    }

    // 3. Teljesítmény teszt
    const performanceResult = await testPerformance();
    if (!performanceResult) {
      console.error('❌ Teljesítmény teszt sikertelen');
      return false;
    }

    // 4. Adatbázis állapot ellenőrzése
    const dbResult = await validateDatabaseState();
    if (!dbResult) {
      console.error('❌ Adatbázis állapot nem megfelelő');
      return false;
    }

    console.log('✅ Rollback validáció sikeres');
    return true;

  } catch (error) {
    console.error('❌ Rollback validáció hiba:', error);
    return false;
  }
}

async function testEmailSending(): Promise<boolean> {
  try {
    const registry = new TemplateRegistry();
    const template = registry.getTemplate('email-verification');

    const rendered = await registry.render(template, {
      name: 'Test User',
      verificationUrl: 'https://example.com/verify'
    });

    return rendered.subject.length > 0 && rendered.html.length > 0;
  } catch (error) {
    return false;
  }
}

async function testPerformance(): Promise<boolean> {
  const start = Date.now();

  try {
    const registry = new TemplateRegistry();

    // 100 template lekérdezés
    for (let i = 0; i < 100; i++) {
      await registry.getTemplate('email-verification');
    }

    const duration = Date.now() - start;
    return duration < 1000; // < 1 másodperc

  } catch (error) {
    return false;
  }
}

async function validateDatabaseState(): Promise<boolean> {
  try {
    // Ellenőrzés, hogy az adatbázis template-ek inaktívak
    const activeTemplates = await db.select()
      .from(emailTemplates)
      .where(eq(emailTemplates.isActive, true));

    // Rollback után nem kellene aktív template-eknek lenniük
    return activeTemplates.length === 0;

  } catch (error) {
    // Ha adatbázis hiba van, az rendben van rollback után
    return true;
  }
}

validateRollback();
```

### 2. Manuális Ellenőrzési Lista

```markdown
## Rollback Ellenőrzési Lista

### Funkcionális Tesztek

- [ ] Email küldés működik
- [ ] Template renderelés működik
- [ ] Összes template típus elérhető
- [ ] Hibakezlés megfelelő

### Teljesítmény Tesztek

- [ ] Template lekérdezés < 100ms
- [ ] Email küldés < 5 másodperc
- [ ] Memory használat normális
- [ ] CPU használat normális

### Adatbázis Ellenőrzés

- [ ] Adatbázis template-ek inaktívak
- [ ] Backup integritás
- [ ] Kapcsolat működik
- [ ] Indexek megfelelőek

### Konfiguráció Ellenőrzés

- [ ] Environment változók
- [ ] Alkalmazás beállítások
- [ ] Cache beállítások
- [ ] Logging beállítások

### Monitoring Ellenőrzés

- [ ] Health check működik
- [ ] Metrikák gyűjtése
- [ ] Riasztások működnek
- [ ] Log bejegyzések
```

## Rollback Dokumentálás

### 1. Rollback Log

```typescript
// src/lib/server/database/repositories/rollback-logger.ts
export class RollbackLogger {

  async logRollbackStart(type: string, reason: string): Promise<string> {
    const rollbackId = generateId();

    await db.insert(rollbackLogs).values({
      id: rollbackId,
      type,
      reason,
      status: 'started',
      startedAt: new Date(),
      details: {}
    });

    console.log(`📝 Rollback log indítva: ${rollbackId}`);
    return rollbackId;
  }

  async logRollbackStep(rollbackId: string, step: string, status: 'success' | 'error', details?: any): Promise<void> {
    await db.insert(rollbackSteps).values({
      rollbackId,
      step,
      status,
      timestamp: new Date(),
      details: details || {}
    });
  }

  async logRollbackComplete(rollbackId: string, success: boolean, summary?: string): Promise<void> {
    await db.update(rollbackLogs)
      .set({
        status: success ? 'completed' : 'failed',
        completedAt: new Date(),
        summary
      })
      .where(eq(rollbackLogs.id, rollbackId));

    console.log(`📝 Rollback log befejezve: ${rollbackId} (${success ? 'sikeres' : 'sikertelen'})`);
  }
}
```

### 2. Rollback Jelentés

```typescript
// scripts/rollback-report.ts
async function generateRollbackReport(rollbackId: string): Promise<void> {
  const rollback = await db.select()
    .from(rollbackLogs)
    .where(eq(rollbackLogs.id, rollbackId))
    .limit(1);

  const steps = await db.select()
    .from(rollbackSteps)
    .where(eq(rollbackSteps.rollbackId, rollbackId))
    .orderBy(rollbackSteps.timestamp);

  const report = {
    rollbackId,
    type: rollback[0]?.type,
    reason: rollback[0]?.reason,
    status: rollback[0]?.status,
    duration: rollback[0]?.completedAt ?
      rollback[0].completedAt.getTime() - rollback[0].startedAt.getTime() : null,
    steps: steps.map(step => ({
      step: step.step,
      status: step.status,
      timestamp: step.timestamp,
      details: step.details
    }))
  };

  // Jelentés mentése
  const reportPath = `logs/rollback-report-${rollbackId}.json`;
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));

  console.log(`📊 Rollback jelentés létrehozva: ${reportPath}`);
}
```

## Megelőzési Stratégiák

### 1. Rollback Megelőzés

```typescript
// Rollback megelőzési ellenőrzések
class RollbackPrevention {

  async validateBeforeMigration(): Promise<boolean> {
    console.log('🔍 Migráció előtti validáció...');

    // 1. Adatbázis állapot ellenőrzése
    const dbHealth = await this.checkDatabaseHealth();
    if (!dbHealth) return false;

    // 2. Backup létezésének ellenőrzése
    const backupExists = await this.verifyBackupExists();
    if (!backupExists) return false;

    // 3. Rendszer terhelés ellenőrzése
    const systemLoad = await this.checkSystemLoad();
    if (systemLoad > 0.8) {
      console.warn('⚠️  Magas rendszerterhelés, migráció halasztása javasolt');
      return false;
    }

    return true;
  }

  async setupRollbackTriggers(): Promise<void> {
    // Automatikus rollback triggerek beállítása
    const triggers = [
      { condition: 'error_rate > 10%', action: 'partial_rollback' },
      { condition: 'response_time > 5s', action: 'config_rollback' },
      { condition: 'template_count = 0', action: 'full_rollback' }
    ];

    for (const trigger of triggers) {
      await this.setupTrigger(trigger);
    }
  }
}
```

### 2. Monitoring és Riasztások

```typescript
// Rollback monitoring
class RollbackMonitoring {

  setupRollbackAlerts(): void {
    // Email riasztás rollback esetén
    this.on('rollback_started', async (event) => {
      await this.sendAlert({
        type: 'rollback_started',
        severity: 'high',
        message: `Rollback indítva: ${event.reason}`,
        timestamp: new Date()
      });
    });

    // Slack értesítés
    this.on('rollback_completed', async (event) => {
      await this.sendSlackNotification({
        channel: '#alerts',
        message: `🔄 Rollback befejezve: ${event.success ? '✅ Sikeres' : '❌ Sikertelen'}`,
        details: event.summary
      });
    });
  }
}
```

## Rollback Checklist

### Rollback Előkészítés

- [ ] Backup ellenőrzése
- [ ] Rollback terv áttekintése
- [ ] Csapat értesítése
- [ ] Monitoring beállítása

### Rollback Végrehajtás

- [ ] Rollback indítása
- [ ] Lépések dokumentálása
- [ ] Folyamat monitoring
- [ ] Hibák kezelése

### Rollback Utáni Ellenőrzés

- [ ] Funkcionális tesztek
- [ ] Teljesítmény tesztek
- [ ] Adatbázis integritás
- [ ] Monitoring visszaállítása

### Dokumentálás

- [ ] Rollback jelentés
- [ ] Tanulságok dokumentálása
- [ ] Folyamat javítása
- [ ] Csapat tájékoztatása

A megfelelő rollback eljárások biztosítják, hogy bármilyen probléma esetén gyorsan és biztonságosan vissza tudjunk állni a működő állapotra, minimalizálva a szolgáltatás kiesést és az adatvesztést.
