import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

// importing components
import PrivateRoutues from "./utils/PrivateRoutues";
import LoggedOut from "./utils/LoggedOut";
import { normalLoading } from "./components/Loaders/LoadingAnimations.jsx";
import { getProfile } from "./api/userApi.js";
import { setIsLoggedIn, setUser } from "./app/slices/authSlice.js";
import MyProfile from "./pages/stage2/MyProfile.jsx";

//lazy loading
const Layout = lazy(() => import("./Layout"));
const Register = lazy(() => import("./pages/Register"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const EchoShout = lazy(() => import("./pages/stage2/EchoShout"));
const EchoLink = lazy(() => import("./pages/stage2/EchoLink"));
const FindUsers = lazy(() => import("./components/profile/FindUsers.jsx"));
const MyAccount = lazy(() => import("./components/profile/MyAccount.jsx"));
const MyWhispers = lazy(() => import("./components/profile/MyWhispers.jsx"));
const ViewProfile = lazy(() => import("./components/profile/ViewProfile.jsx"));
const MyProfileDetails = lazy(() =>
  import("./components/profile/MyProfileDetails.jsx")
);
const ListenWhisper = lazy(() =>
  import("./pages/stage2/EchoWhisper/ListenWhisper")
);
const CreateWhisper = lazy(() =>
  import("./pages/stage2/EchoWhisper/CreateWhisper")
);
const BlockedUsers = lazy(() =>
  import("./components/profile/BlockedUsers.jsx")
);

function App() {
  const { user } = useSelector((state) => state.auth);

  const dispatch = useDispatch();

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("allowFetch"))) {
      getProfile()
        .then((response) => {
          if (response) {
            dispatch(setUser(response?.data?.user));
            dispatch(setIsLoggedIn(true));
          }
        })
        .catch((err) => console.log(err));
    }
  }, [dispatch]);

  return (
    <Router>
      <Suspense fallback={normalLoading()}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route element={<LoggedOut user={user} />}>
              <Route index element={<Register />} />
            </Route>
            <Route element={<PrivateRoutues user={user} />}>
              <Route path="echo-link" element={<EchoLink />} exact />
              <Route path="create-whisper" element={<CreateWhisper />} />
              <Route path="listen-whisper" element={<ListenWhisper />} />
              <Route path="about" element={<MyProfile />}>
                <Route path="edit-details" element={<MyProfileDetails />} />
                <Route path="my-whispers" element={<MyWhispers />} />
                <Route path="blocked-users" element={<BlockedUsers />} />
                <Route path="find-users" element={<FindUsers />} />
                <Route path="account" element={<MyAccount />} />
                <Route
                  path="view-profile/:viewProfileUserId"
                  element={<ViewProfile />}
                />
              </Route>
            </Route>
            <Route path="echo-shout" element={<EchoShout />} />
          </Route>
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
      <Toaster position="top-left" />
    </Router>
  );
}

export default App;
