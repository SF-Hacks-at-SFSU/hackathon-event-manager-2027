import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(scriptDirectory, '../.env') });

const schoolsFile = process.argv[2] || path.resolve(scriptDirectory, '../data/schools.txt');

const prisma = new PrismaClient();

try {
  const contents = await readFile(schoolsFile, 'utf8');
  const namesByNormalizedName = new Map();

  for (const line of contents.split(/\r?\n/)) {
    const name = line.replace(/^\uFEFF/, '').normalize('NFC').trim();
    if (name) namesByNormalizedName.set(name.toLocaleLowerCase(), name);
  }

  const existingSchools = await prisma.school.findMany({ select: { name: true } });
  const existingNames = new Set(
    existingSchools.map(({ name }) => name.normalize('NFC').trim().toLocaleLowerCase())
  );
  const schoolsToCreate = [...namesByNormalizedName.entries()]
    .filter(([normalizedName]) => !existingNames.has(normalizedName))
    .map(([, name]) => ({ name, countryCode: 'XX' }));

  const batchSize = 500;
  let inserted = 0;

  for (let index = 0; index < schoolsToCreate.length; index += batchSize) {
    const batch = schoolsToCreate.slice(index, index + batchSize);
    const result = await prisma.school.createMany({ data: batch });
    inserted += result.count;
    console.log(`Imported ${inserted}/${schoolsToCreate.length} new schools`);
  }

  console.log(
    `Finished: ${namesByNormalizedName.size} unique names in file, ${inserted} inserted, ${existingSchools.length} already in database.`
  );
} finally {
  await prisma.$disconnect();
}
