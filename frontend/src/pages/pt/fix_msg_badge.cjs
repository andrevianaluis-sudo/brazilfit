const fs = require('fs');
let c = fs.readFileSync('PTLayout.jsx', 'utf8');
let count = 0;

// Fix 1: Add unreadMessages state and fetch
const old1 = `  const fetchNotifications = async () => {
    try {
      const res = await api.get('/pt/notifications');
      setUnreadCount(res.data.unreadCount || 0);
      setNotifications(res.data.notifications || []);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 5000);
    return () => clearInterval(pollRef.current);
  }, []);`;

const new1 = `  const [unreadMessages, setUnreadMessages] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/pt/notifications');
      setUnreadCount(res.data.unreadCount || 0);
      setNotifications(res.data.notifications || []);
    } catch {}
    try {
      const res2 = await api.get('/pt/messages');
      setUnreadMessages(res2.data?.length || 0);
    } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    pollRef.current = setInterval(fetchNotifications, 30000);
    return () => clearInterval(pollRef.current);
  }, []);`;

if (c.includes(old1)) { c = c.replace(old1, new1); count++; console.log('Fix 1 applied'); }
else console.log('Fix 1 NOT FOUND');

// Fix 2: Update bell badge to include messages
const old2 = `                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}`;

const new2 = `                {(unreadCount + unreadMessages) > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#ef4444', color: '#fff', borderRadius: '50%', width: '16px', height: '16px', fontSize: '0.6rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(unreadCount + unreadMessages) > 9 ? '9+' : (unreadCount + unreadMessages)}
                  </span>
                )}`;

if (c.includes(old2)) { c = c.replace(old2, new2); count++; console.log('Fix 2 applied'); }
else console.log('Fix 2 NOT FOUND');

fs.writeFileSync('PTLayout.jsx', c);
console.log('Done -', count, 'fixes');
