/**
 * Migration Script: Migrate API Keys to Hashed Format
 *
 * This script migrates existing plaintext API keys to the new hashed format
 * Run this BEFORE applying the schema migration
 */

import { PrismaClient } from '@prisma/client';
import { createHash } from 'crypto';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function hashApiKey(apiKey: string): Promise<string> {
  return bcrypt.hash(apiKey, 10);
}

function createLookupHash(apiKey: string): string {
  return createHash('sha256').update(apiKey).digest('hex');
}

function getApiKeyPreview(apiKey: string): string {
  return apiKey.substring(0, 10) + '...';
}

async function migrateApiKeys() {
  console.log('🔄 Starting API key migration...\n');

  try {
    // Fetch all existing API keys
    const apiKeys = await prisma.$queryRaw<Array<{ id: string; key: string }>>`
      SELECT id, key FROM "ApiKey"
    `;

    console.log(`Found ${apiKeys.length} API keys to migrate\n`);

    if (apiKeys.length === 0) {
      console.log('✅ No API keys to migrate');
      return;
    }

    // Temporarily add the new columns
    console.log('📝 Adding new columns...');
    await prisma.$executeRaw`
      ALTER TABLE "ApiKey"
      ADD COLUMN IF NOT EXISTS "keyHash" TEXT,
      ADD COLUMN IF NOT EXISTS "lookupHash" TEXT,
      ADD COLUMN IF NOT EXISTS "preview" TEXT
    `;

    console.log('✅ Columns added\n');

    // Migrate each key
    console.log('🔐 Migrating API keys...');
    for (const apiKey of apiKeys) {
      const keyHash = await hashApiKey(apiKey.key);
      const lookupHash = createLookupHash(apiKey.key);
      const preview = getApiKeyPreview(apiKey.key);

      await prisma.$executeRaw`
        UPDATE "ApiKey"
        SET
          "keyHash" = ${keyHash},
          "lookupHash" = ${lookupHash},
          "preview" = ${preview}
        WHERE id = ${apiKey.id}
      `;

      console.log(`  ✓ Migrated key: ${preview}`);
    }

    console.log('\n✅ All API keys migrated successfully!');
    console.log('\n⚠️  IMPORTANT: Save these API keys somewhere safe!');
    console.log('After the schema migration, the original keys will be deleted.\n');

    // Display the keys one last time
    console.log('📋 Current API Keys (SAVE THESE NOW):');
    console.log('==========================================');
    for (const apiKey of apiKeys) {
      const preview = getApiKeyPreview(apiKey.key);
      console.log(`\n${preview}`);
      console.log(`Full Key: ${apiKey.key}`);
    }
    console.log('\n==========================================\n');

    console.log('✅ Migration complete!');
    console.log('\nNext steps:');
    console.log('1. Save the API keys above');
    console.log('2. Run: npx prisma db push --accept-data-loss');
    console.log('   This will remove the old "key" column');
    console.log('3. Users will continue using the same API keys\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateApiKeys()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
