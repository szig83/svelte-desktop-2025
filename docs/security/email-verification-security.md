# Email Verification Biztonsági Útmutató

## Áttekintés

Ez a dokumentum részletezi az email verification funkció biztonsági aspektusait, konfigurációs ajánlásokat és best practice-eket tartalmaz a biztonságos működéshez.

## Biztonsági Architektúra

### Token Biztonság

#### Token Generálás

```typescript
// Better Auth automatikusan biztosítja
const secureToken = {
    algorithm: 'crypto.randomBytes',
    length: 32,                    // 256 bit
    encoding: 'base64url',         // URL-safe encoding
    entropy: 256                   // Magas entrópia
};
```

#### Token Tulajdonságok

- **Kriptográfiailag biztonságos** random generálás
- **URL-safe encoding** (base64url)
- **Egyedi azonosító** minden tokenhez
- **Lejárati idő** (alapértelmezett: 24 óra)
- **Egyszeri használat** - automatikus érvénytelenítés

#### Token Tárolás

```sql
-- Better Auth verifications tábla
CREATE TABLE verifications (
    id TEXT PRIMARY KEY,
    identifier TEXT NOT NULL,      -- Email cím (hash-elt)
    value TEXT NOT NULL,           -- Token (hash-elt)
    expires_at TIMESTAMP NOT NULL, -- Lejárati idő
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Biztonsági indexek
CREATE INDEX idx_verifications_expires ON verifications(expires_at);
CREATE INDEX idx_verifications_identifier ON verifications(identifier);
```

### Rate Limiting

#### Beépített Védelem

```typescript
// Better Auth konfiguráció
export const auth = betterAuth({
    rateLimit: {
        window: 60,        // 1 perces ablak
        max: 5,           // Maximum 5 kísérlet
        storage: 'memory' // vagy 'redis' éles környezetben
    }
});
```

#### Többszintű Rate Limiting

```typescript
// Alkalmazás szintű rate limiting
const rateLimits = {
    emailSend: {
        perUser: { requests: 3, window: 300 },    // 3 email / 5 perc / user
        perIP: { requests: 10, window: 300 },     // 10 email / 5 perc / IP
        global: { requests: 1000, window: 3600 }  // 1000 email / óra globálisan
    },
    verification: {
        perIP: { requests: 20, window: 300 },     // 20 próbálkozás / 5 perc / IP
        perToken: { requests: 3, window: 60 }     // 3 próbálkozás / perc / token
    }
};
```

### HTTPS és Transport Biztonság

#### Kötelező HTTPS

```typescript
// Better Auth konfiguráció
export const auth = betterAuth({
    advanced: {
        useSecureCookies: process.env.NODE_ENV === 'production',
        crossSubDomainCookies: false,
        sameSitePolicy: 'strict'
    }
});
```

#### Email Link Biztonság

```typescript
// Megerősítő URL generálás
const verificationUrl = new URL('/verify-email', process.env.BETTER_AUTH_URL);
verificationUrl.searchParams.set('token', secureToken);
verificationUrl.searchParams.set('callbackURL', '/dashboard');

// HTTPS kényszerítés
if (process.env.NODE_ENV === 'production' && verificationUrl.protocol !== 'https:') {
    throw new Error('HTTPS required in production');
}
```

## Konfigurációs Biztonsági Beállítások

### Environment Változók Biztonsága

#### Kötelező Biztonsági Beállítások

```env
# Éles környezetben KÖTELEZŐ
NODE_ENV=production
BETTER_AUTH_SECRET=your_32_character_cryptographically_secure_secret
BETTER_AUTH_URL=https://yourdomain.com

# Email verification specifikus
REQUIRE_EMAIL_VERIFICATION=true
EMAIL_VERIFICATION_EXPIRES_IN=86400  # 24 óra (ne legyen hosszabb)
AUTO_SIGNIN_AFTER_VERIFICATION=false # Biztonsági okokból

# Rate limiting
VERIFICATION_RATE_LIMIT_WINDOW=300   # 5 perc
VERIFICATION_RATE_LIMIT_MAX=5        # Maximum kísérletek

# Logging (ne legyen debug éles környezetben)
EMAIL_LOG_LEVEL=info
EMAIL_TEST_MODE=false
```

#### Titkos Kulcsok Kezelése

```bash
# Biztonságos secret generálás
openssl rand -base64 32

# Environment fájl jogosultságok
chmod 600 .env
chown app:app .env

# Git ignore ellenőrzése
echo ".env" >> .gitignore
```

### Email Szolgáltató Biztonság

#### Resend Konfiguráció

```env
# API kulcs korlátozások
RESEND_API_KEY=re_...  # Csak send jogosultság
RESEND_FROM_EMAIL=noreply@yourdomain.com  # Verifikált domain

# Webhook biztonság
RESEND_WEBHOOK_SECRET=your_webhook_secret_here
RESEND_WEBHOOK_SIGNATURE_VALIDATION=true
```

#### SMTP Biztonság

```env
# Biztonságos SMTP beállítások
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587                    # STARTTLS
SMTP_SECURE=false               # STARTTLS használata
SMTP_REQUIRE_TLS=true           # TLS kényszerítés
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=app_specific_password  # NE használj normál jelszót!

# Connection security
SMTP_CONNECTION_TIMEOUT=30000    # 30 sec timeout
SMTP_SOCKET_TIMEOUT=30000       # 30 sec socket timeout
```

## Támadási Vektorok és Védelem

### Email Enumeration Védelem

#### Probléma

Támadók megpróbálhatják kitalálni létező email címeket.

#### Védelem

```typescript
// Egységes válasz létező és nem létező emailekhez
async function sendVerificationEmail(email: string) {
    // Mindig ugyanazt a választ adjuk
    const response = { success: true, message: 'Ha az email cím létezik, küldtünk megerősítő emailt.' };

    // Háttérben ellenőrizzük és küldünk emailt
    const user = await findUserByEmail(email);
    if (user && !user.emailVerified) {
        await actualSendEmail(user);
    }

    return response;
}
```

### Token Brute Force Védelem

#### Probléma

Támadók megpróbálhatják kitalálni a tokeneket.

#### Védelem

```typescript
// Exponenciális backoff
const attemptCounts = new Map<string, number>();

async function verifyToken(token: string, ip: string) {
    const attempts = attemptCounts.get(ip) || 0;

    if (attempts > 3) {
        const delay = Math.pow(2, attempts - 3) * 1000; // 1s, 2s, 4s, 8s...
        await new Promise(resolve => setTimeout(resolve, delay));
    }

    const result = await betterAuth.verifyEmail(token);

    if (!result.success) {
        attemptCounts.set(ip, attempts + 1);
    } else {
        attemptCounts.delete(ip);
    }

    return result;
}
```

### Email Spoofing Védelem

#### SPF Record

```dns
yourdomain.com. TXT "v=spf1 include:_spf.resend.com ~all"
```

#### DKIM Signing

```dns
resend._domainkey.yourdomain.com. TXT "v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY"
```

#### DMARC Policy

```dns
_dmarc.yourdomain.com. TXT "v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"
```

### Session Hijacking Védelem

#### Secure Cookie Beállítások

```typescript
export const auth = betterAuth({
    advanced: {
        cookiePrefix: '__Secure-',
        useSecureCookies: true,
        sameSitePolicy: 'strict',
        httpOnlyCookies: true,
        crossSubDomainCookies: false
    }
});
```

## Monitoring és Riasztások

### Biztonsági Metrikák

```typescript
// Gyanús aktivitás detektálása
const securityMetrics = {
    // Rate limiting túllépések
    rateLimitExceeded: {
        threshold: 10,        // 10 túllépés / óra
        action: 'alert'
    },

    // Sikertelen token validációk
    failedVerifications: {
        threshold: 50,        // 50 sikertelen / óra
        action: 'investigate'
    },

    // Email küldési hibák
    emailFailures: {
        threshold: 5,         // 5% hiba ráta
        action: 'alert'
    },

    // Szokatlan IP aktivitás
    suspiciousIPs: {
        threshold: 100,       // 100 kérés / IP / óra
        action: 'block'
    }
};
```

### Naplózási Stratégia

```typescript
// Biztonsági események naplózása
const securityLogger = {
    emailSent: (userId: string, email: string, ip: string) => {
        logger.info('Email verification sent', {
            event: 'email_verification_sent',
            userId,
            email: hashEmail(email),  // Hash-elt email a privacy miatt
            ip: hashIP(ip),          // Hash-elt IP
            timestamp: new Date().toISOString(),
            userAgent: request.headers['user-agent']
        });
    },

    verificationAttempt: (token: string, ip: string, success: boolean) => {
        logger.info('Email verification attempt', {
            event: 'email_verification_attempt',
            tokenHash: hashToken(token),
            ip: hashIP(ip),
            success,
            timestamp: new Date().toISOString()
        });
    },

    rateLimitExceeded: (ip: string, endpoint: string) => {
        logger.warn('Rate limit exceeded', {
            event: 'rate_limit_exceeded',
            ip: hashIP(ip),
            endpoint,
            timestamp: new Date().toISOString()
        });
    }
};
```

## Compliance és Adatvédelem

### GDPR Megfelelőség

#### Adatminimalizálás

```typescript
// Csak szükséges adatok tárolása
const verificationData = {
    identifier: hashEmail(email),     // Hash-elt email
    value: hashToken(token),          // Hash-elt token
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000),
    // NE tároljunk: IP címet, user agent-et, stb.
};
```

#### Adattörlés

```sql
-- Automatikus cleanup lejárt tokenekhez
CREATE OR REPLACE FUNCTION cleanup_expired_verifications()
RETURNS void AS $$
BEGIN
    DELETE FROM verifications WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Cron job beállítása
SELECT cron.schedule('cleanup-verifications', '0 */6 * * *', 'SELECT cleanup_expired_verifications();');
```

#### Felhasználói Jogok

```typescript
// Adatok exportálása
async function exportUserVerificationData(userId: string) {
    const data = await db.select()
        .from(verifications)
        .where(eq(verifications.identifier, hashEmail(user.email)));

    return {
        verificationTokens: data.map(v => ({
            created: v.created_at,
            expires: v.expires_at,
            used: v.used_at
        }))
    };
}

// Adatok törlése
async function deleteUserVerificationData(userId: string) {
    await db.delete(verifications)
        .where(eq(verifications.identifier, hashEmail(user.email)));
}
```

## Incidenskezelés

### Biztonsági Incidens Típusok

#### 1. Token Kompromittálódás

**Jelek:**

- Szokatlanul magas token validációs ráta
- Sikeres verifikációk ismeretlen IP címekről

**Válaszlépések:**

1. Összes aktív token érvénytelenítése
2. Rate limiting szigorítása
3. Érintett felhasználók értesítése
4. Új tokenek generálása

#### 2. Email Szolgáltató Kompromittálódás

**Jelek:**

- Email küldési hibák növekedése
- Spam jelentések növekedése

**Válaszlépések:**

1. Email szolgáltató váltása
2. API kulcsok cseréje
3. DNS rekordok ellenőrzése
4. Felhasználók tájékoztatása

#### 3. Rate Limiting Megkerülése

**Jelek:**

- Szokatlanul magas kérésszám
- Elosztott IP címekről érkező kérések

**Válaszlépések:**

1. IP blokkolás implementálása
2. CAPTCHA bevezetése
3. Rate limiting algoritmus frissítése
4. WAF szabályok hozzáadása

### Incidens Válasz Protokoll

```typescript
// Automatikus incidens válasz
class SecurityIncidentHandler {
    async handleSuspiciousActivity(event: SecurityEvent) {
        // 1. Azonnali védelem
        await this.enableEmergencyProtection(event);

        // 2. Naplózás és riasztás
        await this.logSecurityEvent(event);
        await this.sendSecurityAlert(event);

        // 3. Vizsgálat indítása
        await this.startInvestigation(event);

        // 4. Felhasználók értesítése (ha szükséges)
        if (event.severity === 'high') {
            await this.notifyAffectedUsers(event);
        }
    }

    private async enableEmergencyProtection(event: SecurityEvent) {
        switch (event.type) {
            case 'token_bruteforce':
                await this.temporaryTokenDisable();
                break;
            case 'email_enumeration':
                await this.enableStrictRateLimit();
                break;
            case 'mass_verification_attempts':
                await this.enableCaptcha();
                break;
        }
    }
}
```

## Biztonsági Ellenőrzőlista

### Fejlesztés Előtt

- [ ] **Environment változók** biztonságos beállítása
- [ ] **HTTPS kényszerítés** minden környezetben
- [ ] **Rate limiting** konfigurálása
- [ ] **Token lejárati idő** beállítása (max 24 óra)
- [ ] **Secure cookie** beállítások
- [ ] **Email szolgáltató** biztonsági konfigurációja

### Telepítés Előtt

- [ ] **Biztonsági tesztek** futtatása
- [ ] **Penetrációs tesztek** elvégzése
- [ ] **Dependency audit** futtatása
- [ ] **SSL/TLS konfiguráció** ellenőrzése
- [ ] **DNS biztonsági rekordok** beállítása
- [ ] **Monitoring és riasztások** konfigurálása

### Éles Üzem Után

- [ ] **Biztonsági metrikák** figyelése
- [ ] **Rendszeres biztonsági auditok**
- [ ] **Dependency frissítések** követése
- [ ] **Incidens válasz terv** tesztelése
- [ ] **Backup és helyreállítás** tesztelése
- [ ] **Compliance ellenőrzések** elvégzése

## Biztonsági Frissítések

### Rendszeres Karbantartás

```bash
# Dependency audit
bun audit

# Security updates
bun update --latest

# Database security patches
psql -c "SELECT version();"

# SSL certificate renewal
certbot renew --dry-run
```

### Biztonsági Patch Kezelés

1. **Kritikus sebezhetőségek** - 24 órán belül
2. **Magas prioritású** - 1 héten belül
3. **Közepes prioritású** - 1 hónapon belül
4. **Alacsony prioritású** - Következő release-ben

---

_Ez a dokumentum rendszeresen frissül a legújabb biztonsági best practice-ek alapján._
