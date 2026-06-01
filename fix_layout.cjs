const fs = require("fs");
const files = ["Actualites.tsx", "AppelsOffres.tsx", "Documents.tsx", "Formulaires.tsx", "Medias.tsx", "PagesList.tsx", "Soumissions.tsx", "Parametres.tsx"];
for (const file of files) {
  const path = "src/admin/pages/" + file;
  if (!fs.existsSync(path)) continue;
  let content = fs.readFileSync(path, "utf8");
  let changed = false;
  
  if (content.includes("className=\"space-y-6\"")) {
    content = content.replace("className=\"space-y-6\"", "className=\"space-y-6 flex-1 flex flex-col\"");
    changed = true;
  }
  if (content.includes("className=\"tw-space-y-6\"")) {
    content = content.replace("className=\"tw-space-y-6\"", "className=\"tw-space-y-6 flex-1 flex flex-col\"");
    changed = true;
  }
  if (content.includes("className=\"py-12 text-center text-gray-500\"")) {
    content = content.replace("className=\"py-12 text-center text-gray-500\"", "className=\"py-12 text-center text-gray-500 flex-1 flex flex-col items-center justify-center\"");
    changed = true;
  }
  if (content.includes("className=\"tw-py-12 tw-text-center tw-text-gray-500\"")) {
    content = content.replace("className=\"tw-py-12 tw-text-center tw-text-gray-500\"", "className=\"tw-py-12 tw-text-center tw-text-gray-500 tw-flex-1 tw-flex tw-flex-col tw-items-center tw-justify-center\"");
    changed = true;
  }
  if (content.includes("className=\"bg-white rounded-xl border border-gray-200 overflow-hidden\"")) {
    content = content.replace("className=\"bg-white rounded-xl border border-gray-200 overflow-hidden\"", "className=\"bg-white rounded-xl border border-gray-200 overflow-hidden flex-1 flex flex-col\"");
    changed = true;
  }
  if (content.includes("className=\"bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm\"")) {
    content = content.replace("className=\"bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm\"", "className=\"bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm flex-1 flex flex-col\"");
    changed = true;
  }
  if (content.includes("className=\"tw-bg-white tw-rounded-xl tw-border tw-border-gray-200 tw-overflow-hidden\"")) {
    content = content.replace("className=\"tw-bg-white tw-rounded-xl tw-border tw-border-gray-200 tw-overflow-hidden\"", "className=\"tw-bg-white tw-rounded-xl tw-border tw-border-gray-200 tw-overflow-hidden tw-flex-1 tw-flex tw-flex-col\"");
    changed = true;
  }
  if (content.includes("className=\"space-y-6 max-w-3xl pb-12\"")) {
    content = content.replace("className=\"space-y-6 max-w-3xl pb-12\"", "className=\"space-y-6 max-w-3xl pb-12 flex-1 flex flex-col\"");
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(path, content);
    console.log("Updated", file);
  }
}

