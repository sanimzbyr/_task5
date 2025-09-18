import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookRow, BookDetails, fetchBooks, fetchDetails } from "../api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

type Props = {
  region: string;
  seed: number;
  likes: number;
  reviews: number;
  onCountChange?: (count: number) => void;
};

export default function BooksGallery({ region, seed, likes, reviews, onCountChange }: Props) {
  const [cards, setCards] = useState<BookRow[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [details, setDetails] = useState<Record<number, BookDetails>>({});

  const loaderRef = useRef<HTMLDivElement | null>(null);
  const listAbortRef = useRef<AbortController | null>(null);
  const hitLockRef = useRef(false);

  const coverUrlFor = useCallback(
    (absoluteIndex: number) =>
      `/api/cover.svg?region=${encodeURIComponent(region)}&seed=${seed}&index=${absoluteIndex}`,
    [region, seed]
  );

  // ✅ Same defensive normalization as table
  const normalizeDetails = useCallback((raw: any): BookDetails => {
    const norm = {
      index: raw?.index ?? raw?.Index ?? 0,
      title: raw?.title ?? raw?.Title ?? "",
      authors: raw?.authors ?? raw?.Authors ?? [],
      publisher: raw?.publisher ?? raw?.Publisher ?? "",
      coverUrl: raw?.coverUrl ?? raw?.CoverUrl ?? raw?.coverURL ?? raw?.CoverURL ?? "",
      likes: raw?.likes ?? raw?.Likes ?? 0,
      reviews: [] as Array<{ reviewer: string; text: string }>,
    };

    const src = Array.isArray(raw?.reviews) ? raw.reviews : raw?.Reviews ?? [];
    norm.reviews = (src as any[]).map((r: any) => {
      if (Array.isArray(r)) {
        const [a, b] = r;
        return { reviewer: String(a ?? "").trim(), text: String(b ?? "").trim() };
      }
      const reviewer = r?.reviewer ?? r?.Reviewer ?? r?.item1 ?? r?.Item1 ?? r?.name ?? "";
      const text = r?.text ?? r?.Text ?? r?.item2 ?? r?.Item2 ?? r?.content ?? r?.body ?? "";
      return { reviewer: String(reviewer ?? "").trim(), text: String(text ?? "").trim() };
    });

    return norm as BookDetails;
  }, []);

  const loadPage = useCallback(
    async (p: number, size: number) => {
      if (loading) return;
      setLoading(true);

      listAbortRef.current?.abort();
      const ac = new AbortController();
      listAbortRef.current = ac;

      try {
        const batch = await fetchBooks({ region, seed, likes, reviews, page: p, size });
        setCards((prev) => (p === 1 ? batch : [...prev, ...batch]));
      } finally {
        setLoading(false);
      }
    },
    [region, seed, likes, reviews, loading]
  );

  useEffect(() => {
    setCards([]);
    setDetails({});
    setOpenIndex(null);
    setPage(1);
    listAbortRef.current?.abort();
    void loadPage(1, 20);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region, seed, likes, reviews]);

  const onHit = useCallback(() => {
    if (loading || hitLockRef.current) return;
    hitLockRef.current = true;
    const next = page + 1;
    void loadPage(next, 10).then(() => {
      setPage(next);
      setTimeout(() => { hitLockRef.current = false; }, 0);
    });
  }, [loading, page, loadPage]);

  useInfiniteScroll(loaderRef, onHit);

  const toggleDetails = useCallback(
    async (absoluteIndex: number) => {
      if (openIndex === absoluteIndex) { setOpenIndex(null); return; }
      setOpenIndex(absoluteIndex);
      if (!details[absoluteIndex]) {
        const raw = await fetchDetails({ region, seed, likes, reviews, index: absoluteIndex });
        const det = normalizeDetails(raw);
        setDetails((prev) => ({ ...prev, [absoluteIndex]: det }));
      }
    },
    [openIndex, details, region, seed, likes, reviews, normalizeDetails]
  );

  useEffect(() => { onCountChange?.(cards.length); }, [cards.length, onCountChange]);

  const grid = useMemo(
    () => (
      <div
        className="gallery-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, alignItems: "start" }}
      >
        {cards.map((b) => {
          const isOpen = openIndex === b.index;
          const det = details[b.index];

          return (
            <article
              key={b.index}
              className="card"
              style={{
                borderRadius: 16,
                boxShadow: "0 1px 2px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06)",
                overflow: "hidden",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ width: "100%", aspectRatio: "3/4", background: "#f2f2f2" }}>
                <img
                  src={coverUrlFor(b.index)}
                  alt={b.title}
                  loading="lazy"
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              <div style={{ padding: 12 }}>
                <div
                  className="title"
                  style={{
                    fontWeight: 700,
                    lineHeight: 1.2,
                    marginBottom: 6,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                  title={b.title}
                >
                  {b.title}
                </div>
                <div
                  className="authors"
                  style={{ fontSize: 13, color: "#444", marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                  title={b.authors.join(", ")}
                >
                  {b.authors.join(", ")}
                </div>
                <div className="publisher" style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                  {b.publisher}
                </div>

                <button
                  type="button"
                  onClick={() => void toggleDetails(b.index)}
                  className="btn"
                  style={{ width: "100%", padding: "6px 10px", borderRadius: 10, border: "1px solid #e5e5e5", background: isOpen ? "#f6f6f6" : "#fff", cursor: "pointer" }}
                >
                  {isOpen ? "Hide details" : "Show details"}
                </button>

                {isOpen && det && (
                  <div style={{ marginTop: 10 }}>
                    <div
                      className="pill"
                      style={{ display: "inline-block", padding: "2px 8px", borderRadius: 999, background: "#fee2e2", color: "#991b1b", fontSize: 12, fontWeight: 700 }}
                    >
                      ❤ {det.likes}
                    </div>

                    <div style={{ marginTop: 8, display: "grid", gap: 6 }}>
                      {det.reviews.map((rev, i) => (
                        <div key={i} className="blockquote" style={{ padding: "8px 10px", borderRadius: 10, background: "#fafafa", border: "1px solid #eee", fontSize: 13 }}>
                          <strong>{rev.reviewer}</strong>: {rev.text}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    ),
    [cards, coverUrlFor, openIndex, details, toggleDetails]
  );

  return (
    <div className="gallery-container" style={{ paddingBottom: 24 }}>
      {grid}
      <div ref={loaderRef} style={{ height: 1 }} />
      {loading && <div style={{ padding: 12, textAlign: "center" }}>Loading…</div>}
    </div>
  );
}
