import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ArrowUpRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  FileText,
  Filter,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

const API_BASE = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000").replace(/\/$/, "");
const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];
const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Freelance"];

const DEMO_SEED = [
  {
    id: "demo-1",
    company: "Northstar Labs",
    role: "Junior Frontend Developer",
    location: "Chennai · Hybrid",
    employment_type: "Full-time",
    job_url: "https://example.com/jobs/frontend",
    status: "Interview",
    applied_date: "2026-10-07",
    follow_up_date: "2026-10-22",
    salary_range: "Not specified",
    notes: "Example record. Replace with your real application details.",
    created_at: "2026-10-07T09:00:00",
  },
  {
    id: "demo-2",
    company: "Orbit Systems",
    role: "Software Developer",
    location: "Remote · India",
    employment_type: "Full-time",
    job_url: "",
    status: "Applied",
    applied_date: "2026-10-12",
    follow_up_date: "2026-10-20",
    salary_range: "",
    notes: "Example record. Follow up if there is no response.",
    created_at: "2026-10-12T09:00:00",
  },
  {
    id: "demo-3",
    company: "Pixelwave Studio",
    role: "React Developer Intern",
    location: "Chennai · On-site",
    employment_type: "Internship",
    job_url: "",
    status: "Saved",
    applied_date: "",
    follow_up_date: "",
    salary_range: "",
    notes: "Example record. Review the role before applying.",
    created_at: "2026-10-16T09:00:00",
  },
];

const EMPTY_FORM = {
  company: "",
  role: "",
  location: "",
  employment_type: "Full-time",
  job_url: "",
  status: "Saved",
  applied_date: "",
  follow_up_date: "",
  salary_range: "",
  notes: "",
};

const STATUS_META = {
  Saved: { tone: "saved", label: "Saved" },
  Applied: { tone: "applied", label: "Applied" },
  Interview: { tone: "interview", label: "Interview" },
  Offer: { tone: "offer", label: "Offer" },
  Rejected: { tone: "rejected", label: "Rejected" },
};

function readDemoApplications() {
  try {
    const stored = window.localStorage.getItem("applyflow-demo-applications");
    if (stored !== null) return JSON.parse(stored);
  } catch {
    // Storage may be unavailable in private browsing contexts.
  }
  return DEMO_SEED;
}

function writeDemoApplications(applications) {
  try {
    window.localStorage.setItem("applyflow-demo-applications", JSON.stringify(applications));
  } catch {
    // Keep the current session usable if storage is disabled.
  }
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      message = data.detail || message;
    } catch {
      // Keep the status-based fallback message.
    }
    throw new Error(message);
  }

  if (response.status === 204) return null;
  return response.json();
}

function prettyDate(dateString) {
  if (!dateString) return "Not set";
  const date = new Date(`${dateString.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Not set";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function relativeDate(dateString) {
  if (!dateString) return "No date";
  const target = new Date(`${dateString.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(target.getTime())) return "No date";
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const difference = Math.round((target.getTime() - today.getTime()) / 86400000);
  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";
  if (difference === -1) return "Yesterday";
  if (difference < -1) return `${Math.abs(difference)} days ago`;
  if (difference < 7) return `In ${difference} days`;
  return prettyDate(dateString);
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Saved;
  return <span className={`status-badge status-${meta.tone}`}><span className="status-badge-dot" />{meta.label}</span>;
}

function ApplicationModal({ initialApplication, onClose, onSave, saving }) {
  const [form, setForm] = useState(() => ({
    ...EMPTY_FORM,
    ...(initialApplication || {}),
    applied_date: initialApplication?.applied_date || "",
    follow_up_date: initialApplication?.follow_up_date || "",
  }));
  const [formError, setFormError] = useState("");

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    if (!form.company.trim() || !form.role.trim()) {
      setFormError("Add a company and role to save this application.");
      return;
    }
    setFormError("");
    try {
      await onSave({
        ...form,
        company: form.company.trim(),
        role: form.role.trim(),
        location: form.location.trim() || null,
        job_url: form.job_url.trim() || null,
        salary_range: form.salary_range.trim() || null,
        notes: form.notes.trim() || null,
        applied_date: form.applied_date || null,
        follow_up_date: form.follow_up_date || null,
      });
    } catch (error) {
      setFormError(error.message || "Could not save this application.");
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="application-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading">
          <div>
            <p className="eyebrow">{initialApplication ? "UPDATE YOUR RECORD" : "ADD TO YOUR PIPELINE"}</p>
            <h2 id="modal-title">{initialApplication ? "Edit application" : "New application"}</h2>
          </div>
          <button className="icon-button" type="button" onClick={onClose} aria-label="Close form"><X size={19} /></button>
        </div>

        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="field">
              <span>Company <b>*</b></span>
              <input name="company" value={form.company} onChange={updateField} placeholder="e.g. Acme Inc." autoFocus required maxLength={160} />
            </label>
            <label className="field">
              <span>Job title <b>*</b></span>
              <input name="role" value={form.role} onChange={updateField} placeholder="e.g. Junior Developer" required maxLength={160} />
            </label>
            <label className="field">
              <span>Location</span>
              <input name="location" value={form.location || ""} onChange={updateField} placeholder="Chennai, Remote..." maxLength={180} />
            </label>
            <label className="field">
              <span>Employment type</span>
              <select name="employment_type" value={form.employment_type || "Full-time"} onChange={updateField}>
                {EMPLOYMENT_TYPES.map((type) => <option key={type}>{type}</option>)}
              </select>
            </label>
            <label className="field field-full">
              <span>Job posting link</span>
              <input name="job_url" type="url" value={form.job_url || ""} onChange={updateField} placeholder="https://company.com/careers/role" />
            </label>
            <label className="field">
              <span>Status</span>
              <select name="status" value={form.status || "Saved"} onChange={updateField}>
                {STATUSES.map((status) => <option key={status}>{status}</option>)}
              </select>
            </label>
            <label className="field">
              <span>Salary / range</span>
              <input name="salary_range" value={form.salary_range || ""} onChange={updateField} placeholder="Optional" maxLength={120} />
            </label>
            <label className="field">
              <span>Applied date</span>
              <input type="date" name="applied_date" value={form.applied_date || ""} onChange={updateField} />
            </label>
            <label className="field">
              <span>Follow-up date</span>
              <input type="date" name="follow_up_date" value={form.follow_up_date || ""} onChange={updateField} />
            </label>
            <label className="field field-full">
              <span>Notes</span>
              <textarea name="notes" value={form.notes || ""} onChange={updateField} rows="3" placeholder="Recruiter name, interview notes, next steps..." maxLength={5000} />
            </label>
          </div>

          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="modal-actions">
            <button className="button button-quiet" type="button" onClick={onClose} disabled={saving}>Cancel</button>
            <button className="button button-primary" type="submit" disabled={saving}>
              {saving ? <LoaderCircle size={16} className="spin" /> : <Check size={16} />}
              {saving ? "Saving..." : initialApplication ? "Save changes" : "Add application"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, hint, tone }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon stat-icon-${tone}`}><Icon size={19} strokeWidth={1.9} /></div>
      <p className="stat-label">{label}</p>
      <div className="stat-value-row"><strong>{value}</strong><span>{hint}</span></div>
    </article>
  );
}

function ApplicationRow({ application, onEdit, onDelete, onStatusChange, busy }) {
  const initials = application.company.trim().slice(0, 1).toUpperCase() || "?";
  const dateText = application.applied_date ? prettyDate(application.applied_date) : "Not applied yet";

  return (
    <article className="application-row">
      <div className="company-mark">{initials}</div>
      <div className="application-main">
        <div className="application-title-line">
          <h3>{application.role}</h3>
          {application.job_url && (
            <a className="job-link" href={application.job_url} target="_blank" rel="noopener noreferrer" aria-label={`Open job posting for ${application.role}`} title="Open job posting"><ArrowUpRight size={15} /></a>
          )}
        </div>
        <p className="company-name">{application.company}</p>
        <div className="application-meta">
          {application.location && <span><MapPin size={13} />{application.location}</span>}
          <span><CalendarDays size={13} />{dateText}</span>
          <span className="employment-label">{application.employment_type || "Full-time"}</span>
        </div>
      </div>

      <div className="application-status">
        <label className="sr-only" htmlFor={`status-${application.id}`}>Status for {application.role} at {application.company}</label>
        <select id={`status-${application.id}`} className={`status-select select-${(STATUS_META[application.status] || STATUS_META.Saved).tone}`} value={application.status} disabled={busy} onChange={(event) => onStatusChange(application.id, event.target.value)}>
          {STATUSES.map((status) => <option key={status}>{status}</option>)}
        </select>
      </div>

      <div className="application-followup">
        {application.follow_up_date ? (
          <>
            <span className="followup-label">FOLLOW UP</span>
            <strong className={new Date(`${application.follow_up_date}T12:00:00`) < new Date(new Date().setHours(0, 0, 0, 0)) ? "followup-overdue" : ""}>{relativeDate(application.follow_up_date)}</strong>
          </>
        ) : (
          <>
            <span className="followup-label">FOLLOW UP</span>
            <span className="followup-empty">Not scheduled</span>
          </>
        )}
      </div>

      <div className="row-actions">
        <button className="icon-button" type="button" onClick={() => onEdit(application)} aria-label={`Edit ${application.role} at ${application.company}`} title="Edit application"><Pencil size={16} /></button>
        <button className="icon-button icon-button-danger" type="button" onClick={() => onDelete(application)} aria-label={`Delete ${application.role} at ${application.company}`} title="Delete application"><Trash2 size={16} /></button>
      </div>
    </article>
  );
}

export default function App() {
  const [applications, setApplications] = useState([]);
  const [mode, setMode] = useState("connecting");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [toast, setToast] = useState("");
  const [busyIds, setBusyIds] = useState([]);

  const notify = useCallback((message) => {
    setToast(message);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(""), 3200);
  }, []);

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      await apiRequest("/api/health");
      const data = await apiRequest("/api/applications");
      setApplications(data);
      setMode("backend");
    } catch {
      setApplications(readDemoApplications());
      setMode("demo");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return applications
      .filter((application) => statusFilter === "All" || application.status === statusFilter)
      .filter((application) => {
        if (!normalizedQuery) return true;
        return [application.company, application.role, application.location, application.notes]
          .some((value) => (value || "").toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        const aDate = a.applied_date || a.created_at || "";
        const bDate = b.applied_date || b.created_at || "";
        return sortOrder === "newest" ? bDate.localeCompare(aDate) : aDate.localeCompare(bDate);
      });
  }, [applications, query, statusFilter, sortOrder]);

  const activeCount = applications.filter((application) => ["Saved", "Applied", "Interview"].includes(application.status)).length;
  const interviewCount = applications.filter((application) => application.status === "Interview").length;
  const offerCount = applications.filter((application) => application.status === "Offer").length;
  const followUps = applications.filter((application) => application.follow_up_date && !["Offer", "Rejected"].includes(application.status));
  const upcomingFollowUps = followUps.filter((application) => application.follow_up_date >= new Date().toISOString().slice(0, 10)).length;
  const nextFollowUp = followUps
    .filter((application) => application.follow_up_date)
    .sort((a, b) => a.follow_up_date.localeCompare(b.follow_up_date))[0];

  function openCreateModal() {
    setEditingApplication(null);
    setModalOpen(true);
  }

  function openEditModal(application) {
    setEditingApplication(application);
    setModalOpen(true);
  }

  function saveToDemo(nextApplications) {
    setApplications(nextApplications);
    writeDemoApplications(nextApplications);
  }

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (mode === "backend") {
        try {
          if (editingApplication) {
            const updated = await apiRequest(`/api/applications/${editingApplication.id}`, {
              method: "PATCH",
              body: JSON.stringify(payload),
            });
            setApplications((previous) => previous.map((item) => item.id === updated.id ? updated : item));
          } else {
            const created = await apiRequest("/api/applications", {
              method: "POST",
              body: JSON.stringify(payload),
            });
            setApplications((previous) => [created, ...previous]);
          }
          notify(editingApplication ? "Application updated" : "Application added");
        } catch {
          const fallbackId = editingApplication?.id || `demo-${Date.now()}`;
          const updated = {
            ...payload,
            id: fallbackId,
            created_at: editingApplication?.created_at || new Date().toISOString(),
          };
          const next = editingApplication
            ? applications.map((item) => item.id === editingApplication.id ? updated : item)
            : [updated, ...applications];
          setMode("demo");
          saveToDemo(next);
          notify("API unavailable. Saved to this browser instead.");
        }
      } else {
        const updated = {
          ...payload,
          id: editingApplication?.id || `demo-${Date.now()}`,
          created_at: editingApplication?.created_at || new Date().toISOString(),
        };
        const next = editingApplication
          ? applications.map((item) => item.id === editingApplication.id ? updated : item)
          : [updated, ...applications];
        saveToDemo(next);
        notify(editingApplication ? "Application updated" : "Application added");
      }
      setModalOpen(false);
      setEditingApplication(null);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id, status) {
    setBusyIds((previous) => [...previous, id]);
    try {
      if (mode === "backend") {
        try {
          const updated = await apiRequest(`/api/applications/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          setApplications((previous) => previous.map((item) => item.id === id ? updated : item));
        } catch {
          const next = applications.map((item) => item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item);
          setMode("demo");
          saveToDemo(next);
          notify("API unavailable. Switched to browser demo mode.");
        }
      } else {
        saveToDemo(applications.map((item) => item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item));
      }
    } finally {
      setBusyIds((previous) => previous.filter((busyId) => busyId !== id));
    }
  }

  async function handleDelete(application) {
    const confirmed = window.confirm(`Delete the application for ${application.role} at ${application.company}?`);
    if (!confirmed) return;

    if (mode === "backend") {
      try {
        await apiRequest(`/api/applications/${application.id}`, { method: "DELETE" });
        setApplications((previous) => previous.filter((item) => item.id !== application.id));
        notify("Application deleted");
      } catch {
        const next = applications.filter((item) => item.id !== application.id);
        setMode("demo");
        saveToDemo(next);
        notify("API unavailable. Deleted from browser demo data.");
      }
    } else {
      saveToDemo(applications.filter((item) => item.id !== application.id));
      notify("Application deleted");
    }
  }

  const dateLabel = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="app-brand" href="#dashboard" aria-label="ApplyFlow dashboard">
          <span className="brand-symbol"><BriefcaseBusiness size={21} /></span>
          <span>Apply<span>Flow</span><small>CAREER WORKSPACE</small></span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <a href="#dashboard" className="sidebar-link sidebar-link-active"><LayoutDashboard size={18} />Dashboard<span className="nav-active-mark" /></a>
          <a href="#applications" className="sidebar-link"><BriefcaseBusiness size={18} />Applications<span className="nav-count">{applications.length}</span></a>
          <a href="#follow-ups" className="sidebar-link"><CalendarDays size={18} />Follow-ups</a>
        </nav>

        <div className="sidebar-tip">
          <div className="tip-icon"><Sparkles size={17} /></div>
          <p className="tip-title">Small steps add up</p>
          <p>Keep each application up to date and make your next action clear.</p>
        </div>

        <div className="sidebar-profile">
          <div className="profile-avatar">BB</div>
          <div className="profile-copy"><strong>Bharath B</strong><span>Job search workspace</span></div>
          <MoreHorizontal size={18} className="profile-more" />
        </div>
      </aside>

      <div className="main-panel" id="dashboard">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-separator">/</span><strong>Dashboard</strong></div>
          <div className="topbar-right">
            <span className={`connection-pill connection-${mode}`}><span />{mode === "backend" ? "Connected to API" : mode === "demo" ? "Demo mode" : "Connecting..."}</span>
            <div className="topbar-avatar">BB</div>
          </div>
        </header>

        <main className="workspace">
          {mode === "demo" && (
            <div className="demo-notice" role="status">
              <Sparkles size={16} />
              <p><strong>Demo mode is active.</strong> Your changes stay in this browser until the FastAPI backend is running. Example applications are provided so you can explore the interface.</p>
              <button type="button" onClick={loadApplications} aria-label="Retry connecting to API"><ArrowDownUp size={16} /></button>
            </div>
          )}

          <section className="welcome-row">
            <div>
              <p className="date-line">{dateLabel}</p>
              <h1>Your next opportunity starts here<span>.</span></h1>
              <p className="welcome-subtitle">A calmer way to manage your job search, one step at a time.</p>
            </div>
            <button className="button button-primary create-button" type="button" onClick={openCreateModal}><Plus size={18} />New application</button>
          </section>

          <section className="stats-grid" aria-label="Application overview">
            <StatCard icon={BriefcaseBusiness} label="Total applications" value={applications.length} hint="tracked roles" tone="purple" />
            <StatCard icon={TrendingUpFallback} label="Active pipeline" value={activeCount} hint="in progress" tone="blue" />
            <StatCard icon={CalendarDays} label="Interviews" value={interviewCount} hint="conversations" tone="orange" />
            <StatCard icon={CircleDollarSign} label="Offers" value={offerCount} hint="next chapter" tone="green" />
          </section>

          <section className="pipeline-card" id="follow-ups">
            <div className="pipeline-title">
              <span className="pipeline-icon"><Clock3 size={17} /></span>
              <div><h2>Follow-up radar</h2><p>Keep the next step in sight</p></div>
            </div>
            {nextFollowUp ? (
              <div className="followup-summary">
                <div className="followup-company-mark">{nextFollowUp.company.slice(0, 1).toUpperCase()}</div>
                <div className="followup-details"><strong>{nextFollowUp.company}</strong><span>{nextFollowUp.role}</span></div>
                <div className="followup-date"><span>{relativeDate(nextFollowUp.follow_up_date)}</span><strong>{prettyDate(nextFollowUp.follow_up_date)}</strong></div>
                <span className="followup-count">{upcomingFollowUps} upcoming</span>
                {nextFollowUp.job_url && <a className="followup-open" href={nextFollowUp.job_url} target="_blank" rel="noopener noreferrer" aria-label="Open job link"><ArrowUpRight size={17} /></a>}
              </div>
            ) : (
              <div className="followup-empty-state"><span><CheckCircle2 size={18} /></span><p>No follow-ups scheduled yet. Add a date to an application to keep your next step visible.</p></div>
            )}
          </section>

          <section className="applications-section" id="applications">
            <div className="section-header">
              <div><div className="section-title"><h2>Applications</h2><span className="total-pill">{applications.length}</span></div><p>Every opportunity, organized.</p></div>
              <button className="button button-secondary add-compact" type="button" onClick={openCreateModal}><Plus size={16} /> Add role</button>
            </div>

            <div className="application-toolbar">
              <div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, role, location..." aria-label="Search applications" />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")}><X size={15} /></button>}</div>
              <label className="filter-select"><Filter size={15} /><select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>All</option>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select><ChevronDown size={14} /></label>
              <button className="sort-button" type="button" onClick={() => setSortOrder((previous) => previous === "newest" ? "oldest" : "newest")}><ArrowDownUp size={15} />{sortOrder === "newest" ? "Newest first" : "Oldest first"}</button>
            </div>

            <div className="applications-list">
              <div className="list-head"><span>ROLE &amp; COMPANY</span><span>STATUS</span><span>NEXT FOLLOW-UP</span><span className="list-actions-label">ACTIONS</span></div>
              {loading ? (
                <div className="list-state"><LoaderCircle className="spin" size={22} /><p>Loading your applications...</p></div>
              ) : filteredApplications.length ? (
                filteredApplications.map((application) => (
                  <ApplicationRow key={application.id} application={application} onEdit={openEditModal} onDelete={handleDelete} onStatusChange={handleStatusChange} busy={busyIds.includes(application.id)} />
                ))
              ) : (
                <div className="list-state empty-state"><div className="empty-icon"><FileText size={23} /></div><h3>{applications.length ? "No applications found" : "Your tracker starts here"}</h3><p>{applications.length ? "Try another search term or status filter." : "Add your first role to turn your job search into a clear, manageable process."}</p>{!applications.length && <button className="button button-primary" type="button" onClick={openCreateModal}><Plus size={17} />Add your first application</button>}</div>
              )}
            </div>
            <div className="list-footer"><span>Showing {filteredApplications.length} of {applications.length} applications</span><span><span className="legend-dot" /> Your progress, one application at a time</span></div>
          </section>

          <footer className="workspace-footer"><span>ApplyFlow <span className="footer-divider">·</span> A personal job search workspace</span><span>Made to keep things moving <Sparkles size={13} /></span></footer>
        </main>
      </div>

      {modalOpen && <ApplicationModal initialApplication={editingApplication} onClose={() => { setModalOpen(false); setEditingApplication(null); }} onSave={handleSave} saving={saving} />}
      {toast && <div className="toast-message" role="status"><CheckCircle2 size={17} />{toast}</div>}
    </div>
  );
}

function TrendingUpFallback(props) {
  return <ArrowUpRight {...props} />;
}
