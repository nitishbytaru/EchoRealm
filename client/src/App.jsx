import { Toaster } from "react-hot-toast";
import { lazy, Suspense, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Utility Components
import LoggedOut from "./pages/LoggedOut.jsx";
import PrivateRoutes from "./pages/PrivateRoutes.jsx";

// API
import { getProfileApi } from "./api/auth.api.js";
//Redux
import { setIsLoggedIn, setUser } from "./app/slices/auth.slice.js";

//Views
import { EchoLink } from "./features/echoLink/index.js";
import { EchoShout } from "./features/echoShout/index.js";
import { CreateMumble, ListenMumble } from "./features/echoMumble/index.js";

// Profile Components
import {
  MyProfile,
  MyProfileDetails,
  MyAccount,
  MyMumbles,
  BlockedUsers,
  FindUsers,
  MyFriends,
  MyFriendRequests,
  ViewProfile,
} from "./features/profile/index.js";
import Loading from "./components/Loading.jsx";

const Layout = lazy(() => import("./Layout"));
const Register = lazy(() => import("./pages/Register"));
const ErrorPage = lazy(() => import("./pages/ErrorPage"));

function App() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    const allowFetch = JSON.parse(localStorage.getItem("allowFetch"));
    if (allowFetch) {
      (async () => {
        try {
          const response = await getProfileApi();
          if (response) {
            dispatch(setUser(response?.data?.user));
            dispatch(setIsLoggedIn(true));
          }
        } catch (err) {
          console.error("Profile fetch failed: ", err);
        }
      })();
    }
  }, [dispatch]);

  return (
    <Router>
      <Suspense
        fallback={
          <div className="h-screen w-screen">
            <Loading />
          </div>
        }
      >
        <Routes>
          {/* Main Layout */}
          <Route path="/" element={<Layout />}>
          <Route path="shout" element={<EchoShout />} />
            {/* Public Routes */}
            <Route element={<LoggedOut user={user} />}>
              <Route path="" element={<Register />} />
            </Route>

            {/* Authenticated Routes */}
            <Route element={<PrivateRoutes user={user} />}>
              <Route path="links/:recieverId?" element={<EchoLink />} />
              <Route
                path="mumbles/send/:mumbleTo?"
                element={<CreateMumble />}
              />
              <Route path="mumbles/read" element={<ListenMumble />} />

              {/* Nested profile routes */}
              <Route path="profile" element={<MyProfile />}>
                <Route path="edit" element={<MyProfileDetails />} />
                <Route path="mumbles" element={<MyMumbles />} />
                <Route path="blocked-users" element={<BlockedUsers />} />
                <Route path="find-users" element={<FindUsers />} />
                <Route path="account" element={<MyAccount />} />
                <Route path="friends">
                  <Route path="requests" element={<MyFriendRequests />} />
                  <Route path="list" element={<MyFriends />} />
                </Route>

                <Route
                  path="view/:viewProfileUserId"
                  element={<ViewProfile />}
                />
              </Route>
            </Route>
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
