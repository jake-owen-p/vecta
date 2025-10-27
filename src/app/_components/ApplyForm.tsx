"use client";

import { useCallback, useEffect, useId, useMemo, useState } from "react";

import { Loader2 } from "lucide-react";

type UploadStatus = "idle" | "uploading" | "uploaded" | "error";

import { cn } from "~/lib/utils/cn";

import { api } from "~/trpc/react";

import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ToggleGroup, ToggleGroupItem } from "./ui/toggle-group";

type WorkType = "remote" | "in-person" | "hybrid";
type EmploymentType = "full-time" | "contract";
type ApplicationWorkType = "REMOTE" | "IN_PERSON" | "HYBRID";
type ApplicationEmploymentType = "FULL_TIME" | "CONTRACT";

type ErrorField =
  | "name"
  | "email"
  | "cv"
  | "workTypes"
  | "employmentTypes"
  | "projectHighlights"
  | "projectLinks"
  | "githubUrl";

type ErrorState = Partial<Record<ErrorField, string>>;

const WORK_TYPE_OPTIONS: { value: WorkType; label: string; description: string }[] = [
  { value: "remote", label: "Remote", description: "Comfort of your home" },
  { value: "in-person", label: "In-person", description: "On-site only" },
  { value: "hybrid", label: "Hybrid", description: "Blend of both" },
];

const WORK_TYPE_TO_ENUM: Record<WorkType, ApplicationWorkType> = {
  remote: "REMOTE",
  "in-person": "IN_PERSON",
  hybrid: "HYBRID",
};

const EMPLOYMENT_TYPE_OPTIONS: { value: EmploymentType; label: string; description: string }[] = [
  { value: "full-time", label: "Full-time", description: "Permanent, salaried roles" },
  { value: "contract", label: "Contract", description: "Flexible or project-based" },
];

const EMPLOYMENT_TYPE_TO_ENUM: Record<EmploymentType, ApplicationEmploymentType> = {
  "full-time": "FULL_TIME",
  contract: "CONTRACT",
};

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const JOB_TYPE_STORAGE_KEY = "vecta.apply.jobType";

const normalizeJobType = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

export const ApplyForm = () => {
  const [workTypes, setWorkTypes] = useState<WorkType[]>([]);
  const [employmentTypes, setEmploymentTypes] = useState<EmploymentType[]>([]);
  const [errors, setErrors] = useState<ErrorState>({});
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>("idle");
  const [uploadedKey, setUploadedKey] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobType, setJobType] = useState<string | null>(null);

  const nameId = useId();
  const emailId = useId();
  const phoneId = useId();
  const cvId = useId();
  const projectHighlightsId = useId();
  const projectLinksId = useId();
  const githubUrlId = useId();
  const workTypeGroupId = useId();
  const employmentTypeGroupId = useId();

  const applicationMutation = api.application.submit.useMutation();

  const workTypeDescriptionId = `${workTypeGroupId}-description`;
  const workTypeErrorId = `${workTypeGroupId}-error`;
  const employmentTypeDescriptionId = `${employmentTypeGroupId}-description`;
  const employmentTypeErrorId = `${employmentTypeGroupId}-error`;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const paramValue = normalizeJobType(searchParams.get("JOB_TYPE"));
    let storedValue: string | null = null;

    try {
      storedValue = window.localStorage.getItem(JOB_TYPE_STORAGE_KEY);
    } catch (error) {
      void error;
      storedValue = null;
    }

    if (paramValue) {
      setJobType(paramValue);
      try {
        window.localStorage.setItem(JOB_TYPE_STORAGE_KEY, paramValue);
      } catch (error) {
        void error;
      }

      searchParams.delete("JOB_TYPE");
      const query = searchParams.toString();
      const hash = window.location.hash;
      const nextUrl = query ? `${window.location.pathname}?${query}${hash}` : `${window.location.pathname}${hash}`;
      window.history.replaceState({}, "", nextUrl);
      return;
    }

    const normalizedStored = normalizeJobType(storedValue);
    if (normalizedStored) {
      setJobType(normalizedStored);
      return;
    }

    setJobType(null);
    try {
      window.localStorage.removeItem(JOB_TYPE_STORAGE_KEY);
    } catch (error) {
      void error;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      if (jobType) {
        window.localStorage.setItem(JOB_TYPE_STORAGE_KEY, jobType);
      } else {
        window.localStorage.removeItem(JOB_TYPE_STORAGE_KEY);
      }
    } catch (error) {
      void error;
    }
  }, [jobType]);

  const selectedLabels = useMemo(
    () =>
      workTypes
        .map((value) => WORK_TYPE_OPTIONS.find((option) => option.value === value)?.label)
        .filter(Boolean)
        .join(", ") || "None",
    [workTypes],
  );

  const selectedEmploymentLabels = useMemo(
    () =>
      employmentTypes
        .map((value) => EMPLOYMENT_TYPE_OPTIONS.find((option) => option.value === value)?.label)
        .filter(Boolean)
        .join(", ") || "None",
    [employmentTypes],
  );

  const clearError = useCallback((field: ErrorField) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleWorkTypesChange = (value: string[]) => {
    setWorkTypes(value as WorkType[]);
    clearError("workTypes");
  };

  const handleEmploymentTypesChange = (value: string[]) => {
    setEmploymentTypes(value as EmploymentType[]);
    clearError("employmentTypes");
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.target;
    const file = input.files?.[0] ?? null;

    setUploadStatus("idle");
    setUploadedKey(null);
    setUploadedUrl(null);
    setUploadError(null);
    setSelectedFile(null);

    clearError("cv");

    if (!file) {
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setErrors((prev) => ({ ...prev, cv: "File must be under 10 MB." }));
      input.value = "";
      return;
    }

    setSelectedFile(file);

    void (async () => {
      try {
        await uploadCv(file);
      } catch (uploadErr) {
        console.error("Upload failed for selected CV", uploadErr);
        setSelectedFile(null);
        input.value = "";
      }
    })();
  };

  const uploadCv = useCallback(async (file: File) => {
    setUploadStatus("uploading");
    setUploadError(null);

    try {
      const presignResponse = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignResponse.ok) {
        throw new Error("Failed to request upload URL");
      }

      const { uploadUrl, objectKey, bucket, region } = (await presignResponse.json()) as {
        uploadUrl: string;
        objectKey: string;
        bucket?: string;
        region?: string;
      };

      const uploadResult = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error("Direct upload failed");
      }

      setUploadStatus("uploaded");
      setUploadedKey(objectKey);
      if (bucket) {
        const publicUrl = region
          ? `https://${bucket}.s3.${region}.amazonaws.com/${objectKey}`
          : `https://${bucket}.s3.amazonaws.com/${objectKey}`;
        setUploadedUrl(publicUrl);
      } else {
        setUploadedUrl(null);
      }
      return objectKey;
    } catch (error) {
      console.error("CV upload error", error);
      setUploadStatus("error");
      setUploadError("We couldn’t upload your CV. Please try again.");
      throw error;
    }
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
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
    const projectHighlights = getStringField("projectHighlights");
    const githubUrlInput = getStringField("githubUrl");
    const projectLinksInput = getStringField("projectLinks");
    const storedJobType = jobType;

    const normalizeUrl = (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) return null;

      const hasProtocol = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed);
      const candidate = hasProtocol ? trimmed : `https://${trimmed}`;
      const url = new URL(candidate);
      return url.toString();
    };

    let githubUrl: string | null = null;

    if (githubUrlInput) {
      try {
        githubUrl = normalizeUrl(githubUrlInput);
        if (!githubUrl) {
          throw new Error("Invalid URL");
        }
      } catch (error) {
        void error;
        nextErrors.githubUrl = "Enter a valid URL (include https://).";
      }
    }

    const projectLinks: string[] = [];
    if (projectLinksInput) {
      const rawLinks = projectLinksInput.split(/\r?\n|,|\s{2,}/).map((link) => link.trim()).filter(Boolean);
      for (const link of rawLinks) {
        try {
          const normalized = normalizeUrl(link);
          if (!normalized) {
            throw new Error("Invalid URL");
          }
          projectLinks.push(normalized);
        } catch (error) {
          void error;
          nextErrors.projectLinks = "One or more links look invalid. Use full URLs.";
          break;
        }
      }
    }

    if (!name) {
      nextErrors.name = "Name is required.";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    }

    if (!selectedFile) {
      nextErrors.cv = "Upload your latest CV.";
    } else if (uploadStatus === "uploading") {
      nextErrors.cv = "Please wait for your CV upload to finish.";
    } else if (uploadStatus === "error") {
      nextErrors.cv = uploadError ?? "Your CV upload did not complete.";
    } else if (uploadStatus !== "uploaded" || !uploadedKey) {
      nextErrors.cv = "We could not confirm your CV upload. Please try again.";
    }

    if (!projectHighlights) {
      nextErrors.projectHighlights = "Share a project or two that showcases your agentic work.";
    }

    if (workTypes.length === 0) {
      nextErrors.workTypes = "Select at least one work preference.";
    }

    if (employmentTypes.length === 0) {
      nextErrors.employmentTypes = "Tell us if you're open to full-time, contract, or both.";
    }

    setErrors(nextErrors);
    setSubmittedMessage(null);
    setUploadError(null);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    void (async () => {
      setIsSubmitting(true);

      try {
        if (!selectedFile || !uploadedKey) {
          throw new Error("Missing CV selection or upload key");
        }

        await applicationMutation.mutateAsync({
          name,
          email,
          phone: phone || null,
          workTypes: workTypes.map((value) => WORK_TYPE_TO_ENUM[value]),
          workTypeLabels: workTypes,
          employmentTypes: employmentTypes.map((value) => EMPLOYMENT_TYPE_TO_ENUM[value]),
          employmentTypeLabels: employmentTypes,
          agenticShowcase: {
            highlights: projectHighlights,
            githubUrl,
            links: projectLinks,
          },
          jobType: storedJobType ?? null,
          cv: {
            objectKey: uploadedKey,
            url: uploadedUrl,
            name: selectedFile.name,
            type: selectedFile.type,
            size: selectedFile.size,
          },
        });

        setSubmittedMessage("Thanks! We received your application.");
        form.reset();
        setWorkTypes([]);
        setEmploymentTypes([]);
        setUploadStatus("idle");
        setUploadedKey(null);
        setUploadedUrl(null);
        setUploadError(null);
        setErrors({});
        setSelectedFile(null);
      } catch (error) {
        console.error("Application submit error", error);
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <section className="relative overflow-hidden py-24 text-white">
      <div className="container mx-auto max-w-3xl px-6">
        <div className="mb-12 space-y-6">
          <div className="inline-flex h-1 w-16 rounded-full bg-gradient-to-r from-white/40 to-white/10" />
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/50">Apply</p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">Join the Vecta Network</h1>
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
                  placeholder="+44 20 7946 0958"
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
                  onChange={handleFileChange}
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
                {uploadStatus === "uploading" ? (
                  <p className="flex items-center gap-2 text-xs text-white/60">
                    <Loader2 className="h-3 w-3 animate-spin" /> Uploading CV…
                  </p>
                ) : null}
                {uploadStatus === "uploaded" && !errors.cv ? (
                  <p className="text-xs text-[#9bf2d5]">CV uploaded successfully.</p>
                ) : null}
                {uploadError ? (
                  <p className="text-sm text-[#FF7F66]">{uploadError}</p>
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
                        "flex min-w-[140px] flex-col items-start gap-1 rounded-xl border-white/20 bg-black/30 px-5 py-8 text-left text-sm text-white transition hover:border-white/40 data-[state=on]:border-[#FF3600] data-[state=on]:bg-[#FF3600]/10",
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

              <div className="grid gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-medium text-white">Preferred engagement type</span>
                    <p id={employmentTypeDescriptionId} className="text-xs text-white/40">
                      Choose all that apply. Currently selected: {selectedEmploymentLabels}.
                    </p>
                  </div>
                </div>
                <ToggleGroup
                  type="multiple"
                  value={employmentTypes}
                  onValueChange={handleEmploymentTypesChange}
                  className="flex flex-wrap justify-start gap-3"
                  aria-labelledby={employmentTypeGroupId}
                  aria-describedby={
                    errors.employmentTypes
                      ? `${employmentTypeDescriptionId} ${employmentTypeErrorId}`
                      : employmentTypeDescriptionId
                  }
                >
                  {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                    <ToggleGroupItem
                      key={option.value}
                      value={option.value}
                      variant="outline"
                      size="lg"
                      className={cn(
                        "flex min-w-[140px] flex-col items-start gap-1 rounded-xl border-white/20 bg-black/30 px-5 py-8 text-left text-sm text-white transition hover:border-white/40 data-[state=on]:border-[#FF3600] data-[state=on]:bg-[#FF3600]/10",
                        employmentTypes.includes(option.value) && "border-[#FF3600]",
                      )}
                      aria-pressed={employmentTypes.includes(option.value) ? "true" : "false"}
                    >
                      <span className="font-semibold">{option.label}</span>
                      <span className="text-xs text-white/50">{option.description}</span>
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
                {errors.employmentTypes ? (
                  <p id={employmentTypeErrorId} className="text-sm text-[#FF7F66]">
                    {errors.employmentTypes}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="space-y-2">
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                    Showcase
                  </span>
                  <h2 className="text-xl font-semibold text-white">(Optional) Share your projects</h2>
                  <p className="text-sm text-white/50">
                    Tell us about the autonomous agents, personal projects, or open-source work you&apos;ve shipped - ideally with links!
                  </p>
                </div>

                <div className="grid gap-2">
                  <label htmlFor={projectHighlightsId} className="text-sm font-medium text-white">
                    Links for Spotlight projects
                  </label>
                  <textarea
                    id={projectHighlightsId}
                    name="projectHighlights"
                    placeholder="https://example.com/project1, https://website.com, https://github.com/user/repo"
                    className={cn(
                      "min-h-[140px] w-full rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-sm text-white transition focus:border-[#FF3600] focus:outline-none focus:ring-2 focus:ring-[#FF3600]/40",
                      errors.projectHighlights && "border-[#FF3600]/70 focus:ring-[#FF3600]/60",
                    )}
                    aria-invalid={errors.projectHighlights ? "true" : undefined}
                    aria-describedby={
                      errors.projectHighlights ? `${projectHighlightsId}-error` : `${projectHighlightsId}-hint`
                    }
                    onInput={() => clearError("projectHighlights")}
                    required
                  />
                  {errors.projectHighlights ? (
                    <p id={`${projectHighlightsId}-error`} className="text-sm text-[#FF7F66]">
                      {errors.projectHighlights}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/40">
                  We review submissions within 7 days and reach out if there’s a fit.
                </p>
                <Button
                  type="submit"
                  variant="accent"
                  size="lg"
                  className="w-full cursor-pointer sm:w-auto"
                  disabled={isSubmitting || uploadStatus === "uploading"}
                  aria-busy={isSubmitting || uploadStatus === "uploading"}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                    </span>
                  ) : uploadStatus === "uploading" ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" /> Uploading CV…
                    </span>
                  ) : (
                    "Submit application"
                  )}
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


