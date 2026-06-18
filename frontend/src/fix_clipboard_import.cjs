const fs = require('fs');
let c = fs.readFileSync('pages/pt/PTLayout.jsx', 'utf8');

if (c.includes('ClipboardCheck') && !c.match(/ClipboardCheck[^]*from 'lucide-react'/)) {
  // ClipboardCheck is used but not in the lucide import - add it
  c = c.replace(
    "  BookOpen, Dumbbell, ChevronRight, Package, PlayCircle\n} from 'lucide-react';",
    "  BookOpen, Dumbbell, ChevronRight, Package, PlayCircle, ClipboardCheck\n} from 'lucide-react';"
  );
  fs.writeFileSync('pages/pt/PTLayout.jsx', c);
  console.log('Added ClipboardCheck to lucide-react import');
} else {
  console.log('Check manually - state unexpected');
}
