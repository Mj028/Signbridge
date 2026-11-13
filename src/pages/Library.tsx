import { useMemo, useState } from 'react';
import { BookOpen, Eye, Hand, Search, ShieldCheck, X } from 'lucide-react';
import { CATEGORY_LABELS, LIBRARY, STATUS_LABELS, datasetLabel } from '../data/library';
import { MOTIONS } from '../data/motions';
import { mapMessageToSigns } from '../lib/signMapping';
import { navigate } from '../lib/router';
import { useApp } from '../state/AppContext';
import type { Category, ContentStatus, LibraryEntry } from '../types';
import { Badge, Card, Notice, PageHeader } from '../components/ui';
import { SignStage } from '../components/SignAvatar';

const TONE: Record<ContentStatus, 'amber' | 'neutral' | 'green'> = { demo: 'amber', awaiting: 'neutral', validated: 'green' };

export function Library() {
  const { runGesture } = useApp();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [status, setStatus] = useState<ContentStatus | 'all'>('all');
  const [preview, setPreview] = useState<LibraryEntry | null>(null);

  const counts = useMemo(
    () => ({
      total: LIBRARY.length,
      demo: LIBRARY.filter((e) => e.status === 'demo').length,
      awaiting: LIBRARY.filter((e) => e.status === 'awaiting').length,
      validated: LIBRARY.filter((e) => e.status === 'validated').length,
    }),
    [],
  );

  const list = LIBRARY.filter(
    (e) =>
      (cat === 'all' || e.category === cat) &&
      (status === 'all' || e.status === status) &&
      e.phrase.toLowerCase().includes(q.trim().toLowerCase()),
  );

  const previewItems = useMemo(() => (preview ? mapMessageToSigns(preview.phrase) : []), [preview]);

  return (
    <>
      <PageHeader title="Nigerian Sign Language Library" sub="How SIGNBRIDGE’s vocabulary, animations and recognition data will be organised." />

      <Notice tone="amber" icon={<ShieldCheck size={18} aria-hidden="true" />}>
        <b>0 expressions are validated.</b> “Demonstration sample” entries have illustrative placeholder animations or simulated sensor templates only. Nothing is marked
        as validated NSL until it has been recorded with Deaf NSL signers and reviewed by linguists.
      </Notice>

      <div className="lib-stats">
        <div><b>{counts.total}</b><span>Expressions</span></div>
        <div><b>{counts.demo}</b><span>Demonstration samples</span></div>
        <div><b>{counts.awaiting}</b><span>Awaiting validation</span></div>
        <div><b>{counts.validated}</b><span>Validated NSL</span></div>
      </div>

      <div className="lib-tools">
        <div className="search">
          <Search size={17} aria-hidden="true" />
          <input type="search" className="input" placeholder="Search expressions" aria-label="Search expressions" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <select className="select" value={status} onChange={(e) => setStatus(e.target.value as ContentStatus | 'all')} aria-label="Filter by content status">
          <option value="all">All statuses</option>
          {(Object.keys(STATUS_LABELS) as ContentStatus[]).map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="chips cat-chips" role="group" aria-label="Categories">
        <button type="button" className={`chip ${cat === 'all' ? 'on' : ''}`} onClick={() => setCat('all')}>All</button>
        {(Object.keys(CATEGORY_LABELS) as Category[]).map((c) => (
          <button key={c} type="button" className={`chip ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{CATEGORY_LABELS[c]}</button>
        ))}
      </div>

      {preview && (
        <Card
          title={`Preview: ${preview.phrase}`}
          icon={<Eye size={18} aria-hidden="true" />}
          action={<button type="button" className="icon-btn" onClick={() => setPreview(null)} aria-label="Close preview"><X size={18} /></button>}
          className="preview-card"
        >
          <p className="small muted">{preview.motionId ? MOTIONS[preview.motionId].label : ''} · illustrative only</p>
          <SignStage items={previewItems} text={preview.phrase} autoplay loop={false} compact />
        </Card>
      )}

      <div className="lib-grid" aria-live="polite">
        {list.length === 0 && (
          <div className="empty card">
            <BookOpen size={22} aria-hidden="true" />
            <p><b>No expressions match.</b></p>
            <p className="muted small">
              {status === 'validated'
                ? 'No expression is validated yet. Validated NSL content requires recordings and review by Deaf NSL users and linguists.'
                : 'Try a different search or filter.'}
            </p>
          </div>
        )}
        {list.map((e) => (
          <article key={e.id} className="lib-card">
            <header>
              <h3>{e.phrase}</h3>
              <Badge tone={TONE[e.status]}>{STATUS_LABELS[e.status]}</Badge>
            </header>
            <dl>
              <div><dt>Category</dt><dd>{CATEGORY_LABELS[e.category]}</dd></div>
              <div><dt>NSL content</dt><dd>{e.status === 'validated' ? 'Validated' : 'Not validated'}</dd></div>
              <div><dt>Recognition dataset</dt><dd>{datasetLabel(e)}</dd></div>
              <div><dt>Animation</dt><dd>{e.motionId ? 'Illustrative placeholder' : 'None yet'}</dd></div>
            </dl>
            <div className="row gap-sm wrap">
              {e.motionId ? (
                <button type="button" className="btn btn-outline btn-sm" onClick={() => { setPreview(e); window.scrollTo({ top: 0, behavior: 'smooth' }); }}><Eye size={15} /> Preview</button>
              ) : (
                <span className="small muted">No preview available</span>
              )}
              {e.signature && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => { navigate('/app/sign-to-speech'); void runGesture(e.id); }}><Hand size={15} /> Try on glove</button>
              )}
            </div>
          </article>
        ))}
      </div>

      <Card title="How content becomes validated" icon={<ShieldCheck size={18} aria-hidden="true" />}>
        <ol className="steps">
          <li><b>Select vocabulary</b> with Deaf NSL users and educators.</li>
          <li><b>Record</b> verified signs (video, motion capture and glove sensor data).</li>
          <li><b>Review</b> with NSL linguists, then mark the expression validated.</li>
          <li><b>Train and test</b> the recogniser on real recordings; replace the simulated template.</li>
        </ol>
        <p className="small muted">The library lives in <code>src/data/library.ts</code> so verified content can replace the placeholders without changing the app.</p>
      </Card>
    </>
  );
}
