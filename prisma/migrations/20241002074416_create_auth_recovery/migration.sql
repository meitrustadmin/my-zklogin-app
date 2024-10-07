-- CreateTable
CREATE TABLE "auth_recovery" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "iss" TEXT NOT NULL,
    "aud" TEXT NOT NULL,
    "key_claim_name" TEXT NOT NULL,
    "key_claim_value" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "multisig_address" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "auth_recovery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_recovery_identifier_status_key" ON "auth_recovery"("identifier", "status");
