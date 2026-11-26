import { useRouter, useRouterState } from "@tanstack/react-router";
import { motion } from "motion/react";
import { useEffect, useState, type FormEvent } from "react";
import { TextField } from "@/components/fields";
import { LanguageSwitch, ThemeSwitch } from "@/components/switches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useI18n } from "../i18n";
import { safeRedirect, startSession } from "./session";

export function AuthScreen({ mode }: { mode: "login" | "signup" }) {
  const { t } = useI18n();
  const router = useRouter();
  const redirect = useRouterState({ select: (s) => (s.location.search as { redirect?: string }).redirect });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const signup = mode === "signup";
  const title = signup ? t.auth.signupTitle : t.auth.loginTitle;

  useEffect(() => {
    document.title = `${title} · Perika`;
  }, [title]);

  const emailError = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? undefined : t.auth.errorEmail;
  const passwordError = signup
    ? password.length >= 8 ? undefined : t.auth.errorPasswordShort
    : password ? undefined : t.auth.errorPasswordEmpty;

  function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    if (emailError || passwordError) return;
    startSession(email.trim());
    router.history.replace(safeRedirect(redirect));
  }

  const other = () =>
    router.history.replace(`${signup ? "/login" : "/signup"}${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ""}`);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center md:p-8">
      <motion.main
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full flex-1 flex-col md:max-w-sm md:flex-none"
      >
        <Card className="flex-1 justify-center gap-6 p-6 text-base max-md:rounded-none max-md:bg-transparent max-md:ring-0 md:p-8">
          <div>
            <p className="text-4xl font-semibold text-primary">Perika</p>
            <p className="text-muted-foreground">{t.auth.tagline}</p>
          </div>
          <h1 className="text-xl font-semibold">{title}</h1>
          <form noValidate onSubmit={submit} className="flex flex-col gap-4">
            <TextField
              label={t.auth.email}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={submitted ? emailError : undefined}
            />
            <TextField
              label={t.auth.password}
              type="password"
              autoComplete={signup ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={submitted ? passwordError : undefined}
              hint={signup ? t.auth.passwordHint : undefined}
            />
            <Button type="submit" size="lg">{signup ? t.auth.signup : t.auth.login}</Button>
          </form>
          <Button variant="link" size="lg" className="h-auto min-h-9 whitespace-normal" onClick={other}>
            {signup ? t.auth.toLogin : t.auth.toSignup}
          </Button>
          <p className="text-xs text-muted-foreground">{t.auth.demo}</p>
          <div className="flex flex-wrap justify-between gap-2 border-t pt-4">
            <ThemeSwitch />
            <LanguageSwitch />
          </div>
        </Card>
      </motion.main>
    </div>
  );
}
