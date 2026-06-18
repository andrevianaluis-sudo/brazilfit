const fs = require('fs');

// 1. Fix PTLayout.jsx — remove ClipboardCheck from react-router-dom, add to lucide-react
let layout = fs.readFileSync('pages/pt/PTLayout.jsx', 'utf8');
layout = layout.replace(
  "import { ClipboardCheck, Outlet, useNavigate, useLocation } from 'react-router-dom';",
  "import { Outlet, useNavigate, useLocation } from 'react-router-dom';"
);
// add ClipboardCheck into the lucide-react import block
if (!layout.includes('ClipboardCheck')) {
  layout = layout.replace(
    "  BookOpen, Dumbbell, ChevronRight, Package, PlayCircle\n} from 'lucide-react';",
    "  BookOpen, Dumbbell, ChevronRight, Package, PlayCircle, ClipboardCheck\n} from 'lucide-react';"
  );
}
fs.writeFileSync('pages/pt/PTLayout.jsx', layout);
console.log('Fixed PTLayout imports');

// 2. Fix ExercisePickerModal.jsx — remove the stray extra )}
let modal = fs.readFileSync('components/ExercisePickerModal.jsx', 'utf8');
const bad = `            <span style={{ fontSize: 64 }}>{stretch ? '' : ''}</span>
          )}
          )}
        </div>`;
const good = `            <span style={{ fontSize: 64 }}>{stretch ? '' : ''}</span>
          )}
        </div>`;
if (modal.includes(bad)) {
  modal = modal.replace(bad, good);
  fs.writeFileSync('components/ExercisePickerModal.jsx', modal);
  console.log('Fixed stray bracket in ExercisePickerModal');
} else {
  console.log('ExercisePickerModal pattern not found');
}

console.log('Done');
