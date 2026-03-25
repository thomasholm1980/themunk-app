"use client";
// ContextSurfaceCard — Context Surface V1
// Shows MAX ONE relevant content item below Daily Brief.
// Secondary, optional, calm. Never above core interpretation.

import { useEffect, useState } from "react";
import { logMorningEvent } from "../../lib/telemetry";

interface ContentCardItem {
  title:       string;
  summary:     string | null;
  source_type: string;
  source_name: string | null;
  topic_tags:  string[];
  stress_tags: string[];
}

interface Props {
  patternCode: string | null;
}

const SOURCE_LABEL: Record<string, string> = {
  research:      "Forskning",
  study:         "Studie",
  article:       "Artikkel",
  creator:       "Ekspert",
  internal_note: "Internt",
};

export default function ContextSurfaceCard({ patternCode }: Props) {
  const [item,    setItem]    = useState<ContentCardItem | null>(null);
  const [loaded,  setLoaded]  = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!patternCode) { setLoaded(true); return; }

    fetch(`/api/content-library/context?pattern_code=${encodeURIComponent(patternCode)}`)
      .then(r => r.json())
      .then(json => {
        if (json.show_context_card && json.item) {
          setItem(json.item);
          logMorningEvent('context_card_rendered' as any, { title: json.item.title });
        }
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, [patternCode]);

  if (!loaded || !item) return null;

  return (
    <div
      className="w-full max-w-sm mx-auto mt-1 mb-4"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.06)",
        borderRadius: "16px",
        padding: "16px 18px",
      }}
    >
      {/* Label */}
      <div className="text-xs tracking-[0.2em] uppercase text-[rgba(255,255,255,0.22)] mb-2">
        Forstå mer
      </div>

      {/* Title */}
      <div className="text-[14px] font-medium text-[rgba(255,255,255,0.80)] leading-snug mb-1">
        {item.title}
      </div>

      {/* Summary — expandable */}
      {item.summary && (
        <div
          className="text-[12px] text-[rgba(255,255,255,0.35)] leading-relaxed"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: expanded ? undefined : 2,
            WebkitBoxOrient: "vertical" as any,
            overflow: expanded ? "visible" : "hidden",
          }}
        >
          {item.summary}
        </div>
      )}

      {/* Expand / source row */}
      <div className="flex items-center justify-between mt-2">
        {item.summary && item.summary.length > 80 && (
          <button
            onClick={() => {
              setExpanded(e => !e);
              if (!expanded) logMorningEvent('context_card_opened' as any, { title: item.title });
            }}
            className="text-xs text-[rgba(255,255,255,0.28)] hover:text-white transition-colors"
            style={{ letterSpacing: "0.04em" }}
          >
            {expanded ? "Vis mindre" : "Les mer"}
          </button>
        )}
        {item.source_name && (
          <div className="text-xs text-[rgba(255,255,255,0.22)] ml-auto">
            {SOURCE_LABEL[item.source_type] ?? item.source_type} · {item.source_name}
          </div>
        )}
      </div>
    </div>
  );
}
