import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ChevronDown, ChevronRight, Search, BookOpen, Users, Baby } from "lucide-react";

interface CurriculumWeek {
  id: string;
  week_number: number;
  block_number: number;
  block_theme: string;
  weekly_theme: string;
  adult_source: string;
  adult_video_title: string;
  adult_search_notes: string;
  teen_source: string;
  teen_video_title: string;
  teen_search_notes: string;
  kids_format: string;
  kids_title: string;
  kids_theme_notes: string;
  kids_activity_type: string;
  pdf_reference: string;
}

const BLOCK_COLORS: Record<number, string> = {
  1: "bg-violet-500/10 border-violet-500/20 text-violet-300",
  2: "bg-blue-500/10 border-blue-500/20 text-blue-300",
  3: "bg-cyan-500/10 border-cyan-500/20 text-cyan-300",
  4: "bg-emerald-500/10 border-emerald-500/20 text-emerald-300",
  5: "bg-yellow-500/10 border-yellow-500/20 text-yellow-300",
  6: "bg-orange-500/10 border-orange-500/20 text-orange-300",
  7: "bg-pink-500/10 border-pink-500/20 text-pink-300",
  8: "bg-rose-500/10 border-rose-500/20 text-rose-300",
  9: "bg-red-500/10 border-red-500/20 text-red-300",
  10: "bg-amber-500/10 border-amber-500/20 text-amber-300",
  11: "bg-lime-500/10 border-lime-500/20 text-lime-300",
  12: "bg-teal-500/10 border-teal-500/20 text-teal-300",
  13: "bg-indigo-500/10 border-indigo-500/20 text-indigo-300",
};

const AdminCurriculum = () => {
  const navigate = useNavigate();
  const [weeks, setWeeks] = useState<CurriculumWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"adult" | "teen" | "kids">("adult");

  useEffect(() => {
    supabase.from("curriculum_weeks").select("*").order("week_number").then(({ data }) => {
      if (data) setWeeks(data as CurriculumWeek[]);
      setLoading(false);
    });
  }, []);

  const blocks = weeks.reduce((acc, w) => {
    if (!acc[w.block_number]) acc[w.block_number] = { theme: w.block_theme, weeks: [] };
    acc[w.block_number].weeks.push(w);
    return acc;
  }, {} as Record<number, { theme: string; weeks: CurriculumWeek[] }>);

  const filteredWeeks = searchQuery
    ? weeks.filter(w =>
        w.weekly_theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.adult_video_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.teen_video_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.kids_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.block_theme.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const renderWeekCard = (w: CurriculumWeek) => {
    const isExpanded = expandedWeek === w.week_number;
    return (
      <div key={w.id} className="border border-foreground/[0.06] rounded-lg overflow-hidden">
        <button onClick={() => setExpandedWeek(isExpanded ? null : w.week_number)}
          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-foreground/[0.02] transition-colors text-left">
          {isExpanded ? <ChevronDown size={14} className="text-foreground/30 flex-shrink-0" /> : <ChevronRight size={14} className="text-foreground/30 flex-shrink-0" />}
          <span className="text-foreground/20 text-xs font-body w-8 flex-shrink-0">W{w.week_number}</span>
          <span className="text-foreground font-body text-sm flex-1">{w.weekly_theme}</span>
          <span className={`text-[9px] px-2 py-0.5 rounded border ${BLOCK_COLORS[w.block_number] || "bg-foreground/5 border-foreground/10 text-foreground/40"}`}>
            Block {w.block_number}
          </span>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 border-t border-foreground/[0.04]">
            <div className="flex gap-2 py-3">
              {(["adult", "teen", "kids"] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-body uppercase tracking-wide transition-colors ${activeTab === tab ? "bg-foreground/10 text-foreground" : "text-foreground/30 hover:text-foreground/50"}`}>
                  {tab === "adult" && <BookOpen size={12} />}
                  {tab === "teen" && <Users size={12} />}
                  {tab === "kids" && <Baby size={12} />}
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === "adult" && (
              <div className="space-y-3">
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">SOURCE</p>
                  <p className="text-foreground/60 text-sm font-body">{w.adult_source}</p>
                </div>
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">VIDEO TITLE</p>
                  <p className="text-foreground font-body text-sm">{w.adult_video_title}</p>
                </div>
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">SEARCH NOTES</p>
                  <p className="text-foreground/40 text-xs font-body italic">{w.adult_search_notes}</p>
                </div>
                {w.pdf_reference && (
                  <div>
                    <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">PDF REFERENCE</p>
                    <p className="text-foreground/40 text-xs font-body">{w.pdf_reference}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "teen" && (
              <div className="space-y-3">
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">SOURCE</p>
                  <p className="text-foreground/60 text-sm font-body">{w.teen_source}</p>
                </div>
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">VIDEO TITLE</p>
                  <p className="text-foreground font-body text-sm">{w.teen_video_title}</p>
                </div>
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">SEARCH NOTES</p>
                  <p className="text-foreground/40 text-xs font-body italic">{w.teen_search_notes}</p>
                </div>
              </div>
            )}

            {activeTab === "kids" && (
              <div className="space-y-3">
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">FORMAT</p>
                  <p className="text-foreground/60 text-sm font-body">{w.kids_format}</p>
                </div>
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">TITLE</p>
                  <p className="text-foreground font-body text-sm">{w.kids_title}</p>
                </div>
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">THEME NOTES</p>
                  <p className="text-foreground/40 text-xs font-body">{w.kids_theme_notes}</p>
                </div>
                <div>
                  <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-1">ACTIVITY</p>
                  <p className="text-foreground/50 text-xs font-body">{w.kids_activity_type}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><span className="text-foreground/20 text-xs animate-pulse font-body">Loading curriculum...</span></div>;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="px-5 pt-8 pb-4 border-b border-foreground/[0.06]">
        <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-foreground/30 text-xs font-body mb-4 hover:text-foreground/50 transition-colors">
          <ArrowLeft size={14} /> Admin
        </button>
        <h1 className="text-xl font-display font-bold">52-Week Curriculum</h1>
        <p className="text-foreground/30 text-xs font-body mt-1">13 blocks · Adults · Teens · Kids</p>
      </div>

      <div className="px-5 py-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/20" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-foreground/[0.03] border border-foreground/[0.06] text-foreground font-body text-sm pl-9 pr-4 py-2.5 rounded-lg focus:outline-none focus:border-foreground/15 placeholder:text-foreground/15"
            placeholder="Search themes, videos, activities..." />
        </div>
      </div>

      <div className="px-5 pb-20">
        {searchQuery && filteredWeeks ? (
          <div className="space-y-2">
            <p className="text-foreground/20 text-[10px] font-body tracking-wide mb-3">{filteredWeeks.length} RESULTS</p>
            {filteredWeeks.map(renderWeekCard)}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(blocks).map(([blockNum, block]) => (
              <div key={blockNum}>
                <div className={`px-3 py-2 rounded-lg border mb-3 ${BLOCK_COLORS[Number(blockNum)] || "bg-foreground/5 border-foreground/10"}`}>
                  <p className="text-[10px] font-body tracking-wide opacity-60">BLOCK {blockNum}</p>
                  <p className="font-display font-bold text-sm">{block.theme}</p>
                  <p className="text-[10px] font-body opacity-50 mt-0.5">Weeks {block.weeks[0]?.week_number}–{block.weeks[block.weeks.length - 1]?.week_number}</p>
                </div>
                <div className="space-y-2">
                  {block.weeks.map(renderWeekCard)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCurriculum;
