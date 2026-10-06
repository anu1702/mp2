import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { BrowseProvider } from './context/BrowseContext.tsx'
import DetailView from './pages/DetailView.tsx'
import GalleryView from './pages/GalleryView.tsx'
import ListView from './pages/ListView.tsx'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '')

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <BrowseProvider>
        <Routes>
          <Route path="/" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/movie/:id" element={<DetailView />} />
        </Routes>
      </BrowseProvider>
    </BrowserRouter>
  )
}
