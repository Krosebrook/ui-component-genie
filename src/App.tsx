import { DashboardLayout } from './components/layout/DashboardLayout';
import { GeneratorPage } from './pages/GeneratorPage';
import { LibraryPage } from './pages/LibraryPage';
import { CommunityPage } from './pages/CommunityPage';
import { SettingsPage } from './pages/SettingsPage';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <DashboardLayout>
        <Routes>
          <Route path="/" element={<GeneratorPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/browse" element={<CommunityPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </DashboardLayout>
    </BrowserRouter>
  );
}

export default App;