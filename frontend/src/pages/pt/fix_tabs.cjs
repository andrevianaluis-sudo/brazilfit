const fs = require('fs');
let c = fs.readFileSync('PTClientProfile.jsx', 'utf8');

const old = `      <div className="flex border-b border-white/10 overflow-x-auto hide-scrollbar sticky top-0 bg-black z-10">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={\`relative px-4 py-3 text-sm font-medium capitalize whitespace-nowrap transition-all border-b-2 \${activeTab === tab ? 'border-brazil-green text-brazil-green' : 'border-transparent text-grey-200 hover:text-black'}\`}`;

const newCode = `      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.1)",overflowX:"auto",WebkitOverflowScrolling:"touch",scrollbarWidth:"none",msOverflowStyle:"none",position:"sticky",top:0,backgroundColor:"#000",zIndex:10}}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{flexShrink:0,padding:"10px 12px",fontSize:"0.72rem",fontWeight:500,textTransform:"capitalize",whiteSpace:"nowrap",borderBottom:activeTab===tab?"2px solid #4CAF50":"2px solid transparent",color:activeTab===tab?"#4CAF50":"#888",background:"none",border:"none",borderBottom:activeTab===tab?"2px solid #4CAF50":"2px solid transparent",cursor:"pointer"}}`;

if (c.includes(old)) {
  c = c.replace(old, newCode);
  fs.writeFileSync('PTClientProfile.jsx', c);
  console.log('Done');
} else {
  console.log('NOT FOUND');
}
