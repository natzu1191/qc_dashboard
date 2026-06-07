import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ControlApp } from './ControlApp';
import { TVApp } from './pages/tv/TVApp';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/tv" element={<TVApp />} />
        <Route path="/*" element={<ControlApp />} />
      </Routes>
    </BrowserRouter>
  );
}
