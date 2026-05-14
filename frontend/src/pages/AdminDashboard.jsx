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
  baseURL:"http://localhost:8000/api/admin/",
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
  const [activeSection, setActiveSection] = useState("Pending");
  const [filterClub, setFilterClub] = useState("All");
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkStatus, setBulkStatus] = useState("Interview Scheduled");
  const [bulkLoading, setBulkLoading] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [error, setError] = useState(null);
  const client = api(adminToken);

  const fetchData = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [a, c] = await Promise.all([client.get("applications"), client.get("clubs")]);
      setApplications(a.data); setClubs(c.data);
    } catch { setError("Failed to load applications."); }
    finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      const r = await client.put(`applications/${id}/status`, { status });
      setApplications(p => p.map(a => a.id === id ? { ...a, ...r.data } : a));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      if (selectedApp?.id === id) setSelectedApp(p => ({ ...p, ...r.data }));
    } catch { alert("Failed to update status."); }
    finally { setUpdatingId(null); }
  };

  const sectionStatuses = ["Pending", "Accepted", "Rejected", "Interview Scheduled"];

  const filtered = applications.filter(a => {
    const q = search.toLowerCase();
    return (a.status === activeSection)
      && (filterClub === "All" || a.club_name === filterClub)
      && (!search || [a.student_name,a.student_email,a.club_name,a.position].some(v => v?.toLowerCase().includes(q)));
  });

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => filtered.some((item) => item.id === id)));
  }, [activeSection, search, filterClub, applications]);

  const stats = {
    Pending: applications.filter(a=>a.status==="Pending").length,
    Accepted: applications.filter(a=>a.status==="Accepted").length,
    Rejected: applications.filter(a=>a.status==="Rejected").length,
    "Interview Scheduled": applications.filter(a=>a.status==="Interview Scheduled").length,
  };

  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(filtered.map((app) => app.id));
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]);
  };

  const bulkUpdateStatus = async () => {
    if (selectedIds.length === 0) {
      alert("Select at least one application.");
      return;
    }
    setBulkLoading(true);
    try {
      await client.put("applications/bulk-status", {
        application_ids: selectedIds,
        status: bulkStatus,
      });
      setSelectedIds([]);
      fetchData();
    } catch (e) {
      alert(e.response?.data?.detail || "Failed to apply bulk status update.");
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sectionStatuses.map((status) => (
          <button
            key={status}
            onClick={() => setActiveSection(status)}
            className={`rounded-2xl p-5 shadow-sm border text-left transition-all ${
              activeSection === status
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-white text-slate-700 border-slate-200 hover:border-primary/30"
            }`}
          >
            <p className="text-3xl font-extrabold">{stats[status]}</p>
            <p className="text-xs font-bold uppercase tracking-wider opacity-70 mt-1">{status}</p>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap gap-3 items-center mb-3">
          <div className="relative flex-grow min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students, clubs..."
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <select value={filterClub} onChange={e=>setFilterClub(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            <option value="All">All Clubs</option>
            {clubs.map(c=><option key={c.id}>{c.name}</option>)}
          </select>
          <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold text-slate-700">
            <RefreshCw size={14} className={loading?"animate-spin":""} /> Refresh
          </button>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <select value={bulkStatus} onChange={e=>setBulkStatus(e.target.value)}
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            {STATUSES.map(s=><option key={s}>{s}</option>)}
          </select>
          <button
            onClick={bulkUpdateStatus}
            disabled={bulkLoading || selectedIds.length === 0}
            className="px-4 py-2.5 rounded-xl text-sm font-bold bg-primary text-white disabled:opacity-50"
          >
            {bulkLoading ? "Applying..." : `Apply To Selected (${selectedIds.length})`}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-bold text-primary">{activeSection} Applications <span className="text-slate-400 font-normal text-sm">({filtered.length})</span></h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin mr-2" size={28}/>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400"><FileText size={36} className="mb-2 opacity-30"/><p>No applications found</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>{["", "#","Student","Club","Role","Applied","Status","Update",""].map(h=>(
                  <th key={h} className="px-5 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((app,idx) => {
                  const sc = STATUS_CONFIG[app.status]||STATUS_CONFIG.Pending;
                  return (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-5 py-4">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelectOne(app.id)}
                          className="w-4 h-4"
                        />
                      </td>
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
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
              <label className="text-xs font-semibold text-slate-600 inline-flex items-center gap-2">
                <input type="checkbox" checked={allSelected} onChange={toggleSelectAll} className="w-4 h-4" />
                Select all rows in this section
              </label>
            </div>
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
  const [form, setForm] = useState({ title:"", description:"", location:"", category:"", status:"Upcoming", date:"", registration_deadline:"", organizer_club_id:"", banner:"", registration_link:"" });
  const client = api(adminToken);
  const evClient = axios.create({ 
    baseURL: "http://localhost:8000/api/events", 
    headers: { Authorization: `Bearer ${adminToken}` } 
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [ev,cl] = await Promise.all([evClient.get("/"), client.get("clubs")]);
      setEvents(ev.data); setClubs(cl.data);
    } catch { } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({ title:"",description:"",location:"",category:"",status:"Upcoming",date:"",registration_deadline:"",organizer_club_id:"",banner:"",registration_link:"" }); setShowForm(true); };
  const openEdit = (ev) => { setEditing(ev); setForm({ title:ev.title||"",description:ev.description||"",location:ev.location||"",category:ev.category||"",status:ev.status||"Upcoming",date:ev.date?ev.date.slice(0,16):"",registration_deadline:ev.registration_deadline?ev.registration_deadline.slice(0,16):"",organizer_club_id:ev.organizer_club_id||"",banner:ev.banner||"",registration_link:ev.registration_link||"" }); setShowForm(true); };

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const r = await evClient.post("/upload-banner", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      console.log("Banner uploaded:", r.data.banner_url);
      setForm(p => ({ ...p, banner: r.data.banner_url }));
    } catch (err) { 
      console.error("Banner upload failed:", err);
      const detail = err.response?.data?.detail;
      const msg = typeof detail === "string" ? detail : "Check file type (jpg/png/webp) and size (<= 5MB).";
      alert(`Failed to upload banner: ${msg}`); 
    }
  };

  const save = async () => {
    // Clean payload: empty strings to null for optional fields
    const payload = { 
      ...form, 
      organizer_club_id: form.organizer_club_id ? parseInt(form.organizer_club_id) : null,
      date: form.date || null,
      registration_deadline: form.registration_deadline || null,
      registration_link: form.registration_link?.trim() || null
    };

    if (!payload.title || !payload.date) {
      alert("Title and Event Date are required.");
      return;
    }

    try {
      if (editing) { await evClient.put(`/${editing.id}`, payload); }
      else { await evClient.post("/", payload); }
      setShowForm(false); fetchData();
    } catch (err) { 
        console.error("Save event failed:", err.response?.data || err.message);
        const detail = err.response?.data?.detail;
        const msg = typeof detail === 'string' ? detail : (Array.isArray(detail) ? detail[0]?.msg : "Check console for details");
        alert(`Failed to save event: ${msg}`); 
    }
  };

  const remove = async (id) => { if (!confirm("Delete this event?")) return; await evClient.delete(`/${id}`); fetchData(); };

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
                  {ev.date && <span className="flex items-center gap-1"><Calendar size={11}/>{fmtDate(ev.date)}</span>}
                  {ev.club_name && <span className="flex items-center gap-1"><Users size={11}/>{ev.club_name}</span>}
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
                  {label:"Event Date",key:"date",type:"datetime-local"},
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
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Google Form Link</label>
                  <input
                    type="url"
                    placeholder="https://forms.gle/..."
                    value={form.registration_link}
                    onChange={e=>setForm(p=>({...p,registration_link:e.target.value}))}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Banner Image</label>
                  <div className="flex items-center gap-4">
                    {form.banner && <img src={form.banner.startsWith('http') ? form.banner : `http://localhost:8000${form.banner}`} className="w-16 h-16 rounded-xl object-cover border border-slate-200" alt="Banner" />}
                    <input type="file" onChange={handleBannerUpload} className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"/>
                  </div>
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
      const [directoryResult, clubsResult] = await Promise.allSettled([
        client.get("/directory"),
        client.get("/clubs"),
      ]);

      if (directoryResult.status === "fulfilled") {
        setEntries(directoryResult.value.data);
      } else {
        setEntries([]);
        console.error("Failed to load directory entries:", directoryResult.reason);
      }

      if (clubsResult.status === "fulfilled") {
        setClubs(clubsResult.value.data);
      } else {
        setClubs([]);
        console.error("Failed to load clubs for directory form:", clubsResult.reason);
      }
    } catch (err) {
      console.error("Unexpected directory data fetch error:", err);
    } finally { setLoading(false); }
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
                {entry.role && <p className="text-xs text-slate-500 truncate">Role: {entry.role}</p>}
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
  const [branchFilter, setBranchFilter] = useState("All");
  const [semesterFilter, setSemesterFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [generatedCredentials, setGeneratedCredentials] = useState(null);
  const [form, setForm] = useState({ email:"", full_name:"", enrollment_no:"", branch:"", semester:"", contact:"", is_active:true });
  const client = api(adminToken);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (branchFilter !== "All") params.append("branch", branchFilter);
      if (semesterFilter !== "All") params.append("semester", semesterFilter);
      if (statusFilter !== "All") params.append("is_active", statusFilter === "Active" ? "true" : "false");
      const query = params.toString();
      const r = await client.get(`/students${query ? `?${query}` : ""}`);
      setStudents(r.data);
    } catch { } finally { setLoading(false); }
  }, [adminToken, search, branchFilter, semesterFilter, statusFilter]);

  useEffect(() => { const t = setTimeout(fetchData, 300); return ()=>clearTimeout(t); }, [fetchData]);

  const openCreate = () => { setEditing(null); setForm({email:"",full_name:"",enrollment_no:"",branch:"",semester:"",contact:"",is_active:true}); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({email:s.email,full_name:s.full_name||"",enrollment_no:s.enrollment_no||"",branch:s.branch||"",semester:s.semester||"",contact:s.contact||"",is_active:s.is_active}); setShowForm(true); };

  const save = async () => {
    try {
      if (editing) {
        await client.put(`students/${editing.id}`, form);
      } else {
        const response = await client.post("students", form);
        setGeneratedCredentials(response.data);
      }
      setShowForm(false); fetchData();
    } catch (e) { alert(e.response?.data?.detail||"Failed to save."); }
  };
  const remove = async (id) => { if (!confirm("Delete student?")) return; await client.delete(`students/${id}`); fetchData(); };

  const uniqueBranches = ["All", ...new Set(students.map((student) => student.branch).filter(Boolean))];
  const uniqueSemesters = ["All", ...new Set(students.map((student) => student.semester).filter(Boolean))];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <h2 className="text-xl font-bold text-primary">Manage Students</h2>
        <div className="flex gap-3">
          <select value={branchFilter} onChange={e=>setBranchFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            {uniqueBranches.map((branch) => <option key={branch} value={branch}>{branch === "All" ? "All Branches" : branch}</option>)}
          </select>
          <select value={semesterFilter} onChange={e=>setSemesterFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            {uniqueSemesters.map((semester) => <option key={semester} value={semester}>{semester === "All" ? "All Semesters" : semester}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none">
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
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
                        <button onClick={()=>setSelectedStudent(s)} className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-lg"><Eye size={13}/></button>
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
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Email *</label>
                  <input type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
                {[{label:"Full Name",key:"full_name"},{label:"Enrollment No",key:"enrollment_no"},{label:"Branch",key:"branch"},{label:"Semester",key:"semester"},{label:"Contact",key:"contact"}].map(({label,key})=>(
                  <div key={key}><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                  <input type="text" value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
                ))}
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={form.is_active} onChange={e=>setForm(p=>({...p,is_active:e.target.checked}))} className="w-4 h-4 rounded"/>
                  <span className="text-sm font-semibold text-slate-700">Active Student Account</span>
                </label>
                <div className="flex gap-3 pt-2">
                  <button onClick={()=>setShowForm(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-2xl">Cancel</button>
                  <button onClick={save} className="flex-1 py-3 bg-primary text-white font-bold rounded-2xl">{editing?"Save":"Add"}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedStudent && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setSelectedStudent(null)}>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg"
              onClick={e=>e.stopPropagation()}>
              <div className="bg-primary p-6 rounded-t-3xl text-white">
                <h2 className="text-xl font-bold">Student Details</h2>
              </div>
              <div className="p-6 grid grid-cols-2 gap-3">
                {[
                  {label:"Name", value:selectedStudent.full_name || "N/A"},
                  {label:"Email", value:selectedStudent.email},
                  {label:"Enrollment", value:selectedStudent.enrollment_no || "N/A"},
                  {label:"Branch", value:selectedStudent.branch || "N/A"},
                  {label:"Semester", value:selectedStudent.semester || "N/A"},
                  {label:"Contact", value:selectedStudent.contact || "N/A"},
                  {label:"Status", value:selectedStudent.is_active ? "Active" : "Inactive"},
                ].map((item) => (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                    <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-slate-700 text-sm break-words">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <button onClick={()=>setSelectedStudent(null)} className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {generatedCredentials && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={()=>setGeneratedCredentials(null)}>
            <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.9}}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md"
              onClick={e=>e.stopPropagation()}>
              <div className="bg-primary p-6 rounded-t-3xl text-white">
                <h2 className="text-xl font-bold">Generated Credentials</h2>
                <p className="text-white/70 text-sm mt-1">Shown once for admin handover.</p>
              </div>
              <div className="p-6 space-y-3">
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Username</p><p className="font-bold text-slate-700">{generatedCredentials.generated_username}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Login Identifier</p><p className="font-bold text-slate-700">{generatedCredentials.login_identifier}</p></div>
                <div className="bg-slate-50 rounded-xl p-3"><p className="text-xs text-slate-400">Default Password</p><p className="font-bold text-slate-700">{generatedCredentials.generated_password}</p></div>
                <button onClick={()=>setGeneratedCredentials(null)} className="w-full py-3 bg-primary text-white font-bold rounded-2xl">Done</button>
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
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    category: "",
    tagline: "",
    description: "",
    logo_url: "",
    is_accepting: true,
    projects: [{ title: "", date: "", description: "" }],
    leadership: [{ name: "", role: "", email: "" }],
  });
  const client = api(adminToken);
  const resolveLogoSrc = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    if (url.startsWith("/uploads")) return `http://localhost:8000${url}`;
    return url;
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try { const r = await client.get("clubs"); setClubs(r.data); }
    catch { } finally { setLoading(false); }
  }, [adminToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (c) => {
    setEditing(c);
    setForm({
      name: c.name || "",
      slug: c.slug || "",
      category: c.category || "",
      tagline: c.tagline || "",
      description: c.description || "",
      logo_url: c.logo_url || "",
      is_accepting: c.is_accepting ?? true,
      projects: c.projects?.length ? c.projects.map((p) => ({ title: p.title || "", date: p.date || "", description: p.description || "" })) : [{ title: "", date: "", description: "" }],
      leadership: c.leadership?.length ? c.leadership.map((l) => ({ name: l.name || "", role: l.role || "", email: l.email || "" })) : [{ name: "", role: "", email: "" }],
    });
    setShowForm(true);
  };
  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      slug: "",
      category: "",
      tagline: "",
      description: "",
      logo_url: "",
      is_accepting: true,
      projects: [{ title: "", date: "", description: "" }],
      leadership: [{ name: "", role: "", email: "" }],
    });
    setShowForm(true);
  };

  const save = async () => {
    try {
      const payload = {
        ...form,
        projects: form.projects.filter((p) => p.title.trim()),
        leadership: form.leadership.filter((l) => l.name.trim() && l.role.trim()),
      };
      if (editing) await client.put(`clubs/${editing.id}`, payload);
      else await client.post("clubs", payload);
      setShowForm(false); fetchData();
    } catch(e) { alert(e.response?.data?.detail||"Failed to save."); }
  };
  const remove = async (id) => { if (!confirm("Delete club?")) return; await client.delete(`clubs/${id}`); fetchData(); };
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploadingLogo(true);
    try {
      const response = await client.post("clubs/upload-logo", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((prev) => ({ ...prev, logo_url: response.data.logo_url }));
    } catch (err) {
      const detail = err.response?.data?.detail;
      const message = typeof detail === "string" ? detail : "Upload failed. Use JPG/PNG/WEBP up to 5MB.";
      alert(message);
    } finally {
      setUploadingLogo(false);
    }
  };
  const toggleRecruitment = async (club) => {
    try {
      await client.put(`clubs/${club.id}/recruitment`, { is_accepting: !club.is_accepting });
      fetchData();
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
                {c.logo_url ? <img src={resolveLogoSrc(c.logo_url)} alt={c.name} className="w-full h-full object-contain p-1"/> : <Building2 size={20} className="text-slate-400"/>}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-primary">{c.name}</h3>
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full">{c.category}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${c.is_accepting?"bg-emerald-100 text-emerald-700 border-emerald-200":"bg-red-100 text-red-700 border-red-200"}`}>
                    {c.is_accepting?"Open":"Closed"}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{c.tagline||c.description||"No description"}</p>
                <p className="text-[10px] text-slate-400 mt-1">{c.projects?.length || 0} initiatives • {c.leadership?.length || 0} leaders</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>toggleRecruitment(c)} className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${c.is_accepting ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100" : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"}`}>
                  {c.is_accepting ? "Close Hiring" : "Open Hiring"}
                </button>
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
                {[{label:"Club Name",key:"name"},{label:"Slug (URL)",key:"slug"},{label:"Category",key:"category"},{label:"Tagline",key:"tagline"}].map(({label,key})=>(
                  <div key={key}><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">{label}</label>
                  <input type="text" value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"/></div>
                ))}
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Club Logo</label>
                  <div className="flex items-center gap-3">
                    <label className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold cursor-pointer hover:bg-slate-50">
                      {uploadingLogo ? "Uploading..." : "Upload Logo"}
                      <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleLogoUpload} className="hidden" />
                    </label>
                    {form.logo_url && (
                      <img
                        src={resolveLogoSrc(form.logo_url)}
                        alt="Club logo preview"
                        className="w-12 h-12 rounded-xl object-contain border border-slate-200 bg-slate-50"
                      />
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Accepted: JPG, PNG, WEBP (max 5MB)</p>
                </div>
                <div><label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"/></div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Initiatives / Projects</label>
                    <button onClick={() => setForm((prev) => ({ ...prev, projects: [...prev.projects, { title: "", date: "", description: "" }] }))} className="text-xs font-bold text-primary flex items-center gap-1"><Plus size={12}/> Add</button>
                  </div>
                  <div className="space-y-3">
                    {form.projects.map((project, idx) => (
                      <div key={`project-${idx}`} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                        <input type="text" placeholder="Title" value={project.title} onChange={(e)=>setForm((prev)=>({ ...prev, projects: prev.projects.map((item,pidx)=>pidx===idx?{...item,title:e.target.value}:item) }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <input type="text" placeholder="Date (optional)" value={project.date} onChange={(e)=>setForm((prev)=>({ ...prev, projects: prev.projects.map((item,pidx)=>pidx===idx?{...item,date:e.target.value}:item) }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <textarea rows={2} placeholder="Description" value={project.description} onChange={(e)=>setForm((prev)=>({ ...prev, projects: prev.projects.map((item,pidx)=>pidx===idx?{...item,description:e.target.value}:item) }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
                        {form.projects.length > 1 && <button onClick={() => setForm((prev) => ({ ...prev, projects: prev.projects.filter((_, pidx) => pidx !== idx) }))} className="text-[11px] font-bold text-red-600">Remove Initiative</button>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Leadership</label>
                    <button onClick={() => setForm((prev) => ({ ...prev, leadership: [...prev.leadership, { name: "", role: "", email: "" }] }))} className="text-xs font-bold text-primary flex items-center gap-1"><Plus size={12}/> Add</button>
                  </div>
                  <div className="space-y-3">
                    {form.leadership.map((leader, idx) => (
                      <div key={`leader-${idx}`} className="p-3 rounded-xl border border-slate-100 bg-slate-50 space-y-2">
                        <input type="text" placeholder="Name" value={leader.name} onChange={(e)=>setForm((prev)=>({ ...prev, leadership: prev.leadership.map((item,lidx)=>lidx===idx?{...item,name:e.target.value}:item) }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <input type="text" placeholder="Role" value={leader.role} onChange={(e)=>setForm((prev)=>({ ...prev, leadership: prev.leadership.map((item,lidx)=>lidx===idx?{...item,role:e.target.value}:item) }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        <input type="email" placeholder="Email (optional)" value={leader.email} onChange={(e)=>setForm((prev)=>({ ...prev, leadership: prev.leadership.map((item,lidx)=>lidx===idx?{...item,email:e.target.value}:item) }))} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        {form.leadership.length > 1 && <button onClick={() => setForm((prev) => ({ ...prev, leadership: prev.leadership.filter((_, lidx) => lidx !== idx) }))} className="text-[11px] font-bold text-red-600">Remove Leader</button>}
                      </div>
                    ))}
                  </div>
                </div>
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
