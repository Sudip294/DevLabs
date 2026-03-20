import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import KeyboardTest from './pages/KeyboardTest';
import MouseTest from './pages/MouseTest';
import ScreenTest from './pages/ScreenTest';
import MediaTest from './pages/MediaTest';
import SpeakerTest from './pages/SpeakerTest';
import NetworkTest from './pages/NetworkTest';
import TouchTest from './pages/TouchTest';
import SensorsTest from './pages/SensorsTest';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="keyboard" element={<KeyboardTest />} />
          <Route path="mouse" element={<MouseTest />} />
          <Route path="screen" element={<ScreenTest />} />
          <Route path="media" element={<MediaTest />} />
          <Route path="speaker" element={<SpeakerTest />} />
          <Route path="network" element={<NetworkTest />} />
          <Route path="touch" element={<TouchTest />} />
          <Route path="sensors" element={<SensorsTest />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
