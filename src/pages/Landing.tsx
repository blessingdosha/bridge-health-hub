import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  ClipboardCheck,
  Heart,
  MapPin,
  Shield,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Stethoscope,
    title: "Shared equipment visibility",
    description:
      "See what equipment exists across approved hospitals so referrals and transfers stay realistic.",
  },
  {
    icon: ClipboardCheck,
    title: "Structured requests",
    description:
      "Create equipment requests with clear source and destination hospitals—track status end to end.",
  },
  {
    icon: Building2,
    title: "Hospital-first directory",
    description:
      "Browse hospitals, drill into profiles, equipment inventory, and clinical team context.",
  },
  {
    icon: MapPin,
    title: "Map locator",
    description:
      "Visualize hospital locations and proximity using city, state, and coordinates.",
  },
  {
    icon: Sparkles,
    title: "Smart suggestions",
    description:
      "Optional AI-assisted ranking to surface hospitals that match equipment needs and distance.",
  },
  {
    icon: Users,
    title: "Patient coordination",
    description:
      "Support patient records sharing and visit scheduling tied to approved requests.",
  },
];

const steps = [
  { step: "01", title: "Register your hospital", detail: "One organization profile with location context." },
  { step: "02", title: "Catalog equipment", detail: "Keep availability visible to your trusted network." },
  { step: "03", title: "Request & approve", detail: "Clinical workflows for decisions and documentation." },
  { step: "04", title: "Deliver care", detail: "Schedule visits and share results through secure flows." },
];

function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate(user.must_change_password ? "/change-password" : "/dashboard", {
        replace: true,
      });
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-9 w-9 border-2 border-muted border-t-primary" />
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight text-foreground transition-opacity hover:opacity-90"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Heart className="h-5 w-5 fill-current" aria-hidden />
            </span>
            <span className="hidden sm:inline text-lg">MedBridge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
              <Link to="/auth">Sign in</Link>
            </Button>
            <Button size="sm" className="gap-1.5 shadow-sm" asChild>
              <Link to="/auth">
                Register hospital
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-border/40">
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-24">
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                <Shield className="h-3.5 w-3.5 text-accent" aria-hidden />
                Built for hospital collaboration, not consumer booking
              </p>
              <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
                Coordinate equipment, referrals, and outcomes across hospitals
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed">
                MedBridge connects approved hospitals so clinical teams can discover capacity, request equipment use,
                approve workflows on the doctor side, and document visits and results—without losing the human decision
                layer.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                <Button size="lg" className="min-w-[200px] gap-2 shadow-md" asChild>
                  <Link to="/auth">
                    Get started
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="min-w-[200px] bg-card/80 backdrop-blur-sm" asChild>
                  <a href="#features">Explore features</a>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-b border-border/40 bg-muted/25 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Everything in one operational workspace
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Purpose-built screens for inventory, requests, mapping, and optional intelligence—aligned with how
                hospitals actually collaborate.
              </p>
            </div>
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }) => (
                <li
                  key={title}
                  className={cn(
                    "group rounded-xl border border-border/70 bg-card p-6 shadow-sm",
                    "transition-[box-shadow,transform] duration-200 hover:shadow-md hover:-translate-y-0.5",
                  )}
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </div>
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section id="how-it-works" className="scroll-mt-20 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">How it works</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                A straightforward flow from onboarding to clinical documentation—with approvals on the doctor side.
              </p>
            </div>
            <ol className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((item, i) => (
                <li key={item.step} className="relative flex flex-col">
                  {i < steps.length - 1 ? (
                    <div
                      className="absolute left-[1.35rem] top-12 hidden h-px w-[calc(100%-2rem)] bg-border lg:block"
                      aria-hidden
                    />
                  ) : null}
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-sm font-bold text-accent-foreground shadow-sm">
                    {item.step}
                  </span>
                  <h3 className="mt-4 font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.detail}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-y border-border/40 bg-primary py-16 text-primary-foreground sm:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Ready to connect your hospital network?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-primary-foreground/85 text-sm sm:text-base leading-relaxed">
              Create an account for your organization or sign in if your hospital is already on MedBridge.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="min-w-[180px] gap-2 text-primary shadow-md"
                asChild
              >
                <Link to="/auth">
                  Sign in or register
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 bg-muted/30 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Heart className="h-5 w-5 text-primary fill-primary/20" aria-hidden />
            MedBridge
          </div>
          <p className="text-center text-xs text-muted-foreground sm:text-right">
            © {new Date().getFullYear()} MedBridge · Equipment coordination for hospitals
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/auth" className="text-muted-foreground transition-colors hover:text-foreground">
              Sign in
            </Link>
            <Link to="/auth" className="text-muted-foreground transition-colors hover:text-foreground">
              Hospital registration
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
