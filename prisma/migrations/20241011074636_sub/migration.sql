-- CreateTable
CREATE TABLE "apple_user" (
    "id" TEXT NOT NULL,
    "iss" TEXT NOT NULL,
    "aud" TEXT NOT NULL,
    "sub" TEXT NOT NULL,
    "name" TEXT,
    "first_name" TEXT,
    "given_name" TEXT,
    "email" TEXT,
    "create_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "apple_user_pkey" PRIMARY KEY ("id")
);

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
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "auth_recovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkey_users" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "displayname" TEXT NOT NULL,
    "multisig_address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "passkey_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passkey_credentials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "multisig_address" TEXT NOT NULL,
    "name" TEXT,
    "externalId" TEXT NOT NULL,
    "publicKey" BYTEA NOT NULL,
    "signCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passkey_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "apple_user_iss_aud_sub_key" ON "apple_user"("iss", "aud", "sub");

-- CreateIndex
CREATE UNIQUE INDEX "auth_recovery_identifier_status_key" ON "auth_recovery"("identifier", "status");

-- CreateIndex
CREATE UNIQUE INDEX "passkey_users_username_key" ON "passkey_users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "passkey_credentials_externalId_key" ON "passkey_credentials"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "passkey_credentials_publicKey_key" ON "passkey_credentials"("publicKey");

-- CreateIndex
CREATE INDEX "passkey_credentials_externalId_idx" ON "passkey_credentials"("externalId");

-- AddForeignKey
ALTER TABLE "passkey_credentials" ADD CONSTRAINT "passkey_credentials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "passkey_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
