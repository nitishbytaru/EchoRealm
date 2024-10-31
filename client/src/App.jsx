import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";


// importing components
import PrivateRoutues from "./utils/PrivateRoutues";
import LoggedOut from "./utils/LoggedOut";



//lazy loading
const Layout = lazy(() => import("./Layout"));
const Register = lazy(() => import("./pages/Register"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const EchoShout = lazy(() => import("./pages/stage2/EchoShout"));
const EchoLink = lazy(() => import("./pages/stage2/EchoLink"));
const ListenWhisper = lazy(() =>  import("./pages/stage2/EchoWhisper/ListenWhisper"));
const CreateWhisper = lazy(() =>  import("./pages/stage2/EchoWhisper/CreateWhisper"));

function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
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
      </Suspense>
      <Toaster position="top-center" />
    </Router>
  );
}

export default App;
