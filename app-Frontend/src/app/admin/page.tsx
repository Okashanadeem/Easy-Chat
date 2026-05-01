"use client";

import { useState, useEffect } from "react";
import { 
  Upload, FileText, Database, LogOut, CheckCircle2, 
  AlertCircle, Loader2, Trash2, Edit3, Plus, X, Zap, ChevronRight, Save, 
  ShieldCheck
} from "lucide-react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";

interface Document {
  _id: string;
  title: string;
  description: string;
  user_type: string;
  content: string;
  updated_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Dumb Area State
  const [noticeContent, setNoticeContent] = useState("");
  const [isSavingNotice, setIsSavingNotice] = useState(false);

  // Data Set Form
  const [formData, setFormData] = useState({ title: "", description: "", user_type: "" });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | null; message: string }>({ type: null, message: "" });

  useEffect(() => { fetchDocuments(); }, []);

  // Sync notice content when documents are fetched
  useEffect(() => {
    if (documents.length > 0) {
      const nb = documents.find((d: Document) => d.user_type === "Notice Board");
      if (nb && !noticeContent) { // Only set if current editor is empty to avoid overwriting mid-type
        setNoticeContent(nb.content);
      }
    }
  }, [documents]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/documents`);
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data);
      const nb = data.find((d: Document) => d.user_type === "Notice Board");
      if (nb) setNoticeContent(nb.content);
    } catch (e) { 
      console.error(e); 
      setStatus({ type: "error", message: "Failed to load datasets. Is the backend running?" });
    }
    finally { setIsLoading(false); }
  };

  const handleLogout = () => {
    document.cookie = "admin_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/admin/login");
  };

  const saveNoticeBoard = async () => {
    setIsSavingNotice(true);
    try {
      const submissionData = new FormData();
      submissionData.append("title", "Notice Board");
      submissionData.append("description", "Latest class notices and updates");
      submissionData.append("user_type", "Notice Board");
      submissionData.append("text_content", noticeContent);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/documents`, {
        method: "POST",
        body: submissionData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to sync");
      }

      alert("Notice Board Synced with AI! 🚀");
      fetchDocuments();
    } catch (e: any) { 
      alert(`Failed to sync Notice Board: ${e.message} ❌`);
    }
    finally { setIsSavingNotice(false); }
  };

  const clearNoticeBoard = async () => {
    if (!confirm("Wipe Notice Board history? AI will forget these announcements immediately.")) return;
    setIsSavingNotice(true);
    try {
      const submissionData = new FormData();
      submissionData.append("title", "Notice Board");
      submissionData.append("description", "Latest class notices and updates");
      submissionData.append("user_type", "Notice Board");
      submissionData.append("text_content", ""); // Empty content wipes memory

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/documents`, {
        method: "POST",
        body: submissionData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Failed to clear");
      }

      setNoticeContent("");
      alert("Notice Board Memory Cleared! 🧹");
      fetchDocuments();
    } catch (e: any) { 
      alert(`Failed to clear Notice Board: ${e.message}`);
    }
    finally { setIsSavingNotice(false); }
  };

  const handleSubmitDataSet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !formData.user_type) return;
    setIsSubmitting(true);
    try {
      const submissionData = new FormData();
      submissionData.append("title", formData.title);
      submissionData.append("description", formData.description);
      submissionData.append("user_type", formData.user_type);
      if (selectedFile) submissionData.append("file", selectedFile);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/documents`, {
        method: "POST",
        body: submissionData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Upload failed");
      }

      setStatus({ type: "success", message: `Data Set '${formData.user_type}' Synced!` });
      setIsModalOpen(false);
      fetchDocuments();
    } catch (e: any) { setStatus({ type: "error", message: e.message || "Failed to sync document." }); }
    finally { setIsSubmitting(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entire Data Set?")) return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/documents/${id}`, { method: "DELETE" });
    fetchDocuments();
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8FAFC] dark:bg-[#0B0E14] transition-colors duration-500">
      <Header title="Admin Console" subtitle="System Management" />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-10 py-8 md:py-12 space-y-10">
        
        {/* Header Stats & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-800/50">
              <ShieldCheck size={12} />
              Secure Access
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
              Intelligence <br /> Management
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-4 bg-white dark:bg-slate-800 text-red-500 rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-100 dark:border-slate-800 shadow-sm hover:bg-red-500 hover:text-white transition-all active:scale-95"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>

        {/* 🆘 THE DUMB AREA: DIRECT TEXT EDITOR */}
        <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/40 dark:shadow-black/20 overflow-hidden group transition-all hover:shadow-blue-100/40 dark:hover:shadow-blue-900/20">
          <div className="p-8 bg-gradient-to-r from-blue-600 to-indigo-600 flex flex-col md:flex-row justify-between items-center text-white gap-6">
            <div className="flex items-center gap-4 text-center md:text-left">
              <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-md shadow-inner"><Zap size={32} fill="currentColor" /></div>
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight italic">Notice Board</h2>
                <p className="text-blue-100 text-[9px] font-black uppercase tracking-[0.2em] opacity-80 mt-1">Direct Persistent AI Memory</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <button 
                onClick={clearNoticeBoard}
                disabled={isSavingNotice}
                className="w-full md:w-auto bg-transparent border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-[2rem] font-black text-xs uppercase transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                <Trash2 size={18} />
                Clear Memory
              </button>
              <button 
                onClick={saveNoticeBoard}
                disabled={isSavingNotice}
                className="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 px-10 py-4 rounded-[2rem] font-black text-xs uppercase transition-all flex items-center justify-center gap-3 shadow-xl hover:-translate-y-1 disabled:opacity-50"
              >
                {isSavingNotice ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Save Memory Updates
              </button>
            </div>
          </div>
          <div className="p-8">
            <textarea 
              value={noticeContent}
              onChange={(e) => setNoticeContent(e.target.value)}
              placeholder="Start typing class notices here..."
              className="w-full min-h-[350px] p-8 bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/20 focus:bg-white dark:focus:bg-slate-800 outline-none transition-all resize-none leading-relaxed shadow-inner"
            />
          </div>
        </div>

        {/* DATA SETS SECTION */}
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between px-4 gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase italic">Managed Intelligence</h3>
              <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Surgical Dataset Management</p>
            </div>
            <button 
              onClick={() => { 
                setFormData({ title: "", description: "", user_type: "" }); 
                setSelectedFile(null);
                setStatus({ type: null, message: "" });
                setIsModalOpen(true); 
              }}
              className="w-full md:w-auto bg-slate-900 dark:bg-blue-600 text-white px-10 py-5 rounded-[2.5rem] font-black text-xs uppercase hover:bg-black dark:hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-2xl hover:scale-105 active:scale-95"
            >
              <Plus size={20} /> Create Knowledge Set
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-2 md:px-0">
            {isLoading ? (
              <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin mx-auto text-blue-600" size={48} /></div>
            ) : documents.filter(d => d.user_type !== "Notice Board").map((doc) => (
              <div key={doc._id} className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/30 dark:shadow-black/20 hover:shadow-blue-200/40 dark:hover:shadow-blue-900/20 transition-all group relative animate-fade-in-up">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-5 bg-slate-50 dark:bg-slate-800 rounded-[2rem] group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
                    <Database size={28} className="text-slate-400 dark:text-slate-500 group-hover:text-white" />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { 
                      setFormData({ title: doc.title, description: doc.description, user_type: doc.user_type }); 
                      setSelectedFile(null);
                      setStatus({ type: null, message: "" });
                      setIsModalOpen(true); 
                    }} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-all"><Edit3 size={18} /></button>
                    <button onClick={() => handleDelete(doc._id)} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="space-y-2 mb-8 px-2">
                  <h4 className="font-black text-2xl text-slate-900 dark:text-white uppercase tracking-tighter leading-none italic">{doc.user_type}</h4>
                  <p className="text-[10px] font-black text-blue-500 dark:text-blue-400 uppercase tracking-[0.2em]">{doc.title}</p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold mb-8 px-2 line-clamp-3 leading-relaxed opacity-80">{doc.description}</p>
                <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest">Live Sync</span>
                  </div>
                  <button onClick={() => { 
                    setFormData({ title: doc.title, description: doc.description, user_type: doc.user_type }); 
                    setSelectedFile(null);
                    setStatus({ type: null, message: "" });
                    setIsModalOpen(true); 
                  }} className="text-[9px] font-black text-slate-900 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 uppercase tracking-widest flex items-center gap-2 transition-all group/btn">
                    Update Data <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-12 py-10 border-t border-slate-200 dark:border-slate-800 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-600">
              <Database size={16} />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Class Knowledge Base Core</span>
            </div>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-tight">
              Developed by <span className="text-blue-600 dark:text-blue-400 italic">Okasha Nadeem</span> for BSSE Fall 2025
            </p>
            <div className="flex gap-6 mt-2">
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase">System Status</span>
                <span className="text-xs font-bold text-green-500">All Systems Online</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase">Engine</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Gemini 1.5 RAG</span>
              </div>
            </div>
            <p className="text-[9px] font-medium text-slate-400 dark:text-slate-600 mt-4 uppercase tracking-widest">
              © 2026 SMIU Easy Chat • Managed Intelligence Portal
            </p>
          </div>
        </footer>
      </main>

      {/* SYNC MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-2xl animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[4rem] shadow-2xl overflow-hidden animate-in zoom-in-95 border-[12px] border-white dark:border-slate-900">
            <div className="p-10 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 rounded-t-[3rem]">
              <div>
                <h2 className="text-3xl font-black tracking-tighter uppercase italic text-slate-900 dark:text-white">
                  {documents.some(d => d.user_type === formData.user_type) ? "Update Set" : "Sync Data"}
                </h2>
                <p className="text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">
                  {documents.some(d => d.user_type === formData.user_type) ? "Modifying Existing Dataset" : "Creating Knowledge Base"}
                </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-white dark:bg-slate-800 p-4 rounded-3xl text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSubmitDataSet} className="p-10 space-y-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Dataset Name (e.g. Class Drive)</label>
                  <input required className="w-full p-5 bg-slate-100 dark:bg-slate-800 rounded-[2rem] text-sm font-black focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all text-slate-900 dark:text-white" value={formData.user_type} onChange={(e) => setFormData({...formData, user_type: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Internal Title (e.g. Google Drive Map)</label>
                  <input required className="w-full p-5 bg-slate-100 dark:bg-slate-800 rounded-[2rem] text-sm font-black focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all text-slate-900 dark:text-white" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">AI Instructions (Description)</label>
                  <input required className="w-full p-5 bg-slate-100 dark:bg-slate-800 rounded-[2rem] text-sm font-black focus:ring-8 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none transition-all text-slate-900 dark:text-white" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Tell AI what this data set is for..." />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-2">Source File (PDF/MD/TXT)</label>
                <label className="w-full py-8 flex flex-col items-center justify-center gap-3 rounded-[2.5rem] border-4 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all cursor-pointer">
                  <Upload size={32} className="text-slate-300 dark:text-slate-700" />
                  <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    {selectedFile ? selectedFile.name : "Select PDF or Markdown"}
                  </span>
                  <input type="file" className="hidden" accept=".pdf,.md,.txt" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                </label>
              </div>

              <button disabled={isSubmitting} className="w-full py-6 bg-blue-600 text-white rounded-[3rem] font-black uppercase tracking-[0.3em] text-xs hover:bg-blue-700 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-blue-200 dark:shadow-blue-900/40 disabled:bg-slate-100 dark:disabled:bg-slate-800">
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <CheckCircle2 size={24} />}
                {isSubmitting ? "Syncing AI..." : "Sync Dataset"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
