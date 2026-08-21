import { Link } from "react-router-dom";
import logoNav from "@/assets/logo-blue-wordmark.png";

interface LegalPageProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalPage({ title, lastUpdated, children }: LegalPageProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Back nav */}
      <div className="px-5 py-4 border-b border-border">
        <Link to="/" className="inline-flex items-center gap-3">
          <img src={logoNav} alt="Mindcast" className="h-6" />
          <span className="text-muted-foreground text-sm hover:text-foreground transition-colors">← Back</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto px-5 py-12 pb-20">
        {/* Header */}
        <div className="mb-10">
          <p className="font-display text-[10px] text-muted-foreground/50 uppercase tracking-widest mb-3">
            Legal
          </p>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-foreground mb-3 break-words">{title}</h1>
          <p className="text-muted-foreground text-sm font-body">Last updated: {lastUpdated}</p>
        </div>

        {/* Content — LegalPage owns the formatting for every legal page so
            they can't drift apart. break-words keeps long emails, URLs and
            legislation names wrapping instead of overflowing on phones. */}
        <div className="prose prose-base max-w-none break-words
          prose-headings:text-foreground prose-headings:font-display prose-headings:font-black prose-headings:break-words
          prose-h2:text-xl prose-h2:mt-12 prose-h2:mb-6
          prose-h3:text-lg prose-h3:mt-10 prose-h3:mb-4
          prose-p:text-muted-foreground prose-p:leading-[1.8] prose-p:font-body prose-p:my-6
          prose-li:text-muted-foreground prose-li:font-body prose-li:leading-[1.7] prose-li:my-3
          prose-a:text-primary prose-a:underline prose-a:break-all hover:prose-a:text-primary/70
          prose-strong:text-foreground
          prose-hr:border-border prose-hr:my-8
          prose-ul:text-muted-foreground
          prose-ol:text-muted-foreground
        ">
          {children}
        </div>
      </div>
    </div>
  );
}
