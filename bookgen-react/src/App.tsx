import React from 'react'
import Controls from './components/Controls'
import BooksTable from './components/BooksTable'
import { exportCsv } from './api'
import BooksGallery from './components/BooksGallery'

export default function App() {
  const [region, setRegion] = React.useState<'us'|'fr'|'tr'>('us')
  const [seed, setSeed] = React.useState<number>(() => Math.floor(Math.random()*1e9))
  const [likes, setLikes] = React.useState(4.7)
  const [reviews, setReviews] = React.useState(4.7)
  const [total, setTotal] = React.useState(20)

  const onChange = (patch: Partial<{region:string;seed:number;likes:number;reviews:number;}>) => {
    if (patch.region) setRegion(patch.region as any)
    if (patch.seed !== undefined) setSeed(patch.seed)
    if (patch.likes !== undefined) setLikes(patch.likes)
    if (patch.reviews !== undefined) setReviews(patch.reviews)
  }

  const onShuffle = () => setSeed(Math.floor(Math.random()*1e9))

  const onExport = () => exportCsv({ region, seed, likes, reviews, total })

  return (
    <>
      <Controls
        region={region}
        seed={seed}
        likes={likes}
        reviews={reviews}
        onChange={onChange}
        onShuffle={onShuffle}
        onExport={onExport}
        total={total}
      />
      <BooksGallery //layout change <BooksTable <-> <BooksGallery
        region={region}
        seed={seed}
        likes={likes}
        reviews={reviews}
        onCountChange={setTotal}  // keep CSV in sync with what's displayed
      />
    </>
  )
}
