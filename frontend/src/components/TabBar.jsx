export default function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div className="flex items-center justify-center gap-8 px-5 py-4 border-b border-grey-100">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`pb-3 transition-colors relative ${
            activeTab === tab
              ? 'text-black font-bold'
              : 'text-grey-200 font-bold'
          }`}
        >
          {tab}
          {activeTab === tab && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-black" />
          )}
        </button>
      ))}
    </div>
  );
}

