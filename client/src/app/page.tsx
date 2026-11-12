"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { toast } from "@/hooks/use-toast";
import { Sun, Moon, AlertCircle, Eye, EyeOff } from "lucide-react";

import Loading from "@/components/Loading";
import { loginApi, registerApi, getProfileApi } from "@/api/auth.api";
import { setIsLoggedIn, setUser, setTheme, setIsChecked } from "@/store/slices/auth.slice";
import { RootState } from "@/store/store";
import { useInputValidation } from "@/hooks/useInputValidation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthBackdrop, AuthStage, AuthStageCompact, PerchedMark } from "@/components/auth/AuthDecor";

export default function RegisterPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [formError, setFormError] = useState("");

  const dispatch = useDispatch();
  const router = useRouter();
  const { isLoggedIn, theme } = useSelector((state: RootState) => state.auth);
  const isDark = theme === "dark" || theme === "business";

  const toggleTheme = () => {
    const newTheme = isDark ? "wireframe" : "business";
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
      setFormError("Enter an email, username and password to register.");
      return;
    }
    setFormError("");
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
      } else {
        setIsPending(false);
      }
    } catch (error: any) {
      console.error("Error during registration:", error);
      setFormError(error?.response?.data?.message || "We couldn't create your account. Please try again.");
      setIsPending(false);
    } finally {
      password.clear();
    }
  };

  const loginApiFunc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.value || !password.value) {
      setFormError("Enter your username and password to log in.");
      return;
    }

    setFormError("");
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
      } else {
        setIsPending(false);
      }
    } catch (error: any) {
      console.error("Error during login:", error);
      setFormError(error?.response?.data?.message || "We couldn't log you in. Check your details and try again.");
      setIsPending(false);
    } finally {
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

  if (isCheckingAuth) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <Loading />
      </div>
    );
  }

  const switchMode = (signUp: boolean) => {
    setIsSignUp(signUp);
    setFormError("");
  };

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-background text-foreground">
      <AuthBackdrop />

      <button
        id="theme-toggle-btn"
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        className="fixed top-4 right-4 z-50 flex size-11 items-center justify-center rounded-xl border-[3px] border-[var(--nb-border-color)] bg-card text-foreground shadow-[var(--nb-shadow-sm)] tap-interactive"
      >
        {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <main className="relative z-10 mx-auto grid min-h-dvh w-full max-w-6xl items-start gap-10 lg:items-center px-4 pt-16 pb-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-20 lg:py-16">
        <AuthStage />

        <div className="mx-auto flex w-full max-w-sm flex-col sm:max-w-md lg:max-w-none lg:self-start lg:pt-[max(6rem,calc(50dvh-19rem))]">
          <AuthStageCompact />

          <div className="auth-card-in relative">
            <PerchedMark />
        <Card className="bg-card">
          <CardHeader className="space-y-5 pb-4">
            <div className="relative grid grid-cols-2 rounded-xl bg-muted p-1">
              <span
                aria-hidden="true"
                className="auth-tab-pill absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg border-[3px] border-[var(--nb-border-color)] bg-primary shadow-[var(--nb-shadow-active)]"
                style={{ transform: isSignUp ? "translateX(0)" : "translateX(100%)" }}
              />
              <button
                id="tab-register"
                type="button"
                aria-pressed={isSignUp}
                onClick={() => switchMode(true)}
                className={`relative z-10 h-10 rounded-lg text-sm font-bold transition-colors duration-200 ${isSignUp ? "text-on-color" : "text-muted-foreground hover:text-foreground"}`}
              >
                Register
              </button>
              <button
                id="tab-login"
                type="button"
                aria-pressed={!isSignUp}
                onClick={() => switchMode(false)}
                className={`relative z-10 h-10 rounded-lg text-sm font-bold transition-colors duration-200 ${!isSignUp ? "text-on-color" : "text-muted-foreground hover:text-foreground"}`}
              >
                Log In
              </button>
            </div>
            <div key={isSignUp ? "register" : "login"} className="auth-fade-in space-y-1">
              <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
                {isSignUp ? "Join the realm" : "Welcome back"}
              </h2>
              <p className="text-sm font-medium text-muted-foreground">
                {isSignUp ? "Pick a username. Friends find you by it." : "Log in to pick up where you left off."}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <form
              onSubmit={isSignUp ? registerApiFunc : loginApiFunc}
              aria-busy={isPending}
              className="space-y-4"
            >
              <fieldset disabled={isPending} className="flex flex-col disabled:[&_input]:opacity-70">
              {/* Email row stays mounted and opens/closes smoothly, so switching modes never jumps. */}
              <div className={`auth-collapse ${isSignUp ? "is-open" : ""}`} aria-hidden={!isSignUp} inert={!isSignUp}>
                <div className="min-h-0 overflow-hidden">
                <div className="space-y-2 pb-4">
                  <label htmlFor="signin-email" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Email Address
                  </label>
                  <Input
                    id="signin-email"
                    autoComplete="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email.value}
                    onChange={email.changeHandler}
                    required={isSignUp}
                  />
                </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="signin-username" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Username
                </label>
                <Input
                  id="signin-username"
                  autoComplete="username"
                  type="text"
                  placeholder="your_username"
                  value={username.value}
                  onChange={username.changeHandler}
                  required
                />
              </div>

              <div className="mt-4 space-y-2">
                <label htmlFor="signin-password" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Password
                </label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    autoComplete={isSignUp ? "new-password" : "current-password"}
                    type={showPassword ? "text" : "password"}
                    placeholder="Your password"
                    value={password.value}
                    onChange={password.changeHandler}
                    className="pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {formError && (
                <p role="alert" className="mt-4 flex items-start gap-2 text-sm font-bold text-nb-danger-text">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  {formError}
                </p>
              )}

              </fieldset>

              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                aria-busy={isPending}
                data-pending={isPending || undefined}
                className="auth-submit relative mt-3 w-full overflow-hidden disabled:opacity-100"
              >
                {isPending ? (
                  <span className="relative z-10 flex items-center gap-3">
                    <span className="auth-hop" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span>{isSignUp ? "Creating your account" : "Logging you in"}</span>
                  </span>
                ) : isSignUp ? (
                  "Register"
                ) : (
                  "Log In"
                )}
              </Button>
              <p className="sr-only" role="status" aria-live="polite">
                {isPending ? (isSignUp ? "Creating your account" : "Logging you in") : ""}
              </p>
            </form>

            {/* <div className="relative flex py-3 items-center">
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
            </div> */}
          </CardContent>
        </Card>
          </div>

          <p className="auth-fade-in mt-5 text-center text-sm font-medium text-muted-foreground" style={{ animationDelay: "0.4s" }}>
            {isSignUp ? "Already have an account?" : "New to EchoRealm?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(!isSignUp)}
              className="font-bold text-foreground underline decoration-[3px] decoration-primary underline-offset-4 hover:decoration-[var(--nb-border-color)]"
            >
              {isSignUp ? "Log in" : "Create an account"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
