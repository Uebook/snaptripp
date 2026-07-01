const fs = require('fs');
const file = '/root/supabase/docker/.env';

if (!fs.existsSync(file)) {
  console.error('Error: .env not found at:', file);
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

console.log('--- Key variables in .env ---');
lines.forEach(line => {
  if (line.includes('KEY') || line.includes('SECRET')) {
    console.log(line);
  }
});
