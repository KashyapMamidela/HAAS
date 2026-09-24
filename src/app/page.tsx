import Link from "next/link";
import { Bone, Heart, PersonStanding, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/app/theme-toggle";

const DEPARTMENTS = [
  {
    name: "Cardiology",
    description: "Heart health, checkups and long-term care.",
    icon: Heart,
  },
  {
    name: "Dermatology",
    description: "Skin, hair and nail conditions.",
    icon: Sparkles,
  },
  {
    name: "Pediatrics",
    description: "Care for infants, children and teens.",
    icon: PersonStanding,
  },
  {
    name: "Orthopedics",
    description: "Bones, joints and muscle injuries.",
    icon: Bone,
  },
];

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col bg-bg">
      <header className="flex items-center justify-between px-4 py-5 sm:px-6">
        <span className="font-heading text-lg font-medium text-text">HAAS</span>
        <ThemeToggle />
      </header>

      <main className="flex-1">
        <section className="mx-auto flex max-w-[1100px] flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 sm:py-24">
          <h1 className="max-w-2xl font-heading text-3xl font-medium text-text sm:text-4xl">
            Care, without the waiting room
          </h1>
          <p className="max-w-md text-base text-text-muted">
            Book appointments with the right doctor in minutes, and keep every
            prescription and record in one place.
          </p>
          <div className="flex flex-col items-center gap-3">
            <Button size="lg" nativeButton={false} render={<Link href="/signup" />}>
              Book an appointment
            </Button>
            <p className="text-sm text-text-muted">
              Already have an account?{" "}
              <Link href="/login/patient" className="font-medium text-accent hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-[1100px] px-4 pb-20 sm:px-6">
          <h2 className="mb-6 text-center font-heading text-xl font-medium text-text">
            Departments
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {DEPARTMENTS.map((dept) => (
              <div
                key={dept.name}
                className="flex flex-col items-center gap-2 rounded-xl border border-border bg-surface p-5 text-center"
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                  <dept.icon className="size-5" strokeWidth={1.5} />
                </span>
                <p className="text-sm font-medium text-text">{dept.name}</p>
                <p className="text-xs text-text-muted">{dept.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-3 text-sm text-text-muted sm:flex-row">
          <span>© {new Date().getFullYear()} HAAS. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/login/doctor" className="hover:text-text hover:underline">
              Doctor sign in
            </Link>
            <Link href="/login/admin" className="hover:text-text hover:underline">
              Admin sign in
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
