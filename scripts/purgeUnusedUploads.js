#!/usr/bin/env node
/*
  Purge unused user images from uploads/users by comparing against DB references.
  Usage:
    node scripts/purgeUnusedUploads.js --dry-run   # list files that would be deleted
    node scripts/purgeUnusedUploads.js             # actually delete
*/

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = require('../config/db');
const User = require('../models/userModel');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'users');

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  // Ensure uploads directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    console.log(`Uploads directory not found: ${UPLOADS_DIR}`);
    process.exit(0);
  }

  await connectDB();

  // Gather all profile image basenames referenced in DB
  const users = await User.find({}, { profileImage: 1 }).lean();
  const referenced = new Set();

  for (const user of users) {
    if (!user.profileImage) continue;
    try {
      // Accept either local path or full URL
      const basename = path.basename(user.profileImage);
      if (basename && basename !== user.profileImage) {
        referenced.add(basename);
      }
    } catch (_) {
      // Ignore malformed values
    }
  }

  // List files on disk
  const filesOnDisk = fs
    .readdirSync(UPLOADS_DIR)
    .filter((f) => fs.statSync(path.join(UPLOADS_DIR, f)).isFile());

  const orphans = filesOnDisk.filter((f) => !referenced.has(f));

  if (orphans.length === 0) {
    console.log('No orphan files found. Nothing to purge.');
    process.exit(0);
  }

  if (isDryRun) {
    console.log('Orphan files (would delete):');
    for (const f of orphans) {
      console.log(' -', f);
    }
    process.exit(0);
  }

  // Delete orphan files
  for (const f of orphans) {
    const full = path.join(UPLOADS_DIR, f);
    try {
      fs.unlinkSync(full);
      console.log('Deleted', f);
    } catch (err) {
      console.error('Failed to delete', f, err.message);
    }
  }

  process.exit(0);
}

main().catch((err) => {
  console.error('Purge failed:', err);
  process.exit(1);
});


