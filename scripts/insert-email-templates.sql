-- Email templates beszúrása az adatbázisba
-- Ez a script beszúrja a jelenlegi kódban lévő built-in email templateket az email_templates táblába

-- Töröljük a meglévő templateket (ha vannak)
DELETE FROM platform.email_templates WHERE template_type IN ('welcome', 'password_reset', 'notification', 'email_verification');

-- WELCOME template
INSERT INTO platform.email_templates (
    template_type,
    name,
    subject_template,
    html_template,
    text_template,
    required_data,
    optional_data,
    is_active
) VALUES (
    'welcome',
    'Welcome Email',
    'Welcome to {{appName}}, {{name}}!',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{appName}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .content {
            padding: 20px 0;
        }
        .welcome-message {
            font-size: 18px;
            margin-bottom: 20px;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">{{appName}}</div>
    </div>

    <div class="content">
        <h1>Welcome, {{name}}!</h1>

        <p class="welcome-message">
            We''re excited to have you join our community. Your account has been successfully created and you''re ready to get started.
        </p>

        <p>
            Here''s what you can do next:
        </p>

        <ul>
            <li>Complete your profile setup</li>
            <li>Explore our features and tools</li>
            <li>Connect with other users</li>
            <li>Start using {{appName}} to its fullest potential</li>
        </ul>

        {{#if dashboardUrl}}
        <p>
            <a href="{{dashboardUrl}}" class="cta-button">Go to Dashboard</a>
        </p>
        {{/if}}

        <p>
            If you have any questions or need help getting started, don''t hesitate to reach out to our support team.
        </p>

        <p>
            Welcome aboard!<br>
            The {{appName}} Team
        </p>
    </div>

    <div class="footer">
        <p>
            This email was sent to {{email}}. If you didn''t create an account, please ignore this email.
        </p>
        {{#if unsubscribeUrl}}
        <p>
            <a href="{{unsubscribeUrl}}">Unsubscribe</a> from these emails.
        </p>
        {{/if}}
    </div>
</body>
</html>',
    'Welcome to {{appName}}, {{name}}!

We''re excited to have you join our community. Your account has been successfully created and you''re ready to get started.

Here''s what you can do next:
- Complete your profile setup
- Explore our features and tools
- Connect with other users
- Start using {{appName}} to its fullest potential

{{#if dashboardUrl}}
Visit your dashboard: {{dashboardUrl}}
{{/if}}

If you have any questions or need help getting started, don''t hesitate to reach out to our support team.

Welcome aboard!
The {{appName}} Team

---
This email was sent to {{email}}. If you didn''t create an account, please ignore this email.
{{#if unsubscribeUrl}}
Unsubscribe: {{unsubscribeUrl}}
{{/if}}',
    '["name", "email", "appName"]'::jsonb,
    '["dashboardUrl", "unsubscribeUrl"]'::jsonb,
    true
);

-- PASSWORD_RESET template
INSERT INTO platform.email_templates (
    template_type,
    name,
    subject_template,
    html_template,
    text_template,
    required_data,
    optional_data,
    is_active
) VALUES (
    'password_reset',
    'Password Reset Email',
    'Reset your {{appName}} password',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - {{appName}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .content {
            padding: 20px 0;
        }
        .alert {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .security-note {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">{{appName}}</div>
    </div>

    <div class="content">
        <h1>Password Reset Request</h1>

        <p>
            Hello {{name}},
        </p>

        <p>
            We received a request to reset the password for your {{appName}} account ({{email}}).
        </p>

        <div class="alert">
            <strong>Important:</strong> This password reset link will expire in {{expirationTime}} for security reasons.
        </div>

        <p>
            Click the button below to reset your password:
        </p>

        <p>
            <a href="{{resetLink}}" class="cta-button">Reset Password</a>
        </p>

        <p>
            If the button doesn''t work, you can copy and paste this link into your browser:
        </p>

        <p style="word-break: break-all; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
            {{resetLink}}
        </p>

        <div class="security-note">
            <strong>Security Note:</strong>
            <ul>
                <li>If you didn''t request this password reset, please ignore this email</li>
                <li>Never share this reset link with anyone</li>
                <li>This link can only be used once</li>
                <li>For security, we recommend using a strong, unique password</li>
            </ul>
        </div>

        <p>
            If you''re having trouble or didn''t request this reset, please contact our support team immediately.
        </p>

        <p>
            Best regards,<br>
            The {{appName}} Security Team
        </p>
    </div>

    <div class="footer">
        <p>
            This email was sent to {{email}} because a password reset was requested for this account.
        </p>
        <p>
            {{appName}} - Keeping your account secure
        </p>
    </div>
</body>
</html>',
    'Password Reset Request - {{appName}}

Hello {{name}},

We received a request to reset the password for your {{appName}} account ({{email}}).

IMPORTANT: This password reset link will expire in {{expirationTime}} for security reasons.

Reset your password by visiting this link:
{{resetLink}}

Security Notes:
- If you didn''t request this password reset, please ignore this email
- Never share this reset link with anyone
- This link can only be used once
- For security, we recommend using a strong, unique password

If you''re having trouble or didn''t request this reset, please contact our support team immediately.

Best regards,
The {{appName}} Security Team

---
This email was sent to {{email}} because a password reset was requested for this account.
{{appName}} - Keeping your account secure',
    '["name", "email", "resetLink", "appName", "expirationTime"]'::jsonb,
    '[]'::jsonb,
    true
);

-- NOTIFICATION template
INSERT INTO platform.email_templates (
    template_type,
    name,
    subject_template,
    html_template,
    text_template,
    required_data,
    optional_data,
    is_active
) VALUES (
    'notification',
    'General Notification Email',
    '{{title}} - {{appName}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} - {{appName}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .content {
            padding: 20px 0;
        }
        .notification-badge {
            display: inline-block;
            background-color: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 20px;
        }
        .notification-badge.urgent {
            background-color: #dc2626;
        }
        .notification-badge.info {
            background-color: #059669;
        }
        .notification-badge.warning {
            background-color: #d97706;
        }
        .message-content {
            background-color: #f9fafb;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 20px 0;
            border-radius: 0 6px 6px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .timestamp {
            color: #6b7280;
            font-size: 14px;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">{{appName}}</div>
    </div>

    <div class="content">
        <div class="notification-badge {{priority}}">{{type}}</div>

        <h1>{{title}}</h1>

        <p>
            Hello {{name}},
        </p>

        <div class="message-content">
            {{message}}
        </div>

        {{#if details}}
        <h3>Additional Details:</h3>
        <p>{{details}}</p>
        {{/if}}

        {{#if actionUrl}}
        <p>
            <a href="{{actionUrl}}" class="cta-button">{{actionText}}</a>
        </p>
        {{/if}}

        {{#if timestamp}}
        <div class="timestamp">
            Notification sent: {{timestamp}}
        </div>
        {{/if}}

        <p>
            Best regards,<br>
            The {{appName}} Team
        </p>
    </div>

    <div class="footer">
        <p>
            This notification was sent to {{email}}.
        </p>
        {{#if unsubscribeUrl}}
        <p>
            <a href="{{unsubscribeUrl}}">Manage notification preferences</a>
        </p>
        {{/if}}
    </div>
</body>
</html>',
    '{{title}} - {{appName}}

Hello {{name}},

[{{type}}] {{title}}

{{message}}

{{#if details}}
Additional Details:
{{details}}
{{/if}}

{{#if actionUrl}}
{{actionText}}: {{actionUrl}}
{{/if}}

{{#if timestamp}}
Notification sent: {{timestamp}}
{{/if}}

Best regards,
The {{appName}} Team

---
This notification was sent to {{email}}.
{{#if unsubscribeUrl}}
Manage notification preferences: {{unsubscribeUrl}}
{{/if}}',
    '["name", "email", "title", "message", "appName", "type"]'::jsonb,
    '["details", "actionUrl", "actionText", "timestamp", "priority", "unsubscribeUrl"]'::jsonb,
    true
);

-- EMAIL_VERIFICATION template
INSERT INTO platform.email_templates (
    template_type,
    name,
    subject_template,
    html_template,
    text_template,
    required_data,
    optional_data,
    is_active
) VALUES (
    'email_verification',
    'Email Verification',
    'Erősítsd meg az email címed - {{appName}}',
    '<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email megerősítés - {{appName}}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, ''Segoe UI'', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 2px solid #f0f0f0;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
        }
        .content {
            padding: 20px 0;
        }
        .cta-button {
            display: inline-block;
            background-color: #16a34a;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e5e5;
            font-size: 14px;
            color: #666;
            text-align: center;
        }
        .security-note {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 16px;
            margin: 20px 0;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">{{appName}}</div>
    </div>

    <div class="content">
        <h1>Email cím megerősítése</h1>

        <p>
            Szia {{name}}!
        </p>

        <p>
            Köszönjük, hogy regisztráltál a {{appName}} rendszerbe. Az email címed megerősítéséhez kattints az alábbi gombra:
        </p>

        <p>
            <a href="{{verificationUrl}}" class="cta-button">Email cím megerősítése</a>
        </p>

        <p>
            Ha a gomb nem működik, másold be ezt a linket a böngésződbe:
        </p>

        <p style="word-break: break-all; background-color: #f9fafb; padding: 10px; border-radius: 4px;">
            {{verificationUrl}}
        </p>

        <div class="security-note">
            <strong>Fontos tudnivalók:</strong>
            <ul>
                <li>Ez a link {{expirationTime}} múlva lejár</li>
                <li>Ha nem te regisztráltál, figyelmen kívül hagyhatod ezt az emailt</li>
                <li>Soha ne oszd meg ezt a linket senkivel</li>
            </ul>
        </div>

        <p>
            Üdvözlettel,<br>
            A {{appName}} csapata
        </p>
    </div>

    <div class="footer">
        <p>
            Ez az email a {{email}} címre lett küldve.
        </p>
    </div>
</body>
</html>',
    'Email cím megerősítése - {{appName}}

Szia {{name}}!

Köszönjük, hogy regisztráltál a {{appName}} rendszerbe. Az email címed megerősítéséhez látogasd meg ezt a linket:

{{verificationUrl}}

Fontos tudnivalók:
- Ez a link {{expirationTime}} múlva lejár
- Ha nem te regisztráltál, figyelmen kívül hagyhatod ezt az emailt
- Soha ne oszd meg ezt a linket senkivel

Üdvözlettel,
A {{appName}} csapata

---
Ez az email a {{email}} címre lett küldve.',
    '["name", "email", "verificationUrl", "appName"]'::jsonb,
    '["expirationTime"]'::jsonb,
    true
);

-- Ellenőrizzük, hogy minden template beszúrásra került
SELECT template_type, name, is_active FROM platform.email_templates ORDER BY template_type;