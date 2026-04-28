import { useState, useEffect } from "react";
import api from "../../services/api";
import { Icon } from "../layout/index";

export function AnnouncementBoard({ groupId, isAdmin }) {
  const [announcements, setAnnouncements] = useState([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      const { data } = await api.get(`/groups/${groupId}/announcements`);
      setAnnouncements(data.announcements);
    } catch (err) {
      console.error("Could not fetch announcements", err);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    const interval = setInterval(fetchAnnouncements, 15000);
    return () => clearInterval(interval);
  }, [groupId]);

  const post = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setBusy(true);
    try {
      await api.post(`/groups/${groupId}/announcements`, { message });
      setMessage("");
      fetchAnnouncements();
    } catch (err) {
      console.error("Could not post announcement", err);
    } finally { setBusy(false); }
  };

  return (
    <div className="bg-surface-container-low p-8 rounded-lg h-full flex flex-col">
      <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
        <Icon name="campaign" className="text-sm" /> Announcement Board
      </p>

      {isAdmin && (
        <form onSubmit={post} className="mb-8">
          <div className="flex gap-3">
            <input 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              placeholder="Post a message to the group..." 
              className="field-input text-sm flex-1"
            />
            <button type="submit" disabled={busy || !message.trim()} className="btn-primary p-3 aspect-square">
              <Icon name="send" />
            </button>
          </div>
        </form>
      )}

      <div className="space-y-6 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
        {announcements.length === 0 ? (
          <p className="text-sm text-on-surface-variant italic py-4">No announcements yet.</p>
        ) : (
          announcements.map((a) => (
            <div key={a._id} className="pb-6 border-b border-outline-variant/10 last:border-0">
              <p className="text-sm text-on-surface leading-relaxed mb-2">{a.message}</p>
              <p className="text-[10px] text-on-surface-variant/60 font-label uppercase tracking-widest">
                {new Date(a.createdAt).toLocaleDateString()} · {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
