const fs = require('fs');
const path = require('path');

const dir = '/root/snaptripp';
const files = ['.env', '.env.local', '.env.production', '.env.production.local', '.env.vercel.prod'];

console.log('--- Env files check in VPS ---');
files.forEach(f => {
  const filePath = path.join(dir, f);
  if (fs.existsSync(filePath)) {
    console.log(`\n=== Found: ${f} ===`);
    const content = fs.readFileSync(filePath, 'utf8');
    content.split('\n').forEach(line => {
      if (line.includes('KEY') || line.includes('URL') || line.includes('SECRET')) {
        console.log(line);
      }
    });
  } else {
    console.log(`=== Not Found: ${f} ===`);
  }
});
