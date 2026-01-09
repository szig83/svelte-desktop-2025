# Email Template Migráció Útmutató

## Áttekintés

Ez az útmutató végigvezeti a built-in email template-ek adatbázis-alapú rendszerre való átállásán. A migráció célja, hogy a jelenleg kódban tárolt template-ek az adatbázisba kerüljenek, lehetővé téve a dinamikus kezelést.

## Előfeltételek

### Rendszerkövetelmények

- PostgreSQL 12+ adatbázis
- Node.js 20+
- Bun csomagkezelő
- Drizzle ORM beállítva

### Szükséges Jogosultságok

- Adatbázis írási/olvasási jogok
- Email template táblák módosítási joga
- Rendszer konfigurációs fájlok szerkesztési joga

## Migráció Előkészítése

### 1. Backup Készítése

Mindig készítsen biztonsági mentést a migráció előtt:

```bash
# Adatbázis backup
pg_dump -h localhost -U username -d database_name > backup_$(date +%Y%m%d_%H%M%S).sql

# Konfigurációs fájlok backup
cp -r src/lib/server/email/templates src/lib/server/email/templates_backup_$(date +%Y%m%d_%H%M%S)
```

### 2. Jelenlegi Template-ek Inventarizálása

Ellenőrizze a jelenleg használt template-eket:

```typescript
// scripts/inventory-templates.ts
import { builtInTemplates } from '$lib/server/email/templates/built-in';

console.log('Jelenlegi built-in template-ek:');
Object.entries(builtInTemplates).forEach(([type, template]) => {
  console.log(`- ${type}: ${template.name}`);
});
```

Futtatás:

```bash
bun run scripts/inventory-templates.ts
```

### 3. Adatbázis Séma Ellenőrzése

Győződjön meg róla, hogy az email_templates tábla létezik:

```sql
-- Tábla létezésének ellenőrzése
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'email_templates'
);

-- Tábla struktúra ellenőrzése
\d email_templates
```

Ha a tábla nem létezik, futtassa a migrációkat:

```bash
bun db:generate
bun db:migrate
```

## Migráció Végrehajtása

### 1. Automatikus Migráció

A legegyszerűbb módszer az automatikus migráció használata:

```typescript
// scripts/migrate-templates.ts
import { db } from '$lib/server/database';
import { TemplateMigrationService } from '$lib/server/database/repositories';

async function runMigration() {
  const migrationService = new TemplateMigrationService(db);

  try {
    console.log('Migráció indítása...');

    // Built-in template-ek migrálása
    const result = await migrationService.migrateBuiltInTemplates();

    console.log('Migráció eredménye:');
    console.log(`- Migrált template-ek: ${result.migratedCount}`);
    console.log(`- Kihagyott template-ek: ${result.skippedCount}`);
    console.log(`- Hibák: ${result.errors.length}`);

    if (result.errors.length > 0) {
      console.error('Hibák a migráció során:');
      result.errors.forEach(error => console.error(`- ${error}`));
    }

    // Validáció
    const validation = await migrationService.validateMigration();
    if (validation.isValid) {
      console.log('✅ Migráció sikeresen validálva');
    } else {
      console.error('❌ Migráció validáció sikertelen:');
      validation.errors.forEach(error => console.error(`- ${error}`));
    }

  } catch (error) {
    console.error('Migráció hiba:', error);
    process.exit(1);
  }
}

runMigration();
```

Futtatás:

```bash
bun run scripts/migrate-templates.ts
```

### 2. Manuális Migráció

Ha finomabb kontrollra van szükség:

```typescript
// scripts/manual-migration.ts
import { db } from '$lib/server/database';
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';
import { builtInTemplates } from '$lib/server/email/templates/built-in';

async function manualMigration() {
  const repository = new DatabaseTemplateRepository(db);

  for (const [type, template] of Object.entries(builtInTemplates)) {
    try {
      // Ellenőrzés, hogy létezik-e már
      const existing = await repository.getTemplateByType(type as any);

      if (existing) {
        console.log(`Template már létezik: ${type}, kihagyás`);
        continue;
      }

      // Új template létrehozása
      const created = await repository.createTemplate({
        type: type as any,
        name: template.name,
        subjectTemplate: template.subject,
        htmlTemplate: template.html,
        textTemplate: template.text || '',
        requiredData: template.requiredData || [],
        optionalData: template.optionalData || []
      });

      console.log(`✅ Template migrálva: ${type} (ID: ${created.id})`);

    } catch (error) {
      console.error(`❌ Hiba a template migrálásakor (${type}):`, error);
    }
  }
}

manualMigration();
```

### 3. Batch Migráció

Nagy mennyiségű template esetén:

```typescript
// scripts/batch-migration.ts
import { db } from '$lib/server/database';
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';

async function batchMigration(templates: any[], batchSize = 10) {
  const repository = new DatabaseTemplateRepository(db);

  for (let i = 0; i < templates.length; i += batchSize) {
    const batch = templates.slice(i, i + batchSize);

    console.log(`Batch feldolgozása: ${i + 1}-${Math.min(i + batchSize, templates.length)}`);

    const promises = batch.map(async (template) => {
      try {
        return await repository.createTemplate(template);
      } catch (error) {
        console.error(`Hiba: ${template.type}`, error);
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    const successful = results.filter(r => r.status === 'fulfilled').length;

    console.log(`Batch kész: ${successful}/${batch.length} sikeres`);

    // Kis szünet a batch-ek között
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

## Migráció Validálása

### 1. Automatikus Validáció

```typescript
// scripts/validate-migration.ts
import { db } from '$lib/server/database';
import { TemplateMigrationService } from '$lib/server/database/repositories';

async function validateMigration() {
  const migrationService = new TemplateMigrationService(db);

  const validation = await migrationService.validateMigration();

  if (validation.isValid) {
    console.log('✅ Migráció validáció sikeres');
    console.log(`Validált template-ek: ${validation.validatedCount}`);
  } else {
    console.error('❌ Migráció validáció sikertelen');
    validation.errors.forEach(error => console.error(`- ${error}`));
  }

  return validation.isValid;
}

validateMigration();
```

### 2. Manuális Ellenőrzés

```sql
-- Template-ek számának ellenőrzése
SELECT COUNT(*) as template_count FROM email_templates WHERE is_active = true;

-- Template típusok listázása
SELECT type, name, created_at FROM email_templates ORDER BY type;

-- Template tartalom ellenőrzése
SELECT
  type,
  LENGTH(subject_template) as subject_length,
  LENGTH(html_template) as html_length,
  LENGTH(text_template) as text_length
FROM email_templates;
```

### 3. Funkcionális Teszt

```typescript
// scripts/test-migrated-templates.ts
import { db } from '$lib/server/database';
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';
import { TemplateEngine } from '$lib/server/email/templates';

async function testMigratedTemplates() {
  const repository = new DatabaseTemplateRepository(db);
  const engine = new TemplateEngine();

  const templates = await repository.getAllActiveTemplates();

  for (const template of templates) {
    try {
      // Teszt adatok
      const testData = {
        name: 'Test User',
        email: 'test@example.com',
        verificationUrl: 'https://example.com/verify',
        // További teszt adatok...
      };

      // Template renderelése
      const rendered = await engine.render(template, testData);

      console.log(`✅ Template renderelés sikeres: ${template.type}`);
      console.log(`   Subject: ${rendered.subject.substring(0, 50)}...`);

    } catch (error) {
      console.error(`❌ Template renderelés hiba (${template.type}):`, error);
    }
  }
}

testMigratedTemplates();
```

## Rendszer Átállítása

### 1. Konfigurációs Változások

Frissítse az email inicializálást:

```typescript
// src/lib/server/email/init.ts
import { DatabaseTemplateRepository } from '$lib/server/database/repositories';

export async function initializeEmailSystem() {
  // ... egyéb inicializálás

  // Template repository inicializálása
  const templateRepository = new DatabaseTemplateRepository(db);

  // Automatikus migráció futtatása (opcionális)
  if (process.env.AUTO_MIGRATE_TEMPLATES === 'true') {
    const migrationService = new TemplateMigrationService(db);
    await migrationService.migrateBuiltInTemplates();
  }

  // Template registry frissítése
  const templateRegistry = new TemplateRegistry(templateRepository);

  return { templateRegistry, templateRepository };
}
```

### 2. Environment Változók

Adja hozzá a szükséges környezeti változókat:

```bash
# .env
AUTO_MIGRATE_TEMPLATES=true
TEMPLATE_CACHE_TTL=3600
TEMPLATE_CACHE_ENABLED=true
```

### 3. Alkalmazás Újraindítása

```bash
# Fejlesztési környezet
bun dev

# Produkciós környezet
bun build
bun preview
```

## Rollback Eljárás

### 1. Automatikus Rollback

```typescript
// scripts/rollback-migration.ts
import { db } from '$lib/server/database';
import { TemplateMigrationService } from '$lib/server/database/repositories';

async function rollbackMigration() {
  const migrationService = new TemplateMigrationService(db);

  try {
    console.log('Rollback indítása...');

    await migrationService.rollbackMigration();

    console.log('✅ Rollback sikeres');

  } catch (error) {
    console.error('❌ Rollback hiba:', error);
  }
}

rollbackMigration();
```

### 2. Manuális Rollback

```sql
-- Template-ek deaktiválása
UPDATE email_templates SET is_active = false WHERE created_at > '2024-01-01';

-- Template-ek törlése (óvatosan!)
DELETE FROM email_templates WHERE type LIKE 'migrated_%';
```

### 3. Konfigurációs Rollback

```typescript
// Visszaállítás built-in template-ekre
import { builtInTemplates } from '$lib/server/email/templates/built-in';

// Template registry visszaállítása
const templateRegistry = new TemplateRegistry();
templateRegistry.loadBuiltInTemplates(builtInTemplates);
```

## Gyakori Problémák és Megoldások

### 1. Duplikált Template-ek

**Probléma:** Template már létezik az adatbázisban

**Megoldás:**

```typescript
// Ellenőrzés létrehozás előtt
const existing = await repository.getTemplateByType(type);
if (existing) {
  console.log(`Template már létezik: ${type}`);
  return existing;
}
```

### 2. Adatbázis Kapcsolat Hiba

**Probléma:** Nem lehet csatlakozni az adatbázishoz

**Megoldás:**

```typescript
// Kapcsolat ellenőrzése
try {
  await db.select().from(emailTemplates).limit(1);
  console.log('Adatbázis kapcsolat OK');
} catch (error) {
  console.error('Adatbázis kapcsolat hiba:', error);
  process.exit(1);
}
```

### 3. Template Validáció Hiba

**Probléma:** Template tartalom nem valid

**Megoldás:**

```typescript
// Template validáció
import { TemplateSecurityValidator } from '$lib/server/database/repositories';

const validator = new TemplateSecurityValidator();
const validation = await validator.validateTemplate(templateData);

if (!validation.valid) {
  console.error('Template validáció hiba:', validation.errors);
  // Javítás vagy kihagyás
}
```

### 4. Teljesítmény Problémák

**Probléma:** Lassú template lekérdezések

**Megoldás:**

```typescript
// Cache engedélyezése
const repository = new DatabaseTemplateRepository(db, {
  cacheEnabled: true,
  cacheTTL: 3600
});

// Batch lekérdezések használata
const templates = await repository.getTemplatesByTypes([
  'email-verification',
  'password-reset'
]);
```

## Migráció Checklist

### Előkészítés

- [ ] Backup készítése
- [ ] Template inventarizálás
- [ ] Adatbázis séma ellenőrzése
- [ ] Tesztkörnyezet beállítása

### Migráció

- [ ] Automatikus migráció futtatása
- [ ] Hibák ellenőrzése és javítása
- [ ] Validáció futtatása
- [ ] Funkcionális tesztek

### Átállás

- [ ] Konfigurációs változások
- [ ] Environment változók beállítása
- [ ] Alkalmazás újraindítása
- [ ] Monitoring beállítása

### Validáció

- [ ] Template-ek elérhetősége
- [ ] Email küldés tesztelése
- [ ] Teljesítmény ellenőrzése
- [ ] Hibalogok áttekintése

### Cleanup

- [ ] Régi backup fájlok törlése
- [ ] Ideiglenes szkriptek eltávolítása
- [ ] Dokumentáció frissítése

## Támogatás

Ha problémába ütközik a migráció során:

1. Ellenőrizze a hibalogokat
2. Futtassa a validációs szkripteket
3. Konzultáljon a troubleshooting útmutatóval
4. Szükség esetén végezzen rollback-et

A migráció sikeres befejezése után az email template rendszer teljes mértékben adatbázis-alapú lesz, lehetővé téve a dinamikus template kezelést és szerkesztést.
