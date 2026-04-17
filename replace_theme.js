const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src');

const replacements = {
  '#1db954': '#3b82f6', // Accent Blue (Spotify green replacement)
  'bg-black': 'bg-[#050a15]',   // Very Dark Navy Background
  'from-black': 'from-[#050a15]',
  'to-black': 'to-[#050a15]',
  'border-black': 'border-[#050a15]',
  'text-black': 'text-[#050a15]',
  'bg-black/20': 'bg-[#050a15]/20',
  'bg-black/95': 'bg-[#050a15]/95',
  '#121212': '#0b162c', // Slightly lighter dark navy
  '#181818': '#101d36', // Card Background
  '#1e1e1e': '#152542', 
  '#282828': '#1e3357', // Hover/Border
  '#2a2a2a': '#1e3357', // Alternate Hover
  '#3a3a3a': '#2a4470', // Light Hover
  '#3e3e3e': '#2a4470', // Alternate Light Hover
  '#333333': '#1e3357', 
  '#333': '#1e3357',
  '#444444': '#2a4470',
  '#444': '#2a4470'
};

function processDir(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      
      // We will do a generic replacement, but carefully for the hexes.
      // E.g. bg-black -> bg-[#050a15], #1db954 -> #3b82f6
      let newContent = content;
      for (const [key, value] of Object.entries(replacements)) {
        if (newContent.includes(key)) {
          newContent = newContent.split(key).join(value);
          changed = true;
        }
      }
      
      if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir(dir);
