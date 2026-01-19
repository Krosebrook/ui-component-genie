import { DashboardLayout } from './components/layout/DashboardLayout';
import { GeneratorPage } from './pages/GeneratorPage';
import { LibraryPage } from './pages/LibraryPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<GeneratorPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/browse" element={<div>Browse Community coming soon...</div>} />
          <Route path="/settings" element={<div>Settings coming soon...</div>} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;