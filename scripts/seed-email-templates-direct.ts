import { builtInTemplates } from '../src/lib/server/email/templates/built-in';
import { EmailTemplateType } from '../src/lib/server/email/types';
import db from '../src/lib/server/database/index';
import { emailTemplates } from '../src/lib/server/database/schemas/platform/email/email_templates';
import { eq } from 'drizzle-orm';

const templateNames: Record<EmailTemplateType, string> = {
	[EmailTemplateType.WELCOME]: 'Welcome Email',
	[EmailTemplateType.PASSWORD_RESET]: 'Password Reset Email',
	[EmailTemplateType.NOTIFICATION]: 'Notification Email',
	[EmailTemplateType.EMAIL_VERIFICATION]: 'Email Verification'
};

async function seedEmailTemplates() {
	console.log('🌱 Starting email template seeding (direct database insert)...\n');

	let successCount = 0;
	let skipCount = 0;
	let errorCount = 0;

	for (const [type, template] of Object.entries(builtInTemplates)) {
		const templateType = type as EmailTemplateType;
		const templateName = templateNames[templateType];

		try {
			const existing = await db
				.select()
				.from(emailTemplates)
				.where(eq(emailTemplates.type, templateType))
				.limit(1);

			if (existing.length > 0) {
				console.log(`⏭️  Skipping ${templateName} (${templateType}) - already exists`);
				skipCount++;
				continue;
			}

			await db.insert(emailTemplates).values({
				type: templateType,
				name: templateName,
				subjectTemplate: template.subject,
				htmlTemplate: template.htmlTemplate,
				textTemplate: template.textTemplate,
				requiredData: template.requiredData,
				optionalData: template.optionalData,
				isActive: true
			});

			console.log(`✅ Created ${templateName} (${templateType})`);
			successCount++;
		} catch (error) {
			console.error(`❌ Failed to create ${templateName} (${templateType}):`, error);
			errorCount++;
		}
	}

	console.log('\n📊 Seeding Summary:');
	console.log(`   ✅ Created: ${successCount}`);
	console.log(`   ⏭️  Skipped: ${skipCount}`);
	console.log(`   ❌ Errors: ${errorCount}`);
	console.log(`   📝 Total: ${successCount + skipCount + errorCount}`);

	if (errorCount > 0) {
		process.exit(1);
	}
}

seedEmailTemplates()
	.then(() => {
		console.log('\n✨ Email template seeding completed successfully!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n💥 Email template seeding failed:', error);
		process.exit(1);
	});
