import React from 'react'

type Props = {
  region: string;
  seed: number;
  likes: number;
  reviews: number;
  onChange: (patch: Partial<Props>) => void;
  onShuffle: () => void;
  onExport: () => void;
  total: number;
}

export default function Controls(p: Props) {
  return (
    <header>
      <label>
        Language/Region<br/>
        <select value={p.region} onChange={(e)=>p.onChange({region:e.target.value})}>
          <option value="us">English (US)</option>
          <option value="fr">Français (France)</option>
          <option value="tr">Türkçe (Türkiye)</option>
        </select>
      </label>

      <label>
        Seed<br/>
        <input type="number" value={p.seed} onChange={e=>p.onChange({seed: Number(e.target.value)})} />
      </label>
      <div className="toolbar">
        <button onClick={p.onShuffle} title="Shuffle">🔀</button>
      </div>

      <label>
        Likes (avg)<br/>
        <input type="range" min={0} max={10} step={0.1} value={p.likes} onChange={e=>p.onChange({likes: Number(e.target.value)})} />
        <div><small className="mono">{p.likes.toFixed(1)}</small></div>
      </label>

      <label>
        Reviews (avg)<br/>
        <input type="number" min={0} max={10} step={0.1} value={p.reviews} onChange={e=>p.onChange({reviews: Number(e.target.value)})} />
      </label>

      <div className="toolbar">
        <button onClick={p.onExport}>Export CSV</button>
        <small className="mono">rows: {p.total}</small>
      </div>
    </header>
  )
}
