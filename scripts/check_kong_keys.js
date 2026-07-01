const fs = require('fs');
const file = '/root/supabase/docker/volumes/api/kong.yml';

if (!fs.existsSync(file)) {
  console.error('Error: kong.yml not found at:', file);
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');

// Find the consumers section and print it
const index = content.indexOf('consumers:');
if (index !== -1) {
  console.log('--- Consumers section in kong.yml ---');
  console.log(content.substring(index));
} else {
  console.log('Could not find "consumers:" section in kong.yml');
}
