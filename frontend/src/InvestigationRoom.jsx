import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Check, ChevronRight, Clock3, FileText, Fingerprint, FolderOpen, LayoutDashboard, MapPin, Shield, Users } from 'lucide-react';
import { request } from './api.js';
import './InvestigationRoom.css';

const sections = [
  { id: 'overview', label: 'Case Overview', Icon: LayoutDashboard },
  { id: 'suspects', label: 'Suspects', Icon: Users },
  { id: 'evidence', label: 'Evidence Room', Icon: FolderOpen },
  { id: 'timeline', label: 'Timeline', Icon: Clock3 },
  { id: 'notes', label: 'Case Notes', Icon: FileText },
];

const display = value => value ? String(value).replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) : 'Not recorded';
const formatDate = value => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(date);
};

export default function InvestigationRoom() {
  const location = useLocation();
  const id = useMemo(() => location.pathname.split('/').filter(Boolean)[1], [location.pathname]);
  const [section, setSection] = useState('overview');
  const [mystery, setMystery] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!id) {
      setLoading(false);
      setMystery(null);
      setSession(null);
      return () => { active = false; };
    }
    setLoading(true);
    setError('');
    setMystery(null);
    setSession(null);
    async function loadCase() {
      try {
        await request(`/investigations/${id}/start`, { method: 'POST' });
        const data = await request(`/investigations/${id}`);
        if (active) {
          setMystery(data.mystery);
          setSession(data.session);
        }
      } catch (loadError) {
        if (active) setError(loadError.message || 'We could not load this case.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadCase();
    return () => { active = false; };
  }, [id]);

  const suspects = mystery?.suspects || [];
  const evidence = mystery?.evidence || [];
  const timeline = mystery?.timeline || [];
  const viewedCount = session?.viewedEvidenceIds?.length || 0;
  const progress = evidence.length ? Math.min(100, Math.round(viewedCount / evidence.length * 100)) : 0;
  const selectedSection = sections.find(item => item.id === section) || sections[0];

  return (
    <main className="investigation-page">
      <div className="investigation-crumbs">
        <Link to="/dashboard"><ArrowLeft size={14}/> My cases</Link>
        <ChevronRight size={13}/>
        <span>{mystery?.title || 'Investigation Room'}</span>
        {mystery && <span className="investigation-live"><i/> CASE ACTIVE</span>}
      </div>

      {!id ? <div className="investigation-message empty">
        <div className="investigation-emblem"><Fingerprint size={27}/></div>
        <span className="section-kicker">NO CASE SELECTED</span>
        <h1>Choose a case<br/><em>to begin.</em></h1>
        <p>Open one of your generated investigations to enter its room.</p>
        <Link className="button button-primary" to="/dashboard">Browse my cases <ChevronRight size={16}/></Link>
      </div> : loading ? <div className="investigation-message" role="status">
        <div className="investigation-emblem loading-emblem"><Fingerprint size={27}/></div>
        <span className="section-kicker">OPENING CASE FILE</span>
        <h1>Gathering the<br/><em>details.</em></h1>
        <p>Loading the case and your investigation progress.</p>
      </div> : error ? <div className="investigation-message error">
        <div className="investigation-emblem"><Shield size={25}/></div>
        <span className="section-kicker">CASE FILE UNAVAILABLE</span>
        <h1>We couldn’t open<br/><em>this room.</em></h1>
        <p>{error}</p>
        <Link className="button button-outline" to="/dashboard"><ArrowLeft size={15}/> Return to my cases</Link>
      </div> : mystery ? <>
        <section className="investigation-casehead">
          <div className="casehead-copy">
            <div className="section-kicker">INVESTIGATION / {String(mystery._id || id).slice(-6).toUpperCase()}</div>
            <h1>{mystery.title}</h1>
            <p>{mystery.description}</p>
            <div className="case-tags"><span>{display(mystery.category)}</span><span>{display(mystery.difficulty)}</span></div>
          </div>
          <div className="casehead-mark"><Fingerprint size={34}/><span>PRIVATE CASE FILE</span></div>
        </section>

        <section className="investigation-stats" aria-label="Case statistics">
          <div><b>{String(suspects.length).padStart(2, '0')}</b><span>SUSPECTS</span></div>
          <div><b>{String(evidence.length).padStart(2, '0')}</b><span>EVIDENCE ITEMS</span></div>
          <div><b>{String(viewedCount).padStart(2, '0')}</b><span>CLUES EXAMINED</span></div>
          <div className="stats-progress"><div className="progress-copy"><span>INVESTIGATION PROGRESS</span><b>{progress}%</b></div><div className="investigation-progress-track"><i style={{ width: `${progress}%` }}/></div></div>
        </section>

        <section className="investigation-workspace">
          <aside className="investigation-nav" aria-label="Investigation sections">
            <div className="investigation-nav-title">INVESTIGATION</div>
            {sections.map(({ id: sectionId, label, Icon }) => <button key={sectionId} onClick={() => setSection(sectionId)} className={section === sectionId ? 'active' : ''} aria-current={section === sectionId ? 'page' : undefined}>
              <Icon size={15}/><span>{label}</span>{sectionId === 'suspects' && <small>{suspects.length}</small>}{sectionId === 'evidence' && <small>{evidence.length}</small>}{section === sectionId && <ChevronRight size={13} className="nav-current"/>}
            </button>)}
            <div className="nav-confidential"><Shield size={14}/><span>Solution remains sealed until your final accusation.</span></div>
          </aside>

          <section className="investigation-main" aria-live="polite">
            {section === 'overview' ? <CaseOverview mystery={mystery} suspects={suspects} evidence={evidence} timeline={timeline} onNavigate={setSection}/> : <SectionPlaceholder section={selectedSection} count={section === 'suspects' ? suspects.length : section === 'evidence' ? evidence.length : section === 'timeline' ? timeline.length : null}/>}
          </section>

          <aside className="investigation-aside">
            <div className="aside-label">CASE INFORMATION</div>
            <div className="aside-fact"><span>CASE STATUS</span><b><i className="status-dot"/> {display(mystery.status)}</b></div>
            <div className="aside-fact"><span>LOCATION</span><b><MapPin size={13}/>{mystery.location || 'Not recorded'}</b></div>
            <div className="aside-fact"><span>INCIDENT DATE</span><b>{formatDate(mystery.incidentDate)}</b></div>
            <div className="aside-fact"><span>INCIDENT TIME</span><b>{mystery.incidentTime || 'Not recorded'}</b></div>
            <div className="aside-divider"/>
            <div className="aside-label">YOUR PROGRESS</div>
            <div className="aside-progress-number">{String(viewedCount).padStart(2, '0')} <small>/ {String(evidence.length).padStart(2, '0')}</small></div>
            <p className="aside-progress-caption">Evidence items examined</p>
            <div className="investigation-progress-track"><i style={{ width: `${progress}%` }}/></div>
            <div className="aside-divider"/>
            <div className="aside-label">CASE FILE</div>
            <div className="aside-created"><BookOpen size={14}/><span>Opened {formatDate(mystery.createdAt)}</span></div>
            <div className="aside-confidential"><Shield size={14}/><span>Confidential solution hidden</span></div>
          </aside>
        </section>
        <footer className="investigation-footer"><span>AFTERLIGHT / INVESTIGATION ROOM</span><span>ALL CASE DETAILS ARE FICTIONAL</span></footer>
      </> : <div className="investigation-message empty"><span className="section-kicker">EMPTY CASE FILE</span><h1>No case details<br/><em>to display.</em></h1><p>This case has not been prepared for investigation yet.</p><Link className="button button-outline" to="/dashboard">Return to my cases</Link></div>}
    </main>
  );
}

function CaseOverview({ mystery, suspects, evidence, timeline, onNavigate }) {
  return <div className="case-overview">
    <div className="section-kicker">CASE OVERVIEW</div>
    <h2>Incident brief</h2>
    <p className="overview-description">{mystery.description || 'No incident description is available for this case.'}</p>
    <div className="overview-rule"/>
    <div className="overview-detail-grid">
      <div><span>SCENE</span><b><MapPin size={14}/>{mystery.location || 'Not recorded'}</b></div>
      <div><span>INCIDENT DATE</span><b>{formatDate(mystery.incidentDate)}</b></div>
      <div><span>INCIDENT TIME</span><b>{mystery.incidentTime || 'Not recorded'}</b></div>
      <div><span>CASE TYPE</span><b>{display(mystery.category)}</b></div>
    </div>
    <div className="overview-rule"/>
    <div className="overview-next-title"><div><span className="section-kicker">YOUR INVESTIGATION</span><h3>Follow what stands out.</h3></div><Fingerprint size={22}/></div>
    <p className="overview-hint">Review the public case materials and compare details as you investigate. The case solution stays confidential until you submit your final accusation.</p>
    <div className="overview-shortcuts">
      <button onClick={() => onNavigate('suspects')}><Users size={15}/><span><b>Suspects</b><small>{suspects.length} profiles in this case</small></span><ChevronRight size={14}/></button>
      <button onClick={() => onNavigate('evidence')}><FolderOpen size={15}/><span><b>Evidence Room</b><small>{evidence.length} items available to examine</small></span><ChevronRight size={14}/></button>
      <button onClick={() => onNavigate('timeline')}><Clock3 size={15}/><span><b>Timeline</b><small>{timeline.length} recorded events</small></span><ChevronRight size={14}/></button>
    </div>
  </div>;
}

function SectionPlaceholder({ section, count }) {
  return <div className="section-placeholder">
    <div className="placeholder-icon"><section.Icon size={23}/></div>
    <div className="section-kicker">INVESTIGATION / {section.label.toUpperCase()}</div>
    <h2>{section.label}</h2>
    {count === 0 ? <><p>No {section.label.toLowerCase()} have been added to this case yet.</p><span className="placeholder-count">This case currently has none to display.</span></> : <><p>This section is ready for the next investigation phase.</p>{count != null && <span className="placeholder-count">{count} {section.label === 'Suspects' ? 'profiles' : 'items'} are part of this case.</span>}</>}
  </div>;
}
