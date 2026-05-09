import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

const projectRoot = path.resolve(process.cwd());
const prismaDir = path.join(projectRoot, 'prisma');

console.log('Setting up ContractIQ database...');
console.log('Project root:', projectRoot);
console.log('Prisma directory:', prismaDir);

try {
  // Check if prisma schema exists
  if (!existsSync(path.join(prismaDir, 'schema.prisma'))) {
    console.error('Error: prisma/schema.prisma not found');
    process.exit(1);
  }

  // Generate Prisma client
  console.log('\n1. Generating Prisma client...');
  execSync('npx prisma generate', { 
    stdio: 'inherit',
    cwd: projectRoot 
  });

  // Run database push (creates tables without migration history)
  console.log('\n2. Pushing schema to database...');
  execSync('npx prisma db push --accept-data-loss', { 
    stdio: 'inherit',
    cwd: projectRoot 
  });

  console.log('\n✓ Database setup complete!');
  console.log('You can now start the development server with: npm run dev');

} catch (error) {
  console.error('\nError setting up database:', error.message);
  process.exit(1);
}
