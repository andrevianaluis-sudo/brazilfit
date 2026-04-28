import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, Users, TrendingUp, Copy } from "lucide-react";

export default function PTAdvancedBlockManagement() {
  const [blocks, setBlocks] = useState([
    { id: 1, name: "Strength Foundation", duration: "6 weeks", clients: 8, startDate: "2024-04-01", focus: "Building foundational strength", exercises: 12, completed: 4, status: "ACTIVE" },
    { id: 2, name: "Summer Body Prep", duration: "8 weeks", clients: 12, startDate: "2024-05-01", focus: "Fat loss and muscle definition", exercises: 18, completed: 0, status: "DRAFT" },
    { id: 3, name: "Recovery and Mobility", duration: "4 weeks", clients: 5, startDate: "2024-02-01", focus: "Injury prevention and mobility", exercises: 8, completed: 4, status: "COMPLETED" },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", duration: "", focus: "" });

  const handleAddBlock = () => {
    if (!formData.name) return;
    setBlocks([...blocks, { id: Math.max(...blocks.map(b => b.id), 0) + 1, ...formData, clients: 0, exercises: 0, completed: 0, status: "DRAFT", startDate: new Date().toISOString().split("T")[0] }]);
    setFormData({ name: "", duration: "", focus: "" });
    setShowForm(false);
  };

  const activeBlocks = blocks.filter(b => b.status === "ACTIVE").length;
  const totalClients = blocks.reduce((sum, b) => sum + b.clients, 0);
  const totalExercises = blocks.reduce((sum, b) => sum + b.exercises, 0);

  return (
    <div className="px-4 py-4 pb-24 animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase">Training Blocks</h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest mt-1">Manage your periodized programs</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="p-2 rounded-lg bg-brazil-green hover:bg-brazil-green-dark text-white transition">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-dark-grey-100 rounded-[12px] p-3">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Active</p>
          <p className="text-3xl font-black text-brazil-green">{activeBlocks}</p>
        </div>
        <div className="bg-dark-grey-100 rounded-[12px] p-3">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Total Clients</p>
          <p className="text-3xl font-black text-white">{totalClients}</p>
        </div>
        <div className="bg-dark-grey-100 rounded-[12px] p-3">
          <p className="text-gray-400 text-xs font-bold uppercase mb-1">Exercises</p>
          <p className="text-3xl font-black text-orange-400">{totalExercises}</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-dark-grey-100 rounded-[12px] p-4 space-y-3">
          <input type="text" placeholder="Block name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-dark-grey-200 rounded-[8px] px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brazil-green" />
          <div className="flex gap-2">
            <button onClick={handleAddBlock} className="flex-1 p-2 rounded-[8px] bg-brazil-green hover:bg-brazil-green-dark text-white text-xs font-bold uppercase transition">Create Block</button>
            <button onClick={() => setShowForm(false)} className="flex-1 p-2 rounded-[8px] bg-dark-grey-200 hover:bg-dark-grey-100 text-white text-xs font-bold uppercase transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {blocks.map((block) => (
          <div key={block.id} className="bg-dark-grey-100 rounded-[12px] p-4">
            <h3 className="text-white font-bold text-sm mb-1">{block.name}</h3>
            <p className="text-gray-400 text-xs mb-2">{block.focus}</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-dark-grey-200 rounded-[8px] px-2 py-1"><p className="text-gray-400 text-xs mb-0.5">Duration</p><p className="text-white font-bold text-sm">{block.duration}</p></div>
              <div className="bg-dark-grey-200 rounded-[8px] px-2 py-1"><p className="text-gray-400 text-xs mb-0.5">Clients</p><p className="text-white font-bold text-sm">{block.clients}</p></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}