const fs = require('fs');
const path = require('path');

const srcBase = 'C:/Users/asenadja/Documents/visionary-blueprint/src';
const destBase = path.join(__dirname, 'src/admin');

const dirsToCopy = [
  { src: 'components/ui', dest: 'components/ui' },
  { src: 'components/admin', dest: 'components/admin' },
  { src: 'pages/admin', dest: 'pages' },
  { src: 'hooks', dest: 'hooks' }
];

function processContent(content) {
  let newContent = content;
  // Replace imports
  newContent = newContent.replace(/@\/components\/ui/g, '@admin/components/ui');
  newContent = newContent.replace(/@\/components\/admin/g, '@admin/components/admin');
  newContent = newContent.replace(/@\/pages\/admin/g, '@admin/pages');
  newContent = newContent.replace(/@\/hooks/g, '@admin/hooks');
  newContent = newContent.replace(/@\/lib\/api/g, '@admin/lib/api');
  newContent = newContent.replace(/@\/lib\/utils/g, '@admin/lib/utils');
  newContent = newContent.replace(/@\/contexts/g, '@admin/contexts');
  newContent = newContent.replace(/@\/assets\/logo-chad\.png/g, '/logo-chad.png');
  return newContent;
}

function copyDir(srcRel, destRel) {
  const srcDir = path.join(srcBase, srcRel);
  const destDir = path.join(destBase, destRel);
  
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const items = fs.readdirSync(srcDir);
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);
    
    if (fs.statSync(srcPath).isDirectory()) {
      // recursive if needed, but for now we only have flat dirs or maybe 1 level deep
      copyDir(path.join(srcRel, item), path.join(destRel, item));
    } else if (item.endsWith('.ts') || item.endsWith('.tsx')) {
      const content = fs.readFileSync(srcPath, 'utf8');
      const newContent = processContent(content);
      fs.writeFileSync(destPath, newContent);
      console.log(`Copied and processed: ${destPath}`);
    }
  }
}

dirsToCopy.forEach(dir => copyDir(dir.src, dir.dest));

// Also copy the utils.ts if it exists in the new path, but we already created it. 
// However, the original utils.ts had `clsx` and `twMerge`. Let's copy it as well.
const srcUtils = path.join(srcBase, 'lib/utils.ts');
const destUtils = path.join(destBase, 'lib/utils.ts');
if (fs.existsSync(srcUtils)) {
  fs.mkdirSync(path.dirname(destUtils), { recursive: true });
  const content = fs.readFileSync(srcUtils, 'utf8');
  fs.writeFileSync(destUtils, processContent(content));
  console.log(`Copied and processed: ${destUtils}`);
}

// Copy logo to public
const srcLogo = path.join(srcBase, 'assets/logo-chad.png');
const destLogo = path.join(__dirname, 'public/logo-chad.png');
if (fs.existsSync(srcLogo)) {
  fs.mkdirSync(path.dirname(destLogo), { recursive: true });
  fs.copyFileSync(srcLogo, destLogo);
  console.log(`Copied logo to public`);
}
