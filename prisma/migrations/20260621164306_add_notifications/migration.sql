-- CreateTable
CREATE TABLE "notification_config" (
    "id" SERIAL NOT NULL,
    "event" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "title_template" TEXT NOT NULL,
    "message_template" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_right" (
    "id" SERIAL NOT NULL,
    "config_id" INTEGER NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_right_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "config_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Info',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "reference_number" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "read_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notification_preference" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "config_id" INTEGER NOT NULL,
    "popup_enabled" BOOLEAN NOT NULL DEFAULT true,
    "bell_enabled" BOOLEAN NOT NULL DEFAULT true,
    "email_enabled" BOOLEAN NOT NULL DEFAULT false,
    "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT false,
    "muted" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_notification_preference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_config_event_key" ON "notification_config"("event");

-- CreateIndex
CREATE INDEX "notification_right_config_id_idx" ON "notification_right"("config_id");

-- CreateIndex
CREATE UNIQUE INDEX "notification_right_config_id_role_key" ON "notification_right"("config_id", "role");

-- CreateIndex
CREATE INDEX "notification_user_id_is_read_idx" ON "notification"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notification_config_id_idx" ON "notification"("config_id");

-- CreateIndex
CREATE INDEX "user_notification_preference_user_id_idx" ON "user_notification_preference"("user_id");

-- CreateIndex
CREATE INDEX "user_notification_preference_config_id_idx" ON "user_notification_preference"("config_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_notification_preference_user_id_config_id_key" ON "user_notification_preference"("user_id", "config_id");

-- AddForeignKey
ALTER TABLE "notification_right" ADD CONSTRAINT "notification_right_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "notification_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "notification_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preference" ADD CONSTRAINT "user_notification_preference_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notification_preference" ADD CONSTRAINT "user_notification_preference_config_id_fkey" FOREIGN KEY ("config_id") REFERENCES "notification_config"("id") ON DELETE CASCADE ON UPDATE CASCADE;
