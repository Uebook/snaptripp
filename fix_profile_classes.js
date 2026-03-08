const fs = require('fs');
const file = 'app/dashboard/profile/page.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

let newLines = [];
let inStyle = false;

for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('<style jsx>')) {
        inStyle = true;
        continue;
    }
    if (inStyle && lines[i].includes('</style>')) {
        inStyle = false;
        continue;
    }
    if (!inStyle) {
        newLines.push(lines[i]);
    }
}

let content = newLines.join('\n');

if (!content.includes('ProfilePage.module.css')) {
    content = content.replace("import React", "import styles from './ProfilePage.module.css'\nimport React");
}

content = content.replace(/className="([^"]+)"/g, (match, p1) => {
    const classes = p1.trim().split(/\s+/);
    if (classes.length === 1) {
        return `className={styles["${classes[0]}"]}`;
    }
    const joined = classes.map(c => "${styles[\"" + c + "\"]}").join(" ");
    return "className={`" + joined + "`}";
});

fs.writeFileSync(file, content);
