export default function BrandLogo({ compact = false }: { compact?: boolean }) {
  return <span className={`rq-brand-logo ${compact ? "rq-brand-logo-compact" : ""}`} aria-label="RepQuest"><span className="rq-brand-rep">REP</span><span className="rq-brand-quest">QUEST</span></span>;
}
