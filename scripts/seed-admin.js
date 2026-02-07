/**
 * Script tạo 1 user admin mặc định (chỉ dùng cho dev).
 * Chạy: node scripts/seed-admin.js
 * Cần có file .env với MONGODB_URI.
 */
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const ENV_PATH = path.join(__dirname, '..', '.env');

function loadEnv() {
  if (!fs.existsSync(ENV_PATH)) {
    console.error('Khong tim thay file .env. Tao file .env tu .env.example va dien MONGODB_URI.');
    process.exit(1);
  }
  const content = fs.readFileSync(ENV_PATH, 'utf8');
  const env = {};
  content.split('\n').forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  });
  return env;
}

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

async function main() {
  const env = loadEnv();
  const uri = env.MONGODB_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error('Can MONGODB_URI trong .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  const User = mongoose.connection.collection('users');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    const isAdmin = existing.role === 'admin';
    if (isAdmin) {
      console.log('User admin da ton tai:', ADMIN_EMAIL);
      console.log('Ban co the dang nhap voi email nay. Neu quen mat khau, xoa user nay trong MongoDB roi chay lai script.');
    } else {
      await User.updateOne({ email: ADMIN_EMAIL }, { $set: { role: 'admin', password: await bcrypt.hash(ADMIN_PASSWORD, 10) } });
      console.log('Da cap nhat user thanh admin:', ADMIN_EMAIL, '| mat khau:', ADMIN_PASSWORD);
    }
  } else {
    const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await User.insertOne({
      email: ADMIN_EMAIL,
      password: hashed,
      role: 'admin',
      fullName: 'Admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('Da tao admin:', ADMIN_EMAIL, '| mat khau:', ADMIN_PASSWORD);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
