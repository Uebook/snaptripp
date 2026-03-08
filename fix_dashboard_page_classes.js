const fs = require('fs');
const file = 'app/dashboard/page.tsx';
const lines = fs.readFileSync(file, 'utf8').split('\n');

let newLines = [];
let styleLines = [];
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
    if (inStyle) {
        styleLines.push(lines[i]);
    } else {
        newLines.push(lines[i]);
    }
}

fs.writeFileSync('app/dashboard/DashboardPage.module.css', styleLines.join('\n'));

let content = newLines.join('\n');

if (!content.includes('DashboardPage.module.css')) {
    content = content.replace("import React", "import styles from './DashboardPage.module.css'\nimport React");
    // If it doesn't have "import React"
    if (!content.includes("import styles from './DashboardPage.module.css'")) {
        content = "import styles from './DashboardPage.module.css'\n" + content;
    }
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
