import fs from 'fs';
import path from 'path';

const srcDir = path.join(process.cwd(), 'src');

const replacements = [
  // Suivi de dossier
  { from: /Numéro de dossier CTD/g, to: "Numéro de dossier" },
  { from: /Suivre un dossier CTD/g, to: "Suivre un dossier" },
  { from: /Suivez l'état d'avancement de votre dossier CTD/g, to: "Suivez l'état d'avancement de votre dossier" },
  // Header / Footer
  { from: / — République du Tchad/g, to: "" },
  { from: / - République du Tchad/g, to: "" },
  { from: /N'Djamena, République du Tchad/g, to: "N'Djamena, Tchad" },
  { from: /Transparence · Efficacité · Équité/g, to: "" },
  { from: /Transparence, efficacité et équité au cour de chaque opération\./g, to: "" },
  // Breadcrumbs et Eyebrows
  { from: /eyebrow="[^"]*"/g, to: "" },
  { from: /crumbs=\{\[.*?\]\}/g, to: "" },
];

function processFiles(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory() && !fullPath.includes('admin')) {
      processFiles(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let original = content;
      
      for (const r of replacements) {
        content = content.replace(r.from, r.to);
      }

      if (content !== original) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${file}`);
      }
    }
  }
}

processFiles(srcDir);

// Zoom 75% in styles.css
const cssPath = path.join(srcDir, 'styles.css');
let css = fs.readFileSync(cssPath, 'utf8');
if (!css.includes('zoom: 0.75;')) {
  css = css.replace(':root {', ':root {\n  zoom: 0.75;');
  fs.writeFileSync(cssPath, css);
  console.log('Updated styles.css with zoom: 0.75');
}
