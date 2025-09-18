import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import { BookRow, BookDetails, fetchBooks, fetchDetails } from "../api";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

interface Props {
  region: string;
  seed: number;
  likes: number;
  reviews: number;
  onCountChange?: (count: number) => void;
}

export default function BooksTable({ region, seed, likes, reviews, onCountChange }: Props) {
  const [rows, setRows] = useState<BookRow[]>([]);
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

  // ✅ Normalize whatever the server returns into the TS shape the UI expects
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
      // array/tuple: ["Name", "Text"]
      if (Array.isArray(r)) {
        const [a, b] = r;
        return { reviewer: String(a ?? "").trim(), text: String(b ?? "").trim() };
      }
      // object variants
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
        setRows((prev) => (p === 1 ? batch : [...prev, ...batch]));
      } finally {
        setLoading(false);
      }
    },
    [region, seed, likes, reviews, loading]
  );

  useEffect(() => {
    setRows([]);
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

  const openDetails = useCallback(
    async (idx: number) => {
      if (openIndex === idx) { setOpenIndex(null); return; }
      setOpenIndex(idx);
      if (!details[idx]) {
        try {
          const raw = await fetchDetails({ region, seed, likes, reviews, index: idx });
          const det = normalizeDetails(raw);
          setDetails((prev) => ({ ...prev, [idx]: det }));
        } catch (e) {
          console.error("details fetch failed", e);
        }
      }
    },
    [openIndex, details, region, seed, likes, reviews, normalizeDetails]
  );

  useEffect(() => { onCountChange?.(rows.length); }, [rows.length, onCountChange]);

  const body = useMemo(
    () =>
      rows.map((r) => (
        <React.Fragment key={r.index}>
          <tr className="row" onClick={() => void openDetails(r.index)}>
            <td>{r.index}</td>
            <td>{r.isbn}</td>
            <td>{r.title}</td>
            <td>{r.authors.join(", ")}</td>
            <td>{r.publisher}</td>
          </tr>

          {openIndex === r.index && (
            <tr className="details">
              <td colSpan={5}>
                <div style={{ display: "flex", gap: 16 }}>
                  <img className="cover" src={coverUrlFor(r.index)} alt="cover" />
                  <div>
                    {details[r.index] ? (
                      <>
                        <div className="pill">❤ {details[r.index].likes}</div>
                        <div style={{ marginTop: 8 }}>
                          {details[r.index].reviews.map((rev, i) => (
                            <div className="blockquote" key={i}>
                              <strong>{rev.reviewer}</strong>: {rev.text}
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div style={{ padding: 8, opacity: 0.7 }}>Loading details…</div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          )}
        </React.Fragment>
      )),
    [rows, openIndex, details, openDetails, coverUrlFor]
  );

  return (
    <div className="container">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>ISBN</th>
            <th>Title</th>
            <th>Author(s)</th>
            <th>Publisher</th>
          </tr>
        </thead>
        <tbody>{body}</tbody>
      </table>
      <div ref={loaderRef} style={{ height: 1 }} />
      {loading && <div style={{ padding: 12 }}>Loading…</div>}
    </div>
  );
}
