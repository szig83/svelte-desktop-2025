# Email Verification Fejlesztői Környezet Beállítás

## Áttekintés

Ez az útmutató segít a fejlesztői környezet optimális beállításában az email verification funkció fejlesztéséhez és teszteléséhez.

## Gyors Kezdés

### 1. Environment Beállítás

```bash
# .env fájl másolása és szerkesztése
cp .env.example .env

# Szükséges változók beállítása
cat >> .env << EOF
# Email Verification Development Settings
NODE_ENV=development
EMAIL_TEST_MODE=true
EMAIL_LOG_LEVEL=debug
REQUIRE_EMAIL_VERIFICATION=true
EMAIL_VERIFICATION_EXPIRES_IN=3600  # 1 óra fejlesztéshez
VERIFICATION_FEATURE_ENABLED=true
EOF
```

### 2. Email Szolgáltató Választás

#### Opció A: Test Mode (Ajánlott fejlesztéshez)

```env
# Nincs valós email küldés - csak console log
EMAIL_TEST_MODE=true
EMAIL_PROVIDER=resend  # Bármilyen provider
```

#### Opció B: Resend (Valós emailek)

```env
EMAIL_TEST_MODE=false
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_test_api_key
RESEND_FROM_EMAIL=onboarding@resend.dev
```

#### Opció C: Gmail SMTP (Valós emailek)

```env
EMAIL_TEST_MODE=false
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your.dev@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

### 3. Adatbázis Beállítás

```bash
# Docker PostgreSQL indítása
cd docker && docker-compose up -d

# Migrációk futtatása
bun db:migrate

# Teszt adatok betöltése
bun db:seed
```

### 4. Alkalmazás Indítás

```bash
# Fejlesztői szerver indítása
bun dev

# Másik terminálban - tesztek futtatása
bun test:watch
```

## Fejlesztői Eszközök

### Email Debug Konzol

Test mode esetén a megerősítő linkek a konzolban jelennek meg:

```bash
# Konzol kimenet példa
[EMAIL DEBUG] Verification email would be sent to: user@example.com
[EMAIL DEBUG] Verification URL: http://localhost:5173/verify-email?token=abc123...
[EMAIL DEBUG] Token expires in: 3600 seconds
```

### Email Tesztelő Oldal

Hozz létre egy fejlesztői email tesztelő oldalt:

```svelte
<!-- src/routes/dev/test-email/+page.svelte -->
<script lang="ts">
	import { dev } from '$app/environment';
	import { goto } from '$app/navigation';

	// Csak fejlesztői környezetben elérhető
	if (!dev) {
		goto('/');
	}

	let email = 'test@example.com';
	let status = '';

	async function sendTestVerification() {
		try {
			const response = await fetch('/api/auth/send-verification-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email })
			});

			if (response.ok) {
				status = 'Email küldés sikeres! Nézd a konzolt a linkért.';
			} else {
				status = 'Hiba: ' + (await response.text());
			}
		} catch (error) {
			status = 'Hálózati hiba: ' + error.message;
		}
	}
</script>

<div class="p-8">
	<h1 class="mb-4 text-2xl font-bold">Email Verification Tesztelő</h1>

	<div class="space-y-4">
		<div>
			<label for="email" class="block text-sm font-medium">Email cím:</label>
			<input
				id="email"
				type="email"
				bind:value={email}
				class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
			/>
		</div>

		<button
			on:click={sendTestVerification}
			class="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
		>
			Teszt Email Küldése
		</button>

		{#if status}
			<div class="rounded bg-gray-100 p-4">
				{status}
			</div>
		{/if}
	</div>
</div>
```

### VS Code Beállítások

`.vscode/settings.json`:

```json
{
	"typescript.preferences.includePackageJsonAutoImports": "on",
	"svelte.enable-ts-plugin": true,
	"eslint.validate": ["javascript", "typescript", "svelte"],
	"editor.defaultFormatter": "esbenp.prettier-vscode",
	"editor.formatOnSave": true,
	"[svelte]": {
		"editor.defaultFormatter": "svelte.svelte-vscode"
	},
	"files.associations": {
		"*.env*": "properties"
	}
}
```

### VS Code Extensions

```json
{
	"recommendations": [
		"svelte.svelte-vscode",
		"bradlc.vscode-tailwindcss",
		"esbenp.prettier-vscode",
		"dbaeumer.vscode-eslint",
		"ms-vscode.vscode-typescript-next",
		"formulahendry.auto-rename-tag",
		"christian-kohler.path-intellisense"
	]
}
```

## Tesztelési Stratégia

### Unit Tesztek Futtatása

```bash
# Összes teszt
bun test

# Csak email verification tesztek
bun test email-verification

# Watch mode
bun test:watch

# Coverage report
bun test --coverage
```

### E2E Tesztek

```bash
# E2E tesztek futtatása
bun test:e2e

# Specifikus teszt
bun test:e2e tests/e2e/email-verification.spec.ts

# Debug mode
bun test:e2e --debug
```

### Manuális Tesztelési Checklist

#### Regisztráció Folyamat

- [ ] Új felhasználó regisztrációja
- [ ] Email megerősítés küldése
- [ ] Megerősítő link működése
- [ ] Sikeres bejelentkezés megerősítés után

#### Hibakezelés

- [ ] Érvénytelen token kezelése
- [ ] Lejárt token kezelése
- [ ] Már megerősített email kezelése
- [ ] Rate limiting működése

#### Email Újraküldés

- [ ] Újraküldési oldal működése
- [ ] Rate limiting az újraküldésnél
- [ ] Már megerősített email esetén

## Debugging Technikák

### Email Manager Debug

```typescript
// src/lib/server/email/manager.ts debug mode
if (process.env.EMAIL_LOG_LEVEL === 'debug') {
    console.log('Email Manager Debug:', {
        provider: this.currentProvider,
        testMode: process.env.EMAIL_TEST_MODE,
        to: emailData.to,
        template: emailData.template,
        timestamp: new Date().toISOString()
    });
}
```

### Better Auth Debug

```typescript
// src/lib/auth/index.ts
export const auth = betterAuth({
    // ... other config
    logger: {
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        disabled: false
    }
});
```

### Database Query Debug

```typescript
// Drizzle debug mode
import { drizzle } from 'drizzle-orm/postgres-js';

const db = drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development'
});
```

### Browser DevTools

```javascript
// Console-ban futtatható debug scriptek

// Email verification status ellenőrzése
fetch('/api/auth/session')
	.then((r) => r.json())
	.then((data) => console.log('User session:', data));

// Rate limit status
fetch('/api/auth/send-verification-email', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ email: 'test@example.com' })
}).then((r) => console.log('Rate limit headers:', r.headers));
```

## Performance Profiling

### Email Küldési Teljesítmény

```typescript
// Email küldési idő mérése
const startTime = performance.now();

await emailManager.sendTemplatedEmail({
    to: user.email,
    template: EmailTemplateType.EMAIL_VERIFICATION,
    data: templateData
});

const endTime = performance.now();
console.log(`Email sent in ${endTime - startTime}ms`);
```

### Database Query Profiling

```sql
-- PostgreSQL query profiling
EXPLAIN ANALYZE SELECT * FROM verifications WHERE identifier = $1;

-- Slow query log bekapcsolása
ALTER SYSTEM SET log_min_duration_statement = 100;
SELECT pg_reload_conf();
```

### Memory Usage Monitoring

```typescript
// Memory usage tracking
setInterval(() => {
    const usage = process.memoryUsage();
    console.log('Memory usage:', {
        rss: Math.round(usage.rss / 1024 / 1024) + 'MB',
        heapTotal: Math.round(usage.heapTotal / 1024 / 1024) + 'MB',
        heapUsed: Math.round(usage.heapUsed / 1024 / 1024) + 'MB'
    });
}, 30000); // 30 másodpercenként
```

## Gyakori Fejlesztői Problémák

### "Email nem érkezik meg"

**Ellenőrzési lépések:**

1. **Environment változók:**

   ```bash
   echo $EMAIL_TEST_MODE  # true esetén nincs valós küldés
   echo $EMAIL_PROVIDER   # helyes provider beállítás
   ```

2. **Konzol logok:**

   ```bash
   # Keress email debug üzeneteket
   grep -i "email" logs/app.log
   ```

3. **API kulcs érvényesség:**
   ```bash
   # Resend API teszt
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer $RESEND_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"test@resend.dev","to":"test@example.com","subject":"Test","html":"Test"}'
   ```

### "Token validation fails"

**Debug lépések:**

1. **Token formátum ellenőrzése:**

   ```javascript
   // Browser console-ban
   const urlParams = new URLSearchParams(window.location.search);
   const token = urlParams.get('token');
   console.log('Token:', token, 'Length:', token?.length);
   ```

2. **Database ellenőrzés:**

   ```sql
   SELECT * FROM verifications WHERE value LIKE '%token_part%';
   ```

3. **Lejárati idő ellenőrzése:**
   ```sql
   SELECT *, expires_at < NOW() as expired FROM verifications;
   ```

### "Rate limiting túl szigorú"

**Fejlesztői beállítások:**

```env
# Lazább rate limiting fejlesztéshez
VERIFICATION_RATE_LIMIT_WINDOW=60    # 1 perc
VERIFICATION_RATE_LIMIT_MAX=100      # 100 kísérlet
EMAIL_RATE_LIMIT_DISABLED=true       # Rate limiting kikapcsolása
```

## Hot Reload és Live Development

### SvelteKit Hot Reload

```javascript
// vite.config.ts optimalizálás
export default defineConfig({
	plugins: [sveltekit()],
	server: {
		fs: {
			allow: ['..']
		},
		hmr: {
			port: 5174
		}
	},
	optimizeDeps: {
		include: ['better-auth']
	}
});
```

### Email Template Hot Reload

```typescript
// Fejlesztői template watcher
if (process.env.NODE_ENV === 'development') {
    import('chokidar').then(({ watch }) => {
        watch('src/lib/server/email/templates/**/*.ts').on('change', () => {
            // Template cache törölése
            delete require.cache[require.resolve('./built-in.ts')];
            console.log('Email templates reloaded');
        });
    });
}
```

## Docker Development Setup

### Docker Compose Override

`docker-compose.override.yml`:

```yaml
version: '3.8'
services:
  postgres:
    ports:
      - '5432:5432'
    environment:
      POSTGRES_DB: sveltedesktop_dev
      POSTGRES_USER: dev_user
      POSTGRES_PASSWORD: dev_password
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data
      - ./docker/postgres/init-dev.sql:/docker-entrypoint-initdb.d/init.sql

  mailhog:
    image: mailhog/mailhog:latest
    ports:
      - '1025:1025' # SMTP
      - '8025:8025' # Web UI
    environment:
      MH_STORAGE: maildir
      MH_MAILDIR_PATH: /maildir

volumes:
  postgres_dev_data:
```

### MailHog Integration

```env
# MailHog SMTP beállítások fejlesztéshez
EMAIL_PROVIDER=smtp
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
SMTP_USERNAME=""
SMTP_PASSWORD=""
```

## CI/CD Pipeline Integration

### GitHub Actions

`.github/workflows/email-verification-tests.yml`:

```yaml
name: Email Verification Tests

on:
  push:
    paths:
      - 'src/lib/auth/**'
      - 'src/lib/server/email/**'
      - 'tests/**/*email*'

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - run: bun install

      - name: Run email verification tests
        env:
          EMAIL_TEST_MODE: true
          DATABASE_URL: postgresql://postgres:test_password@localhost:5432/test_db
        run: |
          bun db:migrate
          bun test email-verification
          bun test:e2e tests/e2e/email-verification.spec.ts
```

## Monitoring és Metrics

### Development Metrics Dashboard

```typescript
// src/routes/dev/metrics/+page.server.ts
export async function load() {
    if (!dev) throw error(404);

    const metrics = {
        emailsSent: await getEmailCount('last_24h'),
        verificationRate: await getVerificationRate(),
        errorRate: await getErrorRate(),
        avgResponseTime: await getAvgResponseTime()
    };

    return { metrics };
}
```

### Real-time Logging

```typescript
// WebSocket alapú real-time log streaming
if (process.env.NODE_ENV === 'development') {
    const wss = new WebSocketServer({ port: 8080 });

    wss.on('connection', (ws) => {
        const logStream = new LogStream();
        logStream.on('email-event', (data) => {
            ws.send(JSON.stringify(data));
        });
    });
}
```

---

_Ez az útmutató folyamatosan frissül az új fejlesztői eszközökkel és best practice-ekkel._
