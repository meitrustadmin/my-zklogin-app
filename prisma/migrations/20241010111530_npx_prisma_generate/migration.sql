/*
  Warnings:

  - Added the required column `email` to the `auth_recovery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `auth_recovery` table without a default value. This is not possible if the table is not empty.
  - Added the required column `multisig_address` to the `passkey_credentials` table without a default value. This is not possible if the table is not empty.
  - Added the required column `multisig_address` to the `passkey_users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `passkey_users` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "passkey_users_displayname_key";

-- AlterTable
ALTER TABLE "auth_recovery" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "passkey_credentials" ADD COLUMN     "multisig_address" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "passkey_users" ADD COLUMN     "multisig_address" TEXT NOT NULL,
ADD COLUMN     "status" TEXT NOT NULL;
