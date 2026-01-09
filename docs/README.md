# Desktop Environment Dokumentáció

## 📋 Áttekintés

Ez a dokumentáció a Desktop Environment webalkalmazás összes funkciójának és konfigurációjának részletes leírását tartalmazza.

## 🚀 Gyors Kezdés

- **[Alkalmazás Paraméterek](./APP_PARAMETERS.md)** - Környezeti változók és konfigurációk
- **[Implementációs Összefoglaló](./IMPLEMENTATION_SUMMARY.md)** - Projekt áttekintés
- **[Email Verification Gyors Útmutató](./README-email-verification.md)** - Email megerősítés gyors beállítás

## 📧 Email Rendszer

### Email Verification (Email Megerősítés)

- **[📋 Implementációs Ellenőrzőlista](./EMAIL_VERIFICATION_CHECKLIST.md)** - Teljes státusz és ellenőrzőlista
- **[📖 Teljes Dokumentáció](./features/email-verification.md)** - Részletes funkció leírás
- **[🔒 Biztonsági Útmutató](./security/email-verification-security.md)** - Biztonsági best practices
- **[⚙️ Fejlesztői Beállítások](./development/email-verification-dev-setup.md)** - Dev környezet optimalizálás

### Email Szolgáltatók

- **[Email Szolgáltatók Konfigurációja](./email-providers.md)** - Resend, SMTP, SendGrid, AWS SES
- **[Gmail SMTP Beállítás](./gmail-smtp-setup.md)** - Gmail specifikus konfiguráció
- **[Email Migráció Útmutató](./email-migration-guide.md)** - Szolgáltató váltás

## 🎨 Téma Rendszer

- **[Téma Rendszer Áttekintés](./THEME_SYSTEM.md)** - Téma architektúra
- **[Téma Használati Példák](./THEME_USAGE_EXAMPLE.md)** - Implementációs példák
- **[README Téma](./README_THEME.md)** - Téma specifikus dokumentáció

## 📁 Dokumentáció Struktúra

```
docs/
├── README.md                           # Ez a fájl - fő index
├── EMAIL_VERIFICATION_CHECKLIST.md    # ✅ Email verification státusz
├── README-email-verification.md        # 🚀 Email verification gyors útmutató
│
├── features/                           # 📋 Funkció specifikus dokumentációk
│   ├── email-verification.md          # 📧 Teljes email verification dokumentáció
│   └── registration-email.md          # 📧 Regisztrációs email funkció
│
├── security/                          # 🔒 Biztonsági dokumentációk
│   └── email-verification-security.md # 🔒 Email verification biztonság
│
├── development/                       # ⚙️ Fejlesztői dokumentációk
│   └── email-verification-dev-setup.md # ⚙️ Email verification dev setup
│
├── APP_PARAMETERS.md                  # 🔧 Környezeti változók
├── IMPLEMENTATION_SUMMARY.md          # 📊 Projekt összefoglaló
├── email-providers.md                 # 📧 Email szolgáltatók
├── email-migration-guide.md           # 🔄 Email migráció
├── gmail-smtp-setup.md               # 📧 Gmail SMTP setup
├── THEME_SYSTEM.md                   # 🎨 Téma rendszer
├── THEME_USAGE_EXAMPLE.md            # 🎨 Téma példák
└── README_THEME.md                   # 🎨 Téma README
```

## 🔧 Konfigurációs Útmutatók

### Email Verification Beállítás

1. **[Ellenőrzőlista áttekintése](./EMAIL_VERIFICATION_CHECKLIST.md)** - Státusz ellenőrzés
2. **[Gyors beállítás](./README-email-verification.md)** - 5 perces setup
3. **[Részletes konfiguráció](./features/email-verification.md)** - Teljes dokumentáció
4. **[Biztonsági beállítások](./security/email-verification-security.md)** - Biztonság optimalizálás

### Email Szolgáltató Konfiguráció

1. **[Szolgáltató választás](./email-providers.md)** - Resend vs SMTP vs SendGrid vs SES
2. **[Gmail SMTP](./gmail-smtp-setup.md)** - Gmail app password beállítás
3. **[Szolgáltató váltás](./email-migration-guide.md)** - Migráció lépései

## 🧪 Tesztelési Útmutatók

### Email Verification Tesztelés

```bash
# Konfiguráció validálása
bun validate:email-verification

# Unit tesztek
bun test email-verification

# E2E tesztek
bun test:e2e tests/e2e/email-verification.spec.ts

# Email szolgáltató teszt
bun email:test

# Email diagnostics
bun email:diagnostics
```

### Fejlesztői Tesztelés

```bash
# Fejlesztői szerver
bun dev

# Test mode (nincs valós email küldés)
EMAIL_TEST_MODE=true bun dev

# Debug mode (részletes logok)
EMAIL_LOG_LEVEL=debug bun dev
```

## 🔍 Hibaelhárítás

### Gyakori Problémák

#### Email Verification Problémák

1. **Email nem érkezik meg**
   - Ellenőrizd: `EMAIL_TEST_MODE=false`
   - Nézd meg a spam mappát
   - Ellenőrizd az API kulcsokat
   - [Részletes hibaelhárítás →](./features/email-verification.md#hibaelhárítás)

2. **Token érvénytelen hibák**
   - Ellenőrizd a token lejárati időt
   - Győződj meg róla, hogy a link nem sérült
   - [Token debugging →](./development/email-verification-dev-setup.md#debugging-technikák)

3. **Rate limiting problémák**
   - Módosítsd a rate limit beállításokat
   - Whitelist-eld a fejlesztői IP-t
   - [Rate limiting konfiguráció →](./security/email-verification-security.md#rate-limiting)

#### Email Szolgáltató Problémák

1. **Resend API hibák**
   - Ellenőrizd az API kulcs formátumát (`re_` prefix)
   - Verifikáld a from email domain-t
   - [Resend troubleshooting →](./email-providers.md#resend-alapértelmezett)

2. **SMTP kapcsolódási hibák**
   - Ellenőrizd a host és port beállításokat
   - Győződj meg róla, hogy az app password helyes
   - [SMTP debugging →](./gmail-smtp-setup.md)

## 📊 Monitoring és Metrikák

### Email Verification Metrikák

- **Email küldési ráta** - Napi/heti/havi statisztikák
- **Megerősítési konverzió** - Sikeres megerősítések százaléka
- **Hibaráta** - Email küldési és validációs hibák
- **Rate limiting események** - Túllépések száma

### Monitoring Beállítás

```typescript
// Metrikák követése
const metrics = {
    emailsSent: await getEmailCount('last_24h'),
    verificationRate: await getVerificationRate(),
    errorRate: await getErrorRate(),
    avgResponseTime: await getAvgResponseTime()
};
```

## 🔒 Biztonsági Megfontolások

### Email Verification Biztonság

- **Token biztonság** - Kriptográfiailag biztonságos, 32 byte
- **Lejárati idő** - Alapértelmezett 24 óra
- **Rate limiting** - 5 kísérlet / 5 perc
- **HTTPS kényszerítés** - Éles környezetben kötelező

### Biztonsági Ellenőrzőlista

- [ ] HTTPS bekapcsolva éles környezetben
- [ ] Biztonságos `BETTER_AUTH_SECRET` beállítva (32+ karakter)
- [ ] Rate limiting konfigurálva
- [ ] Email szolgáltató API kulcsok biztonságosan tárolva
- [ ] Monitoring és riasztások beállítva

[Teljes biztonsági útmutató →](./security/email-verification-security.md)

## 🚀 Telepítési Útmutatók

### Fejlesztői Környezet

1. **Environment beállítás**

   ```bash
   cp .env.example .env
   # Szerkeszd a .env fájlt
   ```

2. **Függőségek telepítése**

   ```bash
   bun install
   ```

3. **Adatbázis setup**

   ```bash
   bun db:migrate
   bun db:seed
   ```

4. **Alkalmazás indítás**
   ```bash
   bun dev
   ```

[Részletes fejlesztői setup →](./development/email-verification-dev-setup.md)

### Éles Környezet

1. **Biztonsági beállítások ellenőrzése**
2. **Email szolgáltató konfiguráció**
3. **HTTPS bekapcsolása**
4. **Monitoring beállítása**

[Éles telepítési útmutató →](./features/email-verification.md#telepítés)

## 📚 API Dokumentáció

### Email Verification API

#### Email Megerősítés

```http
GET /api/auth/verify-email?token=TOKEN&callbackURL=URL
```

#### Email Újraküldés

```http
POST /api/auth/send-verification-email
Content-Type: application/json

{
    "email": "user@example.com",
    "callbackURL": "/dashboard"
}
```

[Teljes API dokumentáció →](./features/email-verification.md#api-végpontok)

## 🤝 Közreműködés

### Dokumentáció Frissítése

1. **Fork** a repository-t
2. **Módosítsd** a megfelelő dokumentációs fájlokat
3. **Teszteld** a változtatásokat
4. **Pull Request** létrehozása

### Dokumentációs Standardok

- **Markdown formátum** használata
- **Magyar nyelv** elsődleges
- **Kód példák** minden konfigurációhoz
- **Linkek** kapcsolódó dokumentációkhoz

## 📞 Támogatás

### Kapcsolat

- **GitHub Issues** - Hibák és feature kérések
- **Dokumentáció** - `/docs` mappa
- **Email** - support@yourdomain.com

### Hasznos Linkek

- [SvelteKit Dokumentáció](https://kit.svelte.dev/docs)
- [Better Auth Dokumentáció](https://better-auth.com/docs)
- [Resend API Docs](https://resend.com/docs)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)

---

**Utolsó frissítés:** 2024. október
**Dokumentáció verzió:** 1.0.0
**Státusz:** ✅ Naprakész és teljes
