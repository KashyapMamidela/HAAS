"use client";

import { useState } from "react";
import {
  CalendarDays,
  FileText,
  Inbox,
  Stethoscope,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

import { EmptyState } from "@/components/app/empty-state";
import { PageHeader } from "@/components/app/page-header";
import { StatCard } from "@/components/app/stat-card";
import { Stepper } from "@/components/app/stepper";
import { StatusPill, type Status } from "@/components/app/status-pill";
import { ThemeToggle } from "@/components/app/theme-toggle";

const STATUSES: Status[] = [
  "pending",
  "confirmed",
  "checked_in",
  "in_consultation",
  "completed",
  "cancelled",
  "no_show",
];

const COLOR_TOKENS = [
  { name: "bg", label: "Background" },
  { name: "surface", label: "Surface" },
  { name: "surface-muted", label: "Surface muted" },
  { name: "border", label: "Border" },
  { name: "text", label: "Text" },
  { name: "text-muted", label: "Text muted" },
  { name: "accent", label: "Accent" },
  { name: "accent-soft", label: "Accent soft" },
  { name: "success", label: "Success" },
  { name: "warning", label: "Warning" },
  { name: "danger", label: "Danger" },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border-t border-border pt-8 first:border-t-0 first:pt-0">
      <div>
        <h2 className="font-heading text-xl font-medium text-text">{title}</h2>
        {description && <p className="text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function StyleguidePage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  return (
    <div className="min-h-svh bg-bg">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-10 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Styleguide"
            subtitle="Warm, minimal, calm — every shared component in one place."
          />
          <ThemeToggle />
        </div>

        <Section title="Colour tokens" description="Defined in src/app/globals.css, light and dark.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {COLOR_TOKENS.map((token) => (
              <div key={token.name} className="space-y-1.5">
                <div
                  className="h-14 rounded-lg border border-border"
                  style={{ background: `var(--${token.name})` }}
                />
                <p className="text-xs font-medium text-text">{token.label}</p>
                <p className="text-xs text-text-muted">--{token.name}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="Typography" description="Source Serif 4 for headings, Inter for body. Sentence case throughout.">
          <div className="space-y-3">
            <p className="font-heading text-3xl font-medium text-text">Care, without the waiting room</p>
            <p className="font-heading text-2xl font-medium text-text">Book an appointment</p>
            <p className="font-heading text-xl font-medium text-text">Your next appointment</p>
            <p className="text-base text-text">
              Body text at 16px with 1.6 line height, used for the bulk of reading content across
              every portal.
            </p>
            <p className="text-sm text-text-muted">Meta and label text at 14px, usually muted.</p>
            <p className="text-xs text-text-muted">Fine print at 13px.</p>
          </div>
        </Section>

        <Section title="Status pills">
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((status) => (
              <StatusPill key={status} status={status} />
            ))}
          </div>
        </Section>

        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Book an appointment</Button>
            <Button variant="outline">Reschedule</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Cancel appointment</Button>
            <Button variant="link">View details</Button>
            <Button disabled>Disabled</Button>
          </div>
        </Section>

        <Section title="Form controls">
          <div className="grid max-w-md gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="sg-name">Full name</Label>
              <Input id="sg-name" placeholder="Anita Sharma" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sg-department">Department</Label>
              <Select
                items={{
                  cardiology: "Cardiology",
                  dermatology: "Dermatology",
                  pediatrics: "Pediatrics",
                }}
                defaultValue="cardiology"
              >
                <SelectTrigger id="sg-department" className="w-full">
                  <SelectValue placeholder="Choose a department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cardiology">Cardiology</SelectItem>
                  <SelectItem value="dermatology">Dermatology</SelectItem>
                  <SelectItem value="pediatrics">Pediatrics</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sg-reason">Reason for visit</Label>
              <Textarea id="sg-reason" placeholder="Briefly describe your symptoms" />
            </div>
          </div>
        </Section>

        <Section title="Cards & stats">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Today's appointments" value={18} icon={CalendarDays} />
            <StatCard label="Pending" value={4} icon={Inbox} trend="2 need review" />
            <StatCard label="Completed today" value={11} icon={Stethoscope} />
            <StatCard label="Doctors on leave" value={1} icon={Users} />
          </div>
          <Card className="max-w-sm">
            <CardHeader>
              <CardTitle>Dr. Meera Rao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-text-muted">Cardiology · ₹800 fee</p>
              <StatusPill status="confirmed" />
            </CardContent>
          </Card>
        </Section>

        <Section title="Stepper">
          <Stepper
            steps={["Department", "Doctor", "Date & time", "Confirm"]}
            currentStep={2}
          />
        </Section>

        <Section title="Empty state">
          <EmptyState
            icon={CalendarDays}
            title="No appointments yet"
            description="Book your first appointment to see it here."
            action={{ label: "Book an appointment" }}
          />
        </Section>

        <Section title="Tabs">
          <Tabs defaultValue="upcoming" className="max-w-md">
            <TabsList>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="pt-3 text-sm text-text-muted">
              Your upcoming appointments show up here.
            </TabsContent>
            <TabsContent value="past" className="pt-3 text-sm text-text-muted">
              Your past appointments show up here.
            </TabsContent>
          </Tabs>
        </Section>

        <Section title="Table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Anita Sharma</TableCell>
                <TableCell>Dr. Meera Rao</TableCell>
                <TableCell>10:30 AM</TableCell>
                <TableCell>
                  <StatusPill status="confirmed" />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Rohit Verma</TableCell>
                <TableCell>Dr. Arjun Nair</TableCell>
                <TableCell>11:15 AM</TableCell>
                <TableCell>
                  <StatusPill status="checked_in" />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Section>

        <Section title="Calendar & badges">
          <div className="flex flex-wrap items-start gap-8">
            <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-xl border border-border" />
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="outline">Outline</Badge>
              <Badge variant="destructive">Destructive</Badge>
            </div>
          </div>
        </Section>

        <Section title="Avatars & skeletons">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <Avatar size="sm">
                <AvatarFallback>AS</AvatarFallback>
              </Avatar>
              <Avatar>
                <AvatarFallback>RV</AvatarFallback>
              </Avatar>
              <Avatar size="lg">
                <AvatarFallback>MR</AvatarFallback>
              </Avatar>
            </div>
            <div className="w-64 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </Section>

        <Section title="Dialog, sheet & toast">
          <div className="flex flex-wrap gap-3">
            <Dialog>
              <DialogTrigger render={<Button variant="outline" />}>
                Cancel appointment
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel appointment with Dr. Rao?</DialogTitle>
                  <DialogDescription>
                    Your 10:30 AM appointment on 12 Oct will be cancelled. This can&apos;t be undone.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>Keep appointment</DialogClose>
                  <Button variant="destructive">Cancel appointment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Sheet>
              <SheetTrigger render={<Button variant="outline" />}>Open sheet</SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Add doctor</SheetTitle>
                </SheetHeader>
                <div className="space-y-1.5 px-4">
                  <Label htmlFor="sg-sheet-email">Email</Label>
                  <Input id="sg-sheet-email" placeholder="doctor@hospital.com" />
                </div>
              </SheetContent>
            </Sheet>

            <Button
              variant="outline"
              onClick={() =>
                toast.success("Appointment confirmed", {
                  description: "Dr. Rao · 12 Oct, 10:30 AM",
                })
              }
            >
              Show toast
            </Button>
          </div>
        </Section>

        <Section title="Icons" description="lucide-react, 1.5px stroke, 18–20px.">
          <div className="flex flex-wrap gap-4 text-text-muted">
            {[CalendarDays, Stethoscope, Users, FileText, Inbox].map((Icon, i) => (
              <Icon key={i} className="size-5" strokeWidth={1.5} />
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
