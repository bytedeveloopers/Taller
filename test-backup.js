/**
 * Test script para verificar que el módulo de respaldos funciona correctamente
 */

import { BackupService } from "../src/services/BackupService";

async function testBackupModule() {
  console.log("🧪 Testing Backup Module...");

  try {
    // Test 1: Get backup configuration
    console.log("1. Testing getBackupConfig...");
    const config = await BackupService.getBackupConfig();
    console.log("✅ Backup config loaded:", Object.keys(config));

    // Test 2: Save configuration
    console.log("2. Testing saveBackupConfig...");
    await BackupService.saveBackupConfig(config);
    console.log("✅ Backup config saved successfully");

    console.log("🎉 All backup module tests passed!");
  } catch (error) {
    console.error("❌ Backup module test failed:", error);
  }
}

// Run tests
testBackupModule();
