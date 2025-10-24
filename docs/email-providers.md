# Email Szolgáltató Konfigurációk

## Resend (Alapértelmezett)

```env
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
RESEND_VERIFIED_EMAIL=your@email.com
```

## SendGrid

```env
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG.your_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

**Telepítés:**

```bash
bun add @sendgrid/mail
```

## SMTP (Gmail, Outlook, stb.)

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your_app_password
```

**Gmail App Password beállítása:**

1. Google Account → Security → 2-Step Verification
2. App passwords → Generate password
3. Használd a generált jelszót

**Telepítés:**

```bash
bun add nodemailer
bun add -D @types/nodemailer
```

## AWS SES

```env
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
```

**Telepítés:**

```bash
bun add @aws-sdk/client-ses
```

## Szolgáltató Váltás

1. **Environment változók beállítása** az új szolgáltatóhoz
2. **EMAIL_PROVIDER** változó módosítása
3. **Szerver újraindítása**
4. **Tesztelés** a `/admin/test-email` oldalon

## Költségek Összehasonlítása

| Szolgáltató  | Ingyenes Limit | Ár (1000 email) | Előnyök                  |
| ------------ | -------------- | --------------- | ------------------------ |
| **Resend**   | 3,000/hó       | $1              | Egyszerű, fejlesztőbarát |
| **SendGrid** | 100/nap        | $14.95/hó       | Megbízható, analytics    |
| **SMTP**     | Korlátlan\*    | Ingyenes\*      | Teljes kontroll          |
| **AWS SES**  | 62,000/hó      | $0.10           | Olcsó, skálázható        |

\*SMTP esetén a szolgáltató (Gmail, Outlook) limitjei érvényesek

## Éles Üzem Ajánlások

### Kis Volumen (< 10,000 email/hó)

- **Resend** vagy **SendGrid** - egyszerű beállítás
- Jó dokumentáció és support

### Közepes Volumen (10,000 - 100,000 email/hó)

- **AWS SES** - költséghatékony
- **SendGrid** - fejlett funkciók

### Nagy Volumen (> 100,000 email/hó)

- **AWS SES** - legjobb ár/érték arány
- Saját SMTP szerver megfontolása

## Hibakezelés és Monitoring

Minden provider támogatja:

- ✅ Retry mechanizmus
- ✅ Hibakezelés
- ✅ Logging
- ✅ Webhook support (ahol elérhető)
- ✅ Template rendszer
