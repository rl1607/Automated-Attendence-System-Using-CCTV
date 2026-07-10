const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walkDir(filePath);
    } else if (filePath.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('http://localhost:5000')) {
        console.log(`Processing file: ${filePath}`);
        
        // Replace absolute URL
        content = content.replace(/['"]http:\/\/localhost:5000(.*?)['"]/g, '`${API_BASE_URL}$1`');
        
        // Inject import at the top if it's missing
        if (!content.includes('import { API_BASE_URL }')) {
          const lines = content.split('\n');
          let importIndex = lines.findIndex(line => line.startsWith('import '));
          if (importIndex === -1) importIndex = 0;
          lines.splice(importIndex, 0, `import { API_BASE_URL } from '../config';`);
          content = lines.join('\n');
        }
        
        fs.writeFileSync(filePath, content, 'utf8');
      }
    }
  });
}

walkDir(srcDir);
console.log('✔ All hardcoded localhost endpoints successfully updated to VITE_API_URL dynamic variables!');
