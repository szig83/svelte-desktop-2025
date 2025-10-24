CREATE TABLE "platform"."email_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"message_id" varchar(255),
	"recipient" varchar(255) NOT NULL,
	"subject" varchar(500) NOT NULL,
	"template_type" varchar(100),
	"status" varchar(50) NOT NULL,
	"error_message" text,
	"sent_at" timestamp with time zone DEFAULT now(),
	"delivered_at" timestamp with time zone,
	"opened_at" timestamp with time zone,
	"clicked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "platform"."email_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" varchar(100) NOT NULL,
	"name" varchar(255) NOT NULL,
	"subject_template" text NOT NULL,
	"html_template" text NOT NULL,
	"text_template" text NOT NULL,
	"required_data" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"optional_data" jsonb DEFAULT '[]'::jsonb,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "email_templates_type_unique" UNIQUE("type")
);
--> statement-breakpoint
CREATE INDEX "email_logs_recipient_idx" ON "platform"."email_logs" USING btree ("recipient");--> statement-breakpoint
CREATE INDEX "email_logs_status_idx" ON "platform"."email_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "email_logs_created_at_idx" ON "platform"."email_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "email_logs_message_id_idx" ON "platform"."email_logs" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "email_logs_recipient_status_idx" ON "platform"."email_logs" USING btree ("recipient","status");--> statement-breakpoint
CREATE INDEX "email_logs_status_created_at_idx" ON "platform"."email_logs" USING btree ("status","created_at");--> statement-breakpoint
CREATE INDEX "email_templates_type_idx" ON "platform"."email_templates" USING btree ("type");--> statement-breakpoint
CREATE INDEX "email_templates_is_active_idx" ON "platform"."email_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "email_templates_type_active_idx" ON "platform"."email_templates" USING btree ("type","is_active");