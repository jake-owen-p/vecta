"use client";

import { useId, useMemo, useState } from "react";

import { cn } from "~/lib/utils/cn";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type WorkType = "remote" | "in-person" | "hybrid";

type ErrorState = Partial<Record<"name" | "email" | "cv" | "workTypes", string>>;

const WORK_TYPE_OPTIONS: { value: WorkType; label: string; description: string }[] = [
  { value: "remote", label: "Remote", description: "Global-first roles" },
  { value: "in-person", label: "In-person", description: "On-site only" },
  { value: "hybrid", label: "Hybrid", description: "Blend of both" },
];

export const ApplyForm = () => {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [errors, setErrors] = useState<ErrorState>({});
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const cvId = useId();
  const workTypeGroupId = useId();

  const workTypeDescriptionId = `${workTypeGroupId}-description`;
  const workTypeErrorId = `${workTypeGroupId}-error`;

  const selectedLabels = useMemo(
    () =>
      workTypes
        .map((value) => WORK_TYPE_OPTIONS.find((option) => option.value === value)?.label)
        .filter(Boolean)
        .join(", ") || "None",
    [workTypes],
  );

  const handleWorkTypesChange = (value: string[]) => {
    setWorkTypes(value as WorkType[]);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    const nextErrors: ErrorState = {};

    const getStringField = (key: string) => {
      const value = formData.get(key);
      return typeof value === "string" ? value.trim() : "";
    };

    const name = getStringField("name");
    const email = getStringField("email");
    const phone = getStringField("phone");
    const cvEntry = formData.get("cv");
    const cvFile = cvEntry instanceof File ? cvEntry : null;

    if (!name) {
      nextErrors.name = "Name is required.";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    }

    if (!cvFile || cvFile.size === 0) {
      nextErrors.cv = "Upload your latest CV.";
    }

    if (workTypes.length === 0) {
      nextErrors.workTypes = "Select at least one work preference.";
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setSubmittedMessage(null);
      return;
    }

    const payload = {
      name,
      email,
      phone: phone || null,
      workTypes,
      cv: cvFile
        ? {
            name: cvFile.name,
            size: cvFile.size,
            type: cvFile.type,
          }
        : null,
    };

    console.log("Application submission", payload);
    setSubmittedMessage("Thanks! We received your application.");
    form.reset();
    setWorkTypes([]);
  };

  return (
    <section className="relative overflow-hidden py-24 text-white">
      <div className="container mx-auto max-w-3xl px-6">
        <div className="mb-12 space-y-6">
          <div className="inline-flex h-1 w-16 rounded-full bg-gradient-to-r from-white/40 to-white/10" />
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Apply</p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Join the Applied AI Network</h1>
            <p className="text-base text-white/60">
              Share your background so we can match you with remote-friendly, high-impact AI roles across our partner
              companies.
            </p>
          </div>
        </div>

        <Card className="border-white/10 bg-white/5 backdrop-blur-md">
          <CardHeader className="space-y-2 border-b border-white/[0.08]">
            <CardTitle className="text-2xl text-white">Tell us about you</CardTitle>
            <CardDescription className="text-white/60">
              We review every application manually. Add a CV that captures your most recent projects and impact.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8">
            <form className="grid gap-6" onSubmit={handleSubmit} noValidate>
              <div className="grid gap-2">
                <label htmlFor={nameId} className="text-sm font-medium text-white">
                  Full name
                </label>
                <input
                  id={nameId}
                  name="name"
                  type="text"
                  placeholder="Ada Lovelace"
                  className={cn(
                    "w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition focus:border-[#FF3600] focus:outline-none focus:ring-2 focus:ring-[#FF3600]/40",
                    errors.name && "border-[#FF3600]/70 focus:ring-[#FF3600]/60",
                  )}
                  aria-invalid={errors.name ? "true" : undefined}
                  aria-describedby={errors.name ? `${nameId}-error` : undefined}
                  required
                />
                {errors.name ? (
                  <p id={`${nameId}-error`} className="text-sm text-[#FF7F66]">
                    {errors.name}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label htmlFor={emailId} className="text-sm font-medium text-white">
                  Email
                </label>
                <input
                  id={emailId}
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  className={cn(
                    "w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition focus:border-[#FF3600] focus:outline-none focus:ring-2 focus:ring-[#FF3600]/40",
                    errors.email && "border-[#FF3600]/70 focus:ring-[#FF3600]/60",
                  )}
                  aria-invalid={errors.email ? "true" : undefined}
                  aria-describedby={errors.email ? `${emailId}-error` : undefined}
                  required
                />
                {errors.email ? (
                  <p id={`${emailId}-error`} className="text-sm text-[#FF7F66]">
                    {errors.email}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-2">
                <label htmlFor={phoneId} className="text-sm font-medium text-white">
                  Phone (optional)
                </label>
                <input
                  id={phoneId}
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 012-3456"
                  className="w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition focus:border-[#FF3600] focus:outline-none focus:ring-2 focus:ring-[#FF3600]/40"
                />
                <p className="text-xs text-white/40">We’ll only call for interview coordination.</p>
              </div>

              <div className="grid gap-2">
                <label htmlFor={cvId} className="text-sm font-medium text-white">
                  CV / Resume
                </label>
                <input
                  id={cvId}
                  name="cv"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className={cn(
                    "w-full cursor-pointer rounded-lg border border-dashed border-white/20 bg-black/40 px-4 py-5 text-sm text-white transition file:mr-4 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white/80 hover:border-white/40 focus:border-[#FF3600] focus:outline-none focus:ring-2 focus:ring-[#FF3600]/40",
                    errors.cv && "border-[#FF3600]/70 hover:border-[#FF3600]/70 focus:ring-[#FF3600]/60",
                  )}
                  aria-invalid={errors.cv ? "true" : undefined}
                  aria-describedby={
                    errors.cv ? `${cvId}-error` : `${cvId}-hint`
                  }
                  required
                />
                <p id={`${cvId}-hint`} className="text-xs text-white/40">
                  Accepted formats: PDF, DOC, DOCX (max 10 MB).
                </p>
                {errors.cv ? (
                  <p id={`${cvId}-error`} className="text-sm text-[#FF7F66]">
                    {errors.cv}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-medium text-white">What type of work are you looking for?</span>
                    <p id={workTypeDescriptionId} className="text-xs text-white/40">
                      Select all that match. Currently selected: {selectedLabels}.
                    </p>
                  </div>
                </div>
                <ToggleGroup
                  type="multiple"
                  value={workTypes}
                  onValueChange={handleWorkTypesChange}
                  className="flex flex-wrap justify-start gap-3"
                  aria-labelledby={workTypeGroupId}
                  aria-describedby={
                    errors.workTypes ? `${workTypeDescriptionId} ${workTypeErrorId}` : workTypeDescriptionId
                  }
                >
                  {WORK_TYPE_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      variant="outline"
                      size="lg"
                      className={cn(
                        "flex min-w-[140px] flex-col items-start gap-1 rounded-xl border-white/20 bg-black/30 px-5 py-4 text-left text-sm text-white transition hover:border-white/40 data-[state=on]:border-[#FF3600] data-[state=on]:bg-[#FF3600]/10",
                        workTypes.includes(option.value) && "border-[#FF3600]",
                      )}
                      aria-pressed={workTypes.includes(option.value) ? "true" : "false"}
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs text-white/50">{option.description}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {errors.workTypes ? (
                  <p id={workTypeErrorId} className="text-sm text-[#FF7F66]">
                    {errors.workTypes}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/40">
                  We review submissions within 7 days and reach out if there’s a fit.
                </p>
                <Button type="submit" variant="accent" size="lg" className="w-full sm:w-auto">
                  Submit application
                </Button>
              </div>

              {submittedMessage ? (
                <div className="rounded-lg border border-[#24c28a]/30 bg-[#24c28a]/10 px-4 py-3 text-sm text-[#9bf2d5]">
                  {submittedMessage}
                </div>
              ) : null}
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};


