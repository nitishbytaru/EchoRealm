"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";

import Loading from "@/components/Loading";
import { loginApi, registerApi, getProfileApi } from "@/api/auth.api";
import { setIsLoggedIn, setUser } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";
import { useInputValidation } from "@/hooks/useInputValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RegisterPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const dispatch = useDispatch();
  const router = useRouter();
  const { isMobile, isLoggedIn } = useSelector((state: RootState) => state.auth);

  const email = useInputValidation("");
  const username = useInputValidation("");
  const password = useInputValidation("");

  // Check auth status on mount
  useEffect(() => {
    const allowFetch = localStorage.getItem("allowFetch") === "true";
    if (allowFetch) {
      (async () => {
        try {
          const response = await getProfileApi();
          if (response?.data?.user) {
            dispatch(setUser(response.data.user));
            dispatch(setIsLoggedIn(true));
            router.push("/links");
          }
        } catch (err) {
          console.error("Profile fetch failed: ", err);
        } finally {
          setIsCheckingAuth(false);
        }
      })();
    } else {
      setIsCheckingAuth(false);
    }
  }, [dispatch, router]);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn) {
      router.push("/links");
    }
  }, [isLoggedIn, router]);

  const registerApiFunc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.value || !username.value || !password.value) {
      toast.error("All fields are required for registration.");
      return;
    }
    setIsPending(true);
    try {
      const response = await registerApi({
        username: username.value,
        password: password.value,
        email: email.value,
      });
      if (response?.data) {
        dispatch(setIsLoggedIn(true));
        dispatch(setUser(response.data.user));
        localStorage.setItem("allowFetch", "true");
        toast.success("Registration successful");
        router.push("/links");
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      toast.error(error?.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setIsPending(false);
      email.clear();
      username.clear();
      password.clear();
    }
  };

  const loginApiFunc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.value || !password.value) {
      toast.error("Username and password are required.");
      return;
    }

    setIsPending(true);
    try {
      const response = await loginApi({
        username: username.value,
        password: password.value,
      });
      if (response?.data) {
        dispatch(setIsLoggedIn(true));
        dispatch(setUser(response.data.user));
        localStorage.setItem("allowFetch", "true");
        toast.success(response.data.message || "Logged in successfully");
        router.push("/links");
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      toast.error(error?.response?.data?.message || "Failed to log in. Please check your credentials.");
    } finally {
      setIsPending(false);
      username.clear();
      password.clear();
    }
  };

  const responseMessage = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      toast.error("Google authentication failed.");
      return;
    }

    const decodedToken: any = jwtDecode(credentialResponse.credential);

    const payload: any = {
      username: decodedToken.given_name,
      password: decodedToken.sub,
    };

    if (isSignUp) {
      payload.avatarUrl = decodedToken.picture;
      payload.email = decodedToken.email;
      setIsPending(true);
      try {
        const apiResponse = await registerApi(payload);
        if (apiResponse?.data) {
          dispatch(setIsLoggedIn(true));
          dispatch(setUser(apiResponse.data.user));
          localStorage.setItem("allowFetch", "true");
          toast.success("Registration successful");
          router.push("/links");
        }
      } catch (error: any) {
        console.error("Registration error:", error);
        toast.error(error?.response?.data?.message || "Failed to register with Google.");
      } finally {
        setIsPending(false);
      }
    } else {
      setIsPending(true);
      try {
        const apiResponse = await loginApi(payload);
        if (apiResponse?.data) {
          localStorage.setItem("allowFetch", "true");
          dispatch(setIsLoggedIn(true));
          dispatch(setUser(apiResponse.data.user));
          toast.success(apiResponse.data.message || "Logged in successfully");
          router.push("/links");
        }
      } catch (error: any) {
        console.error("Login error:", error);
        toast.error(error?.response?.data?.message || "Failed to log in with Google.");
      } finally {
        setIsPending(false);
      }
    }
  };

  const errorMessage = () => {
    toast.error("Google login failed");
  };

  if (isCheckingAuth || isPending) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-radial from-slate-900 to-black">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-radial from-slate-950 via-slate-900 to-black text-white selection:bg-indigo-500 selection:text-white">
      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
            EchoRealm
          </h1>
          <p className="text-sm text-slate-400">
            Connecting voices in a modern, secure workspace
          </p>
        </div>

        <Card className="border-slate-800 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="space-y-4 pb-4">
            <div className="relative flex justify-center border-b border-slate-800 pb-2">
              <button
                className={`flex-1 py-2 text-center text-sm font-semibold transition-colors duration-200 ${
                  isSignUp ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setIsSignUp(true)}
              >
                Register
              </button>
              <button
                className={`flex-1 py-2 text-center text-sm font-semibold transition-colors duration-200 ${
                  !isSignUp ? "text-indigo-400" : "text-slate-400 hover:text-slate-200"
                }`}
                onClick={() => setIsSignUp(false)}
              >
                Log In
              </button>
              <div
                className="absolute bottom-0 h-0.5 bg-indigo-500 transition-all duration-300 ease-in-out"
                style={{
                  width: "50%",
                  transform: `translateX(${isSignUp ? "0%" : "100%"})`,
                }}
              />
            </div>
            <CardDescription className="text-center text-slate-400">
              {isSignUp ? "Create an account to start chatting" : "Welcome back! Please enter your details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={isSignUp ? registerApiFunc : loginApiFunc} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="daisy@site.com"
                    value={email.value}
                    onChange={email.changeHandler}
                    className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="user24"
                  value={username.value}
                  onChange={username.changeHandler}
                  className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password.value}
                  onChange={password.changeHandler}
                  className="bg-slate-900/50 border-slate-800 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold shadow-lg shadow-indigo-500/20"
              >
                {isSignUp ? "Register" : "Login"}
              </Button>
            </form>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-slate-500 text-xs font-medium uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <div className="flex justify-center w-full">
              <GoogleLogin
                onSuccess={responseMessage}
                onError={errorMessage}
                theme="filled_black"
                shape="pill"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
