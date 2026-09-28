import { Building2, Gauge, Receipt, TrendingUp } from "lucide-react";
import { useTranslations } from "next-intl";
import { AuthIllustration } from "@/components/layout/auth-illustration";

export function AuthLayout(
  { children, eyebrow, title, subtitle }
    :
    { children: React.ReactNode; eyebrow: string; title: string; subtitle: string; }) {
  const t = useTranslations("auth.layout");
  const FEATURES = [
    { icon: Building2, text: t("features.management"), },
    { icon: Gauge, text: t("features.meters"), },
    { icon: Receipt, text: t("features.billing"), },
    { icon: TrendingUp, text: t("features.dashboard"), },
  ];
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[50%] shrink-0 overflow-hidden lg:block">
        <div className="absolute inset-0">
          <AuthIllustration className="h-full w-full" />
        </div>
        <div className="relative flex h-full flex-col justify-between text-white ml-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-2xl font-semibold tracking-tight"> {t("brand")} </span>
          </div>
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-sm font-medium uppercase tracking-wide text-white/60"> {eyebrow} </p>
              <h1 className="max-w-md text-3xl font-semibold leading-tight tracking-tight"> {title} </h1>
              <p className="max-w-md text-sm text-white/70"> {subtitle} </p>
            </div>
            <ul className="space-y-3"> {FEATURES.map((feature) => (
              <li key={feature.text} className="flex items-center gap-3 text-sm text-white/85">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/15">
                  <feature.icon className="h-3.5 w-3.5" />
                </span> {feature.text} </li>))}
            </ul>
          </div>
          <p className="text-xs text-white/40"> {t("footer")} </p>
        </div>
      </div>
      <div className="flex w-full flex-1 items-center justify-center bg-background px-5 py-10 sm:px-6">
        <div className="w-full animate-fade-in-up">
          <div className="mb-8 flex flex-col items-center gap-2 text-center lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-semibold"> {t("brand")} </h1>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}