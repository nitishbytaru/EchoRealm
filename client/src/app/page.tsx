"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "@/hooks/use-toast";
import { Sun, Moon } from "lucide-react";

import Loading from "@/components/Loading";
import { loginApi, registerApi, getProfileApi } from "@/api/auth.api";
import { setIsLoggedIn, setUser, setTheme, setIsChecked } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";
import { useInputValidation } from "@/hooks/useInputValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";

export default function RegisterPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoggedIn, theme } = useSelector((state: RootState) => state.auth);
  const isDark = theme === "dark" || theme === "business";

  const toggleTheme = () => {
    const newTheme = isDark ? "light" : "business";
    dispatch(setTheme(newTheme));
    dispatch(setIsChecked(!isDark));
    localStorage.setItem("theme", newTheme);
  };

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
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-background text-foreground">
      {/* Theme toggle — top right corner */}
      <button
        id="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-xl bg-card border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)] hover:-translate-y-0.5 hover:shadow-[var(--nb-shadow)] active:translate-y-0.5 active:shadow-[var(--nb-shadow-active)] transition-all duration-150 text-foreground"
      >
        {isDark ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            EchoRealm
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            Connecting voices in a modern, secure workspace
          </p>
        </div>

        <Card className="bg-card">
          <CardHeader className="space-y-4 pb-4">
            <div className="relative flex justify-center border-b-[3px] border-[var(--nb-border-color)] pb-3">
              <button
                id="tab-register"
                type="button"
                className={`flex-1 py-2 text-center text-sm font-bold transition-all duration-150 rounded-xl mx-1 ${
                  isSignUp
                    ? "bg-primary text-primary-foreground border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]"
                    : "text-muted-foreground border-[3px] border-transparent hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsSignUp(true)}
              >
                Register
              </button>
              <button
                id="tab-login"
                type="button"
                className={`flex-1 py-2 text-center text-sm font-bold transition-all duration-150 rounded-xl mx-1 ${
                  !isSignUp
                    ? "bg-secondary text-secondary-foreground border-[3px] border-[var(--nb-border-color)] shadow-[var(--nb-shadow-sm)]"
                    : "text-muted-foreground border-[3px] border-transparent hover:text-foreground hover:bg-muted"
                }`}
                onClick={() => setIsSignUp(false)}
              >
                Log In
              </button>
            </div>
            <CardDescription className="text-center text-muted-foreground text-sm font-medium">
              {isSignUp ? "Create an account to start chatting" : "Welcome back! Please enter your details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <form onSubmit={isSignUp ? registerApiFunc : loginApiFunc} className="space-y-4">
              {isSignUp && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="daisy@site.com"
                    value={email.value}
                    onChange={email.changeHandler}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Username
                </label>
                <Input
                  type="text"
                  placeholder="user24"
                  value={username.value}
                  onChange={username.changeHandler}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password.value}
                  onChange={password.changeHandler}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full mt-3"
                size="lg"
              >
                {isSignUp ? "Register" : "Login"}
              </Button>
            </form>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow h-[3px] bg-[var(--nb-border-color)]"></div>
              <span className="flex-shrink mx-4 text-muted-foreground text-xs font-bold uppercase tracking-wider">Or continue with</span>
              <div className="flex-grow h-[3px] bg-[var(--nb-border-color)]"></div>
            </div>

            <div className="flex justify-center w-full pt-1">
              <GoogleLogin
                onSuccess={responseMessage}
                onError={errorMessage}
                theme={isDark ? "filled_black" : "outline"}
                shape="pill"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
