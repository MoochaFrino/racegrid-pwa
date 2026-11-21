import { BrowserRouter, Routes, Route } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import OfflineBanner from "./components/OfflineBanner";
import Home from "./pages/Home";
import Schedule from "./pages/Schedule";
import Circuits from "./pages/Circuits";
import CircuitDetail from "./pages/CircuitDetail";
import Teams from "./pages/Teams";
import TeamDetail from "./pages/TeamDetail";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#111115] bg-telemetry-pattern text-zinc-100 pb-20">
        <OfflineBanner />
        <main className="max-w-md mx-auto px-4 py-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/circuits" element={<Circuits />} />
            <Route path="/circuits/:id" element={<CircuitDetail />} />
            <Route path="/teams" element={<Teams />} />
            <Route path="/teams/:id" element={<TeamDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}
