# Email Szolgáltató Migráció Útmutató

## 1. Resend → SendGrid

### Lépések:

1. **SendGrid fiók létrehozása** és API kulcs generálása
2. **Domain verifikálás** SendGrid-ben
3. **Environment változók frissítése:**

```env
# Régi (Resend)
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Új (SendGrid)
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
```

4. **Függőség telepítése:**

```bash
bun add @sendgrid/mail
```

5. **SendGrid client implementálása** (lásd providers/sendgrid.ts)
6. **Tesztelés** és **deployment**

## 2. Resend → SMTP (Gmail)

### Lépések:

1. **Gmail App Password** beállítása
2. **Environment változók:**

```env
EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USERNAME=your@gmail.com
SMTP_PASSWORD=your_16_char_app_password
```

3. **Nodemailer telepítése:**

```bash
bun add nodemailer @types/nodemailer
```

## 3. Resend → AWS SES

### Lépések:

1. **AWS SES beállítása** és domain verifikálás
2. **IAM user** létrehozása SES jogosultságokkal
3. **Environment változók:**

```env
EMAIL_PROVIDER=ses
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
```

4. **AWS SDK telepítése:**

```bash
bun add @aws-sdk/client-ses
```

## Zero-Downtime Migráció

### Fokozatos Átállás:

1. **Új provider beállítása** test módban
2. **A/B testing** - forgalom egy részének átirányítása
3. **Monitoring** és hibakeresés
4. **Teljes átállás** ha minden rendben

### Rollback Terv:

```env
# Gyors visszaállás Resend-re
EMAIL_PROVIDER=resend
# Régi Resend változók megtartása
```

## Költség Optimalizálás

### Volumen Alapú Választás:

- **< 3,000 email/hó**: Resend (ingyenes)
- **3,000 - 10,000**: SendGrid vagy Resend
- **10,000+**: AWS SES (legolcsóbb)

### Hibrid Megoldás:

```typescript
// Különböző providerek különböző email típusokhoz
const provider = emailType === 'transactional' ? 'ses' : 'sendgrid';
```

## Monitoring és Alerting

### Metrics Követése:

- Email delivery rate
- Bounce rate
- Open rate (ahol elérhető)
- API response times
- Költségek

### Alert Beállítások:

- High bounce rate (> 5%)
- API errors (> 1%)
- Unusual volume spikes
- Cost thresholds
