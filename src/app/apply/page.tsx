"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { ApplyForm } from "../_components/ApplyForm";
import { Footer } from "../_components/Footer";
import { SelectionProcess } from "../_components/SelectionProcess";
import { SiteToolbar } from "../_components/SiteToolbar";

const JOB_TYPE_STORAGE_KEY = "vecta.apply.jobType";

const normalizeJobType = (value: string | null | undefined) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const ApplyPage = () => {
  return (
    <div className="min-h-screen bg-[#090200]">
      <SiteToolbar />
      <Suspense fallback={null}>
        <ApplyPageContent />
      </Suspense>
      <SelectionProcess />
      <Footer />
    </div>
  );
};

const ApplyPageContent = () => {
  const searchParams = useSearchParams();
  const [jobType, setJobType] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const paramValue = normalizeJobType(searchParams.get("JOB_TYPE"));

    if (paramValue) {
      setJobType(paramValue);
      try {
        window.localStorage.setItem(JOB_TYPE_STORAGE_KEY, paramValue);
      } catch (error) {
        void error;
      }
      return;
    }

    let storedValue: string | null = null;
    try {
      storedValue = window.localStorage.getItem(JOB_TYPE_STORAGE_KEY);
    } catch (error) {
      void error;
      storedValue = null;
    }

    const normalizedStored = normalizeJobType(storedValue);
    if (normalizedStored) {
      setJobType(normalizedStored);
    } else {
      setJobType(null);
    }
  }, [searchParams]);

  return <ApplyForm jobType={jobType} />;
};

export default ApplyPage;


