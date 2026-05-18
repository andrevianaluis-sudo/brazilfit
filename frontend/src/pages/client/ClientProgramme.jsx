import { useState, useEffect } from 'react';
import { ClipboardList, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { fmtDate } from '../../utils/dateUtils';

function CardSection({ title, dataStr, columns }) {
  let items = [];
  try { items = JSON.parse(dataStr || '[]'); } catch {}
  if (!items.length) return null;

  return (
    <div>
      <p className="text-[10px] font-bold text-brazil-green uppercase tracking-wide mb-2">{title}</p>
      <div className="overflow-x-auto -mx-1">
        <table className="w-full text-xs min-w-max">
          <thead>
            <tr className="border-b border-grey-100">
              {columns.map(c => <th key={c} className="text-left text-grey-100 font-normal pr-4 pb-1.5 whitespace-nowrap">{c}</th>)}
            </tr>
          </thead>
          <tbody>
            {items.map((row, i) => (
              <tr key={i} className="border-b border-grey-100">
                {columns.map(c => (
                  <td key={c} className="pr-4 py-1.5 text-grey-200 whitespace-nowrap">
                    {row[c.toLowerCase().replace(/[\s\/]/g,'_')] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProgrammeCard({ card }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="card-dark">
      <button className="w-full text-left" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-sm">{card.title}</p>
            <p className="text-xs text-grey-100 mt-0.5">{fmtDate(card.card_date)}</p>
          </div>
          <div className="p-1.5 text-grey-100">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/8 space-y-5">
          <CardSection title="Warm Up  Pulse Raiser" dataStr={card.warm_up_pulse}
            columns={['Equipment','Duration','Level','Resistance','Speed','RPE','Heart Rate']} />
          <CardSection title="Warm Up  Preparatory Stretches" dataStr={card.warm_up_stretches}
            columns={['Muscle Group','Position','Duration','Reps']} />
          <CardSection title="Cardiovascular Training" dataStr={card.cardio}
            columns={['Machine/Activity','Duration','System','Level','Resistance','Speed','RPE','HR']} />
          <CardSection title="Resistance Training" dataStr={card.resistance}
            columns={['Exercise','Equipment','Weight','System','Reps','Sets','Rest','Notes']} />
          <CardSection title="Cool Down  Cardiovascular" dataStr={card.cool_down_cv}
            columns={['Machine/Activity','Duration','System','Level','Speed','RPE','HR']} />
          <CardSection title="Post-Workout Stretches" dataStr={card.cool_down_stretches}
            columns={['Muscle Group','Position','Duration']} />

          {card.activities_away && (
            <div>
              <p className="text-[10px] font-bold text-brazil-green uppercase mb-1.5">Exercise Away from the Gym</p>
              <p className="text-sm text-grey-200 leading-relaxed">{card.activities_away}</p>
            </div>
          )}
          {card.session_notes && (
            <div>
              <p className="text-[10px] font-bold text-brazil-green uppercase mb-1.5">Session Notes</p>
              <p className="text-sm text-grey-200 leading-relaxed">{card.session_notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function ClientProgramme() {
  const { user } = useAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.clientId) return;
    api.get(`/onboarding/programme/${user.clientId}`)
      .then(r => setCards(r.data))
      .catch(() => toast.error('Failed to load programme'))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="px-4 py-4 animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black">My Programme</h1>
          <p className="text-xs text-grey-100">Cards created by your trainer</p>
        </div>
        <ClipboardList className="w-6 h-6 text-brazil-green" />
      </div>

      {loading ? (
        <div className="flex justify-center py-8"><div className="w-6 h-6 border-4 border-brazil-green border-t-transparent rounded-full animate-spin" /></div>
      ) : cards.length === 0 ? (
        <div className="text-center py-12">
          <ClipboardList className="w-12 h-12 text-grey-200 mx-auto mb-3" />
          <p className="text-grey-100 text-sm">No programme cards yet.</p>
          <p className="text-grey-200 text-xs mt-1">Your trainer will create your programme card and it will appear here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cards.map(card => <ProgrammeCard key={card.id} card={card} />)}
        </div>
      )}
    </div>
  );
}


