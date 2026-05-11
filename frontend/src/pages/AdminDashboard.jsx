import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, LogOut, Users, Clock, CheckCircle2, XCircle, ChevronDown,
  Search, RefreshCw, Download, Eye, Filter, AlertCircle, Loader2, FileText,
  Mail, Phone, Link as LinkIcon, Calendar, Award, BookOpen, Plus, Pencil,
  Trash2, CalendarDays, Building2, GraduationCap, ClipboardList, LayoutDashboard
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import useAdminStore from "../store/adminStore";

const STATUS_CONFIG = {
  Pending:             { color:"bg-slate-100 text-slate-700 border-slate-200",    dot:"bg-slate-400" },
  "Under Review":      { color:"bg-purple-100 text-purple-700 border-purple-200", dot:"bg-purple-500" },
  "Interview Scheduled":{ color:"bg-amber-100 text-amber-700 border-amber-200",  dot:"bg-amber-500" },
  Accepted:            { color:"bg-emerald-100 text-emerald-700 border-emerald-200", dot:"bg-emerald-500" },
  Rejected:            { color:"bg-red-100 text-red-700 border-red-200",          dot:"bg-red-500" },
};
const STATUSES = Object.keys(STATUS_CONFIG);

/* ── helpers ── */
const api = (adminToken) => axios.create({
  baseURL:"http://localhost:8000/api/admin",
  headers:{ Authorization:`Bearer ${adminToken}` }
});

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"}) : "N/A";

/* ════════════════════════════════════════
   APPLICATIONS TAB
════════════════════════════════════════ */
const ApplicationsTab = ({ adminToken }) => {
  const [applications, setApplications] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterClub, setFilterClub] = useState("All");
  const [selectedApp, setSelectedApp] = useState(null);
  const [error, setError] = useState(null);
  const client = api(adminToken);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [a, c] = await Promise.all([client.get("/applications"), client.get("/clubs")]);
      setApplications(a.data); setClubs(c.data);
    } catch { setError("Failed to load applications."); }
    finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const r = await client.put(`/applications/${id}/status`, { status });
      setApplications(p => p.map(a => a.id === id ? { ...a, ...r.data } : a));
      if (selectedApp?.id === id) setSelectedApp(p => ({ ...p, ...r.data }));
    } catch { alert("Failed to update status."); }
    finally { setUpdatingId(null); }
  };

  const filtered = applications.filter(a => {
    const q = search.toLowerCase();
    return (filterStatus === "All" || a.status === filterStatus)
      && (filterClub === "All" || a.club_name === filterClub)
      && (!search || [a.student_name,a.student_email,a.club_name,a.position].some(v => v?.toLowerCase().includes(q)));
  });

  const stats = { total:applications.length, pending:applications.filter(a=>a.status==="Pending").length,
    review:applications.filter(a=>a.status==="Under Review").length,
    accepted:applications.filter(a=>a.status==="Accepted").length,
    rejected:applications.filter(a=>a.status==="Rejected").length };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          {label:"Total",value:stats.total,bg:"bg-primary",text:"text-white"},
          {label:"Pending",value:stats.pending,bg:"bg-slate-100",text:"text-slate-700"},
          {label:"Under Review",value:stats.review,bg:"bg-purple-50",text:"text-purple-700"},
          {label:"Accepted",value:stats.accepted,bg:"bg-emerald-50",text:"text-emerald-700"},
          {label:"Rejected",value:stats.rejected,bg:"bg-red-50",text:"text-red-700"},
        ].map(s => (
          <div key={s.label} className={`${s.bg} ${s.text} rounded-2xl p-5 shadow-sm border border-black/5`}>
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="text-xs font-bold uppercase tracking-wider opacity-60 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-grow min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students, clubs..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            <option value="All">All Statuses</option>
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <select value={filterClub} onChange={e=>setFilterClub(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            <option value="All">All Clubs</option>
            {clubs.map(c=><option key={c.id}>{c.name}</option>)}
          </select>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700">
            <RefreshCw size={14} className={loading?"animate-spin":""} /> Refresh
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-primary">Applications <span className="text-slate-400 font-normal text-sm">({filtered.length})</span></h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={28}/>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400"><FileText size={36} className="mb-2 opacity-30"/><p>No applications found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["#","Student","Club","Role","Applied","Status","Update",""].map(h=>(
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((app,idx) => {
                  const sc = STATUS_CONFIG[app.status]||STATUS_CONFIG.Pending;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{app.id}</td>
                      <td className="px-5 py-4">
                        <p className="font-bold text-primary">{app.student_name||"N/A"}</p>
                        <p className="text-slate-400 text-xs">{app.student_email}</p>
                        <p className="text-slate-400 text-xs">{app.student_enrollment}</p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-700">{app.club_name}</td>
                      <td className="px-5 py-4 text-slate-600">{app.position}</td>
                      <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">{fmtDate(app.applied_at)}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase border ${sc.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}/>{app.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {updatingId===app.id ? <Loader2 className="animate-spin text-primary" size={16}/> : (
                          <div className="relative">
                            <select value={app.status} onChange={e=>updateStatus(app.id,e.target.value)}
                              className="appearance-none border border-slate-200 rounded-xl px-3 py-2 pr-7 text-xs font-semibold focus:outline-none bg-white cursor-pointer">
                              {STATUSES.map(s=><option key={s}>{s}</option>)}
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={11}/>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={()=>setSelectedApp(app)} className="flex items-center gap-1 text-xs font-bold text-primary hover:text-secondary">
                          <Eye size={13}/>View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setSelectedApp(null)}>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              onClick={e=>e.stopPropagation()}>
              <div className="bg-primary p-8 rounded-t-3xl text-white flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-1">{selectedApp.student_name}</h2>
                  <p className="text-white/70 text-sm">{selectedApp.student_email}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-[11px] font-extrabold uppercase border ${STATUS_CONFIG[selectedApp.status]?.color}`}>
                  {selectedApp.status}
                </span>
              </div>
              <div className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {label:"Enrollment",value:selectedApp.student_enrollment||"N/A"},
                    {label:"Branch",value:selectedApp.student_branch||"N/A"},
                    {label:"Club",value:selectedApp.club_name},
                    {label:"Position",value:selectedApp.position},
                    {label:"Contact",value:selectedApp.contact_number||"N/A"},
                    {label:"Availability",value:selectedApp.availability||"N/A"},
                  ].map(({label,value})=>(
                    <div key={label} className="bg-slate-50 p-4 rounded-2xl">
                      <p className="text-xs text-slate-400 mb-1">{label}</p>
                      <p className="font-bold text-primary text-sm">{value}</p>
                    </div>
                  ))}
                </div>
                {selectedApp.motivation && <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-xs text-slate-400 mb-1">Motivation</p><p className="text-sm text-slate-600">{selectedApp.motivation}</p></div>}
                {selectedApp.skills && <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-xs text-slate-400 mb-1">Skills</p><p className="text-sm text-slate-600">{selectedApp.skills}</p></div>}
                <div className="flex flex-wrap gap-3">
                  {selectedApp.portfolio_link && <a href={selectedApp.portfolio_link} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-100"><LinkIcon size={13}/>Portfolio</a>}
                  {selectedApp.resume_url && <a href={`http://localhost:8000${selectedApp.resume_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold border border-emerald-100"><Download size={13}/>Resume</a>}
                </div>
                <div className="border-t border-slate-100 pt-5">
                  <p className="text-sm font-bold text-slate-700 mb-3">Update Status</p>
                  <div className="flex flex-wrap gap-2">
                    {STATUSES.map(s => {
                      const sc=STATUS_CONFIG[s]; const isActive=selectedApp.status===s;
                      return <button key={s} disabled={updatingId===selectedApp.id} onClick={()=>updateStatus(selectedApp.id,s)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold uppercase border transition-all ${isActive?`${sc.color} scale-105`:"bg-slate-50 text-slate-500 border-slate-200 hover:scale-105"}`}>{s}</button>;
                    })}
                  </div>
                </div>
                <button onClick={()=>setSelectedApp(null)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ════════════════════════════════════════
   EVENTS TAB
════════════════════════════════════════ */
const EventsTab = ({ adminToken }) => {
  const [events, setEvents] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title:"", description:"", location:"", category:"", status:"Upcoming", event_date:"", registration_deadline:"", organizer_club_id:"", max_participants:"" });
  const client = api(adminToken);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ev,cl] = await Promise.all([client.get("/events"), client.get("/clubs")]);
      setEvents(ev.data); setClubs(cl.data);
    } catch { } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({ title:"",description:"",location:"",category:"",status:"Upcoming",event_date:"",registration_deadline:"",organizer_club_id:"",max_participants:"" }); setShowForm(true); };
  const openEdit = (ev) => { setEditing(ev); setForm({ title:ev.title||"",description:ev.description||"",location:ev.location||"",category:ev.category||"",status:ev.status||"Upcoming",event_date:ev.event_date?ev.event_date.slice(0,16):"",registration_deadline:ev.registration_deadline?ev.registration_deadline.slice(0,16):"",organizer_club_id:ev.organizer_club?.id||"",max_participants:ev.max_participants||"" }); setShowForm(true); };

  const save = async () => {
    const payload = { ...form, organizer_club_id: form.organizer_club_id||null, max_participants: form.max_participants?parseInt(form.max_participants):null };
    try {
      if (editing) { await client.put(`/events/${editing.id}`, payload); }
      else { await client.post("/events", payload); }
      setShowForm(false); fetchData();
    } catch { alert("Failed to save event."); }
  };

  const remove = async (id) => { if (!confirm("Delete this event?")) return; await client.delete(`/events/${id}`); fetchData(); };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Manage Events</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all">
          <Plus size={16}/> Add Event
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={28}/>Loading...</div> : (
        <div className="grid gap-4">
          {events.length===0 && <div className="text-center py-20 text-slate-400"><CalendarDays size={40} className="mx-auto mb-3 opacity-30"/><p>No events yet. Create one!</p></div>}
          {events.map(ev => (
            <div key={ev.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-primary">{ev.title}</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                    ev.status==="Upcoming"?"bg-blue-100 text-blue-700 border-blue-200":
                    ev.status==="Ongoing"?"bg-emerald-100 text-emerald-700 border-emerald-200":
                    "bg-slate-100 text-slate-600 border-slate-200"}`}>{ev.status}</span>
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                  {ev.location && <span className="flex items-center gap-1"><Building2 size={11}/>{ev.location}</span>}
                  {ev.event_date && <span className="flex items-center gap-1"><Calendar size={11}/>{fmtDate(ev.event_date)}</span>}
                  {ev.organizer_club && <span className="flex items-center gap-1"><Users size={11}/>{ev.organizer_club.name}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>openEdit(ev)} className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-xl transition-all"><Pencil size={15}/></button>
                <button onClick={()=>remove(ev.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={15}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setShowForm(false)}>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
              onClick={e=>e.stopPropagation()}>
              <div className="bg-primary p-6 rounded-t-3xl text-white">
                <h2 className="text-xl font-bold">{editing?"Edit Event":"Create Event"}</h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  {label:"Title",key:"title",type:"text"},
                  {label:"Location",key:"location",type:"text"},
                  {label:"Category",key:"category",type:"text"},
                  {label:"Max Participants",key:"max_participants",type:"number"},
                  {label:"Event Date",key:"event_date",type:"datetime-local"},
                  {label:"Registration Deadline",key:"registration_deadline",type:"datetime-local"},
                ].map(({label,key,type})=>(
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                    <input type={type} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Status</label>
                  <select value={form.status} onChange={e=>setForm(p=>({...p,status:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    {["Upcoming","Ongoing","Past"].map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Organizer Club</label>
                  <select value={form.organizer_club_id} onChange={e=>setForm(p=>({...p,organizer_club_id:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    <option value="">None</option>
                    {clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                  <textarea rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setShowForm(false)} className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl">Cancel</button>
                  <button onClick={save} className="flex-1 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl">{editing?"Save Changes":"Create Event"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ════════════════════════════════════════
   DIRECTORY TAB
════════════════════════════════════════ */
const DirectoryTab = ({ adminToken }) => {
  const [entries, setEntries] = useState([]);
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", designation:"", role:"", phone:"", email:"", club_id:"" });
  const client = api(adminToken);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [d,c] = await Promise.all([client.get("/directory"), client.get("/clubs")]);
      setEntries(d.data); setClubs(c.data);
    } catch { } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({name:"",designation:"",role:"",phone:"",email:"",club_id:""}); setShowForm(true); };
  const openEdit = (e) => { setEditing(e); setForm({name:e.name,designation:e.designation||"",role:e.role||"",phone:e.phone||"",email:e.email||"",club_id:e.club?.id||""}); setShowForm(true); };
  const save = async () => {
    const payload = {...form, club_id: form.club_id||null};
    try {
      if (editing) await client.put(`/directory/${editing.id}`, payload);
      else await client.post("/directory", payload);
      setShowForm(false); fetchData();
    } catch { alert("Failed to save entry."); }
  };
  const remove = async (id) => { if (!confirm("Delete?")) return; await client.delete(`/directory/${id}`); fetchData(); };

  const getInitials = (n) => n.split(" ").map(w=>w[0]).join("").slice(0,2).toUpperCase();
  const GRADS = ["from-violet-600 to-purple-800","from-blue-600 to-indigo-800","from-emerald-500 to-teal-700","from-orange-500 to-red-600","from-pink-500 to-rose-700"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Manage Directory</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90">
          <Plus size={16}/> Add Contact
        </button>
      </div>

      {loading ? <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={28}/>Loading...</div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.length===0 && <div className="col-span-3 text-center py-20 text-slate-400"><Building2 size={40} className="mx-auto mb-3 opacity-30"/><p>No directory entries. Add one!</p></div>}
          {entries.map((entry,i) => (
            <div key={entry.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${GRADS[i%GRADS.length]} flex items-center justify-center text-white text-sm font-black flex-shrink-0`}>
                {getInitials(entry.name)}
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-bold text-primary truncate">{entry.name}</p>
                <p className="text-xs text-slate-500 truncate">{entry.designation}</p>
                {entry.club && <p className="text-xs text-secondary font-semibold mt-1 truncate">{entry.club.name}</p>}
                {entry.phone && <p className="text-xs text-slate-400 flex items-center gap-1 mt-1"><Phone size={10}/>{entry.phone}</p>}
                {entry.email && <p className="text-xs text-slate-400 flex items-center gap-1 truncate"><Mail size={10}/>{entry.email}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={()=>openEdit(entry)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg"><Pencil size={13}/></button>
                <button onClick={()=>remove(entry.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setShowForm(false)}>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
              onClick={e=>e.stopPropagation()}>
              <div className="bg-primary p-6 rounded-t-3xl text-white">
                <h2 className="text-xl font-bold">{editing?"Edit Contact":"Add Contact"}</h2>
              </div>
              <div className="p-6 space-y-4">
                {[{label:"Full Name",key:"name"},{label:"Designation",key:"designation"},{label:"Role",key:"role"},{label:"Phone",key:"phone"},{label:"Email",key:"email"}].map(({label,key})=>(
                  <div key={key}>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                    <input type="text" value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/>
                  </div>
                ))}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Club</label>
                  <select value={form.club_id} onChange={e=>setForm(p=>({...p,club_id:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                    <option value="">None / University</option>
                    {clubs.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setShowForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl">Cancel</button>
                  <button onClick={save} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">{editing?"Save":"Add"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ════════════════════════════════════════
   STUDENTS TAB
════════════════════════════════════════ */
const StudentsTab = ({ adminToken }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ email:"", password:"", full_name:"", enrollment_no:"", branch:"", semester:"", contact:"" });
  const client = api(adminToken);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const r = await client.get(`/students${search?`?search=${search}`:""}`);
      setStudents(r.data);
    } catch { } finally { setLoading(false); }
  }, [adminToken, search]);

  useEffect(() => { const t = setTimeout(fetchData, 300); return ()=>clearTimeout(t); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({email:"",password:"",full_name:"",enrollment_no:"",branch:"",semester:"",contact:""}); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({email:s.email,password:"",full_name:s.full_name||"",enrollment_no:s.enrollment_no||"",branch:s.branch||"",semester:s.semester||"",contact:s.contact||""}); setShowForm(true); };

  const save = async () => {
    try {
      if (editing) { const {email,password,...rest}=form; await client.put(`/students/${editing.id}`, rest); }
      else { await client.post("/students", form); }
      setShowForm(false); fetchData();
    } catch (e) { alert(e.response?.data?.detail||"Failed to save."); }
  };
  const remove = async (id) => { if (!confirm("Delete student?")) return; await client.delete(`/students/${id}`); fetchData(); };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Manage Students</h2>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students..."
              className="pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-56"/>
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90">
            <Plus size={16}/> Add Student
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={28}/>Loading...</div>
        ) : students.length === 0 ? (
          <div className="text-center py-20 text-slate-400"><GraduationCap size={40} className="mx-auto mb-3 opacity-30"/><p>No students found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["Name","Enrollment","Branch","Semester","Contact","Status","Actions"].map(h=>(
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <p className="font-bold text-primary">{s.full_name||"N/A"}</p>
                      <p className="text-xs text-slate-400">{s.email}</p>
                    </td>
                    <td className="px-5 py-4 text-slate-600 font-mono text-xs">{s.enrollment_no||"—"}</td>
                    <td className="px-5 py-4 text-slate-600">{s.branch||"—"}</td>
                    <td className="px-5 py-4 text-slate-600">{s.semester||"—"}</td>
                    <td className="px-5 py-4 text-slate-600">{s.contact||"—"}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${s.is_active?"bg-emerald-100 text-emerald-700 border-emerald-200":"bg-red-100 text-red-700 border-red-200"}`}>
                        {s.is_active?"Active":"Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-2">
                        <button onClick={()=>openEdit(s)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg"><Pencil size={13}/></button>
                        <button onClick={()=>remove(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={13}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setShowForm(false)}>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={e=>e.stopPropagation()}>
              <div className="bg-primary p-6 rounded-t-3xl text-white"><h2 className="text-xl font-bold">{editing?"Edit Student":"Add Student"}</h2></div>
              <div className="p-6 space-y-4">
                {!editing && <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>}
                {!editing && <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Password *</label>
                  <input type="password" value={form.password} onChange={e=>setForm(p=>({...p,password:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>}
                {[{label:"Full Name",key:"full_name"},{label:"Enrollment No",key:"enrollment_no"},{label:"Branch",key:"branch"},{label:"Semester",key:"semester"},{label:"Contact",key:"contact"}].map(({label,key})=>(
                  <div key={key}><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                  <input type="text" value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setShowForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl">Cancel</button>
                  <button onClick={save} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">{editing?"Save":"Add"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ════════════════════════════════════════
   CLUBS TAB (with recruitment window)
════════════════════════════════════════ */
const ClubsTab = ({ adminToken }) => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name:"", slug:"", category:"", tagline:"", description:"", logo_url:"", is_accepting:true });
  const [recForm, setRecForm] = useState({ recruitment_open:false, start_date:"", end_date:"" });
  const [recClub, setRecClub] = useState(null);
  const client = api(adminToken);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const r = await client.get("/clubs"); setClubs(r.data); }
    catch { } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (c) => { setEditing(c); setForm({name:c.name,slug:c.slug,category:c.category||"",tagline:c.tagline||"",description:c.description||"",logo_url:c.logo_url||"",is_accepting:c.is_accepting}); setShowForm(true); };
  const openCreate = () => { setEditing(null); setForm({name:"",slug:"",category:"",tagline:"",description:"",logo_url:"",is_accepting:true}); setShowForm(true); };
  const openRec = (c) => { setRecClub(c); setRecForm({recruitment_open:c.recruitment_open||false,start_date:c.recruitment_start?c.recruitment_start.slice(0,16):"",end_date:c.recruitment_end?c.recruitment_end.slice(0,16):""}); };

  const save = async () => {
    try {
      if (editing) await client.put(`/clubs/${editing.id}`, form);
      else await client.post("/clubs", form);
      setShowForm(false); fetchData();
    } catch(e) { alert(e.response?.data?.detail||"Failed to save."); }
  };
  const remove = async (id) => { if (!confirm("Delete club?")) return; await client.delete(`/clubs/${id}`); fetchData(); };
  const saveRec = async () => {
    try {
      await client.put(`/recruitment/${recClub.id}`, recForm);
      setRecClub(null); fetchData();
    } catch { alert("Failed to save recruitment."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Manage Clubs</h2>
        <button onClick={openCreate} className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90"><Plus size={16}/>Add Club</button>
      </div>

      {loading ? <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={28}/>Loading...</div> : (
        <div className="grid gap-4">
          {clubs.map(c => (
            <div key={c.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-100">
                {c.logo_url ? <img src={c.logo_url} alt={c.name} className="w-full h-full object-contain p-1"/> : <Building2 size={20} className="text-slate-400"/>}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-primary">{c.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{c.category}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${c.is_accepting?"bg-emerald-100 text-emerald-700 border-emerald-200":"bg-red-100 text-red-700 border-red-200"}`}>
                    {c.is_accepting?"Open":"Closed"}
                  </span>
                  {c.recruitment_open && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200">Recruiting</span>}
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.tagline||c.description||"No description"}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>openRec(c)} className="px-3 py-1.5 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold border border-amber-200">Recruitment</button>
                <button onClick={()=>openEdit(c)} className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl"><Pencil size={14}/></button>
                <button onClick={()=>remove(c.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 size={14}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Club Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setShowForm(false)}>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
              onClick={e=>e.stopPropagation()}>
              <div className="bg-primary p-6 rounded-t-3xl text-white"><h2 className="text-xl font-bold">{editing?"Edit Club":"Add Club"}</h2></div>
              <div className="p-6 space-y-4">
                {[{label:"Club Name",key:"name"},{label:"Slug (URL)",key:"slug"},{label:"Category",key:"category"},{label:"Tagline",key:"tagline"},{label:"Logo URL",key:"logo_url"}].map(({label,key})=>(
                  <div key={key}><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                  <input type="text" value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
                ))}
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/></div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_accepting} onChange={e=>setForm(p=>({...p,is_accepting:e.target.checked}))} className="w-4 h-4 rounded"/>
                  <span className="text-sm font-semibold text-slate-700">Accepting Applications</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setShowForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl">Cancel</button>
                  <button onClick={save} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">{editing?"Save":"Create"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recruitment Form */}
      <AnimatePresence>
        {recClub && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setRecClub(null)}>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
              onClick={e=>e.stopPropagation()}>
              <div className="bg-primary p-6 rounded-t-3xl text-white">
                <h2 className="text-xl font-bold">Recruitment Window</h2>
                <p className="text-white/70 text-sm mt-1">{recClub.name}</p>
              </div>
              <div className="p-6 space-y-5">
                <label className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl cursor-pointer">
                  <input type="checkbox" checked={recForm.recruitment_open} onChange={e=>setRecForm(p=>({...p,recruitment_open:e.target.checked}))} className="w-5 h-5 rounded"/>
                  <div>
                    <p className="font-bold text-primary">Recruitment Open</p>
                    <p className="text-xs text-slate-400">Enable/disable the Apply button on club page</p>
                  </div>
                </label>
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Start Date</label>
                <input type="datetime-local" value={recForm.start_date} onChange={e=>setRecForm(p=>({...p,start_date:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"/></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">End Date</label>
                <input type="datetime-local" value={recForm.end_date} onChange={e=>setRecForm(p=>({...p,end_date:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"/></div>
                <div className="flex gap-3">
                  <button onClick={()=>setRecClub(null)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl">Cancel</button>
                  <button onClick={saveRec} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">Save</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


/* ════════════════════════════════════════
   MAIN ADMIN DASHBOARD
════════════════════════════════════════ */
const TABS = [
  { id:"applications", label:"Applications", icon:<ClipboardList size={18}/> },
  { id:"events",       label:"Events",       icon:<CalendarDays size={18}/> },
  { id:"directory",    label:"Directory",    icon:<Building2 size={18}/> },
  { id:"students",     label:"Students",     icon:<GraduationCap size={18}/> },
  { id:"clubs",        label:"Clubs",        icon:<BookOpen size={18}/> },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { admin, adminToken, adminLogout } = useAdminStore();
  const [activeTab, setActiveTab] = useState("applications");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { adminLogout(); navigate("/admin/login"); };

  return (
    <div className="min-h-screen bg-slate-50 font-sora flex flex-col">
      {/* Topbar */}
      <header className="bg-primary text-white shadow-xl sticky top-0 z-50 h-16 flex items-center">
        <div className="max-w-[1600px] mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-secondary rounded-xl flex items-center justify-center">
              <ShieldCheck className="text-primary" size={18}/>
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">JECRC Admin Console</h1>
              <p className="text-white/50 text-[11px]">Club Management Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/70 text-sm hidden md:block">
              Welcome, <strong className="text-secondary">{admin?.full_name||"Admin"}</strong>
            </span>
            <button onClick={handleLogout}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-sm font-semibold border border-white/20">
              <LogOut size={15}/> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-slate-100 shadow-sm sticky top-16 h-[calc(100vh-4rem)] flex-shrink-0 hidden md:flex flex-col py-6 px-3">
          {TABS.map(tab => (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl mb-1 w-full text-left font-semibold text-sm transition-all ${
                activeTab===tab.id
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "text-slate-600 hover:bg-slate-50 hover:text-primary"
              }`}>
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        {/* Mobile Tab Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-40 flex">
          {TABS.map(tab => (
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              className={`flex-1 flex flex-col items-center py-2.5 text-[10px] font-bold uppercase tracking-wider transition-all ${
                activeTab===tab.id ? "text-primary" : "text-slate-400"
              }`}>
              {tab.icon}
              <span className="mt-1">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 pb-20 md:pb-8 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.2}}>
              {activeTab==="applications" && <ApplicationsTab adminToken={adminToken}/>}
              {activeTab==="events"       && <EventsTab adminToken={adminToken}/>}
              {activeTab==="directory"    && <DirectoryTab adminToken={adminToken}/>}
              {activeTab==="students"     && <StudentsTab adminToken={adminToken}/>}
              {activeTab==="clubs"        && <ClubsTab adminToken={adminToken}/>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
