import React from "react";
import Layout from "./Layout";
import Register from "./pages/Register";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoutues from "./utils/PrivateRoutues";
import LandingPage from "./pages/LandingPage";
import LoggedOut from "./utils/LoggedOut";
import ErrorPage from "./pages/ErrorPage";
import EchoShout from "./pages/stage2/EchoShout";
import EchoLink from "./pages/stage2/EchoLink";
import ListenWhisper from "./pages/stage2/EchoWhisper/ListenWhisper";
import CreateWhisper from "./pages/stage2/EchoWhisper/CreateWhisper";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route element={<LoggedOut />}>
            <Route index element={<Register />} />
          </Route>
          <Route element={<PrivateRoutues />}>
            <Route path="home" element={<LandingPage />} exact />
            <Route path="echo-link" element={<EchoLink />} />
          <Route path="listen-whisper" element={<ListenWhisper />} />

          </Route>
          <Route path="echo-shout" element={<EchoShout />} />
          <Route path="create-whisper" element={<CreateWhisper />} />

        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
