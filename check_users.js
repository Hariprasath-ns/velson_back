import { PrismaClient } from './src/generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const connectionString = process.env.DOCKER_DATABASE_URL;
const adapter = new PrismaPg(new pg.Pool({ connectionString }));
const prisma = new PrismaClient({ adapter });

import bcrypt from 'bcryptjs';

async function check() {
  const users = await prisma.userCredential.findMany();
  for (const u of users) {
    let plain = '';
    if (u.username === 'admin@admin.com') plain = 'Admin@123';
    if (u.username === 'staff@staff.com') plain = 'Staff@123';
    if (u.username === 'user@user.com') plain = 'User@123';
    const match = await bcrypt.compare(plain, u.password);
    const oldMatch = await bcrypt.compare('password123', u.password);
    console.log(`${u.username}: new_match=${match} old_match=${oldMatch} failedAttempts=${u.failedAttempts}`);
  }
  process.exit(0);
}
check();
