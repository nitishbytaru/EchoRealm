import { lazy, Suspense, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";

// Utility Components
import PrivateRoutes from "./utils/PrivateRoutues";
import LoggedOut from "./utils/LoggedOut";
import { normalLoading } from "./components/Loaders/LoadingAnimations.jsx";

// API & Redux
import { getProfileApi } from "./api/authApi.js";
import { setIsLoggedIn, setUser } from "./app/slices/authSlice.js";

// Lazy Loaded Components
const Layout = lazy(() => import("./Layout"));
const Register = lazy(() => import("./pages/Register"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));
const EchoShout = lazy(() => import("./pages/stage2/EchoShout"));
const EchoLink = lazy(() => import("./pages/stage2/EchoLink"));
const ListenMumble = lazy(() =>
  import("./pages/stage2/EchoMumble/ListenMumble")
);
const CreateMumble = lazy(() =>
  import("./pages/stage2/EchoMumble/CreateMumble")
);

// Profile Components
const MyProfile = lazy(() => import("./pages/stage2/MyProfile.jsx"));
const MyProfileDetails = lazy(() =>
  import("./components/profile/MyProfileDetails.jsx")
);
const MyMumbles = lazy(() => import("./components/profile/MyMumbles.jsx"));
const BlockedUsers = lazy(() =>
  import("./components/profile/BlockedUsers.jsx")
);
const FindUsers = lazy(() => import("./components/profile/FindUsers.jsx"));
const MyAccount = lazy(() => import("./components/profile/MyAccount.jsx"));
const MyFriends = lazy(() => import("./components/profile/MyFriends.jsx"));
const MyFriendRequests = lazy(() =>
  import("./components/profile/MyFriendRequests.jsx")
);
const ViewProfile = lazy(() => import("./components/profile/ViewProfile.jsx"));

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    if (JSON.parse(localStorage.getItem("allowFetch"))) {
      getProfileApi()
        .then((response) => {
          if (response) {
            dispatch(setUser(response?.data?.user));
            dispatch(setIsLoggedIn(true));
          }
        })
        .catch((err) => console.error(err));
    }
  }, [dispatch]);

  return (
    <Router>
      <Suspense fallback={normalLoading()}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Routes for logged-out users */}
            <Route element={<LoggedOut user={user} />}>
              <Route index element={<Register />} />
            </Route>

            {/* Routes for authenticated users */}
            <Route element={<PrivateRoutes user={user} />}>
              <Route path="echo-link" element={<EchoLink />} />
              <Route path="echo-link/:recieverId" element={<EchoLink />} />
              <Route path="create-mumble" element={<CreateMumble />} />
              <Route
                path="create-mumble/:mumbleTo"
                element={<CreateMumble />}
              />
              <Route path="listen-mumble" element={<ListenMumble />} />

              {/* Nested profile routes */}
              <Route path="about" element={<MyProfile />}>
                <Route path="edit-details" element={<MyProfileDetails />} />
                <Route path="my-mumbles" element={<MyMumbles />} />
                <Route path="blocked-users" element={<BlockedUsers />} />
                <Route path="find-users" element={<FindUsers />} />
                <Route path="account" element={<MyAccount />} />
                <Route path="friend-requests" element={<MyFriendRequests />} />
                <Route path="my-friends" element={<MyFriends />} />
                <Route
                  path="view-profile/:viewProfileUserId"
                  element={<ViewProfile />}
                />
              </Route>
            </Route>

            {/* Public routes */}
            <Route path="echo-shout" element={<EchoShout />} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<ErrorPage />} />
        </Routes>
      </Suspense>
      <Toaster position="top-left" />
    </Router>
  );
}

export default App;
