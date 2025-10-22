"use client";

import { useCallback, useMemo, useState } from "react";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "~/app/_components/ui/button";
import { Input } from "~/app/_components/ui/input";
import { Label } from "~/app/_components/ui/label";
import { ScrollArea } from "~/app/_components/ui/scroll-area";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils/cn";

type Decision = "accept" | "reject";

const ACCESS_CODE = "FO4jf8@s!";

type StatusFilter = "ALL" | ApplicationStatus;
type ApplicationStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "SYSTEM_DESIGN";

type ApplicationRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  workTypeLabels: string[];
  employmentTypeLabels: string[];
  cvUrl: string;
  status: ApplicationStatus;
  createdAt: string;
};

const STATUS_FILTERS: Array<{ label: string; value: StatusFilter }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "Rejected", value: "REJECTED" },
  { label: "System design", value: "SYSTEM_DESIGN" },
];

const FILTER_BUTTON_CLASSES: Record<StatusFilter, string> = {
  ALL: "border-white/15 bg-white/10 text-white",
  PENDING: "border-orange-400/60 bg-orange-500/10 text-orange-300",
  ACCEPTED: "border-emerald-400/60 bg-emerald-500/10 text-emerald-300",
  REJECTED: "border-red-400/60 bg-red-500/10 text-red-300",
  SYSTEM_DESIGN: "border-sky-400/60 bg-sky-500/10 text-sky-300",
};

const STATUS_BADGE_CLASSES: Record<ApplicationStatus, string> = {
  PENDING: "bg-orange-500/15 text-orange-300 ring-1 ring-orange-500/40",
  ACCEPTED: "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40",
  REJECTED: "bg-red-500/15 text-red-300 ring-1 ring-red-500/40",
  SYSTEM_DESIGN: "bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/40",
};

const TABLE_COLUMN_CLASSES: Record<string, { header?: string; cell?: string }> = {
  name: { header: "min-w-[180px]", cell: "min-w-[180px] whitespace-nowrap" },
  email: { header: "min-w-[220px]", cell: "min-w-[220px] whitespace-nowrap" },
  phone: { header: "min-w-[160px]", cell: "min-w-[160px] whitespace-nowrap" },
  workTypes: { header: "min-w-[200px]", cell: "min-w-[200px]" },
  employment: { header: "min-w-[200px]", cell: "min-w-[200px]" },
  cv: { header: "min-w-[120px]", cell: "min-w-[120px]" },
  status: { header: "min-w-[140px]", cell: "min-w-[140px] whitespace-nowrap" },
  createdAt: { header: "min-w-[160px]", cell: "min-w-[160px] whitespace-nowrap" },
  actions: { header: "min-w-[160px]", cell: "min-w-[160px]" },
};

export default function AdminPage() {
  const [code, setCode] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [selectedCvUrl, setSelectedCvUrl] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");

  const utils = api.useUtils();
  const listQuery = api.admin.listApplications.useQuery(undefined, {
    enabled: unlocked,
  });
  const decideMutation = api.admin.decide.useMutation({
    onSuccess: async () => {
      await utils.admin.listApplications.invalidate();
    },
  });
  const moveToSystemDesignMutation = api.admin.moveToSystemDesign.useMutation({
    onSuccess: async () => {
      await utils.admin.listApplications.invalidate();
    },
  });

  const rows = useListData(listQuery.data);
  const filteredRows = useMemo(() => {
    if (statusFilter === "ALL") {
      return rows;
    }
    return rows.filter((row) => row.status === statusFilter);
  }, [rows, statusFilter]);

  const handleDecision = useCallback(
    (id: string, decision: Decision) => {
      onDecide(decideMutation.mutate, id, decision);
    },
    [decideMutation.mutate],
  );

  const handleMoveToSystemDesign = useCallback(
    (id: string) => {
      onMoveToSystemDesign(moveToSystemDesignMutation.mutate, id);
    },
    [moveToSystemDesignMutation.mutate],
  );

  const columns = useMemo<ColumnDef<ApplicationRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ getValue }) => <div className="font-semibold text-white">{getValue<string>()}</div>,
      },
      {
        accessorKey: "email",
        header: "Email",
        cell: ({ getValue }) => (
          <a className="text-sm text-white/80 underline" href={`mailto:${getValue<string>()}`}>
            {getValue<string>()}
          </a>
        ),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ getValue }) => <span className="text-sm text-white/70">{getValue<string | null>() ?? "—"}</span>,
      },
      {
        id: "workTypes",
        header: "Work Types",
        accessorFn: (row) => row.workTypeLabels.join(", "),
        cell: ({ getValue }) => <span className="text-sm text-white/80">{getValue<string>()}</span>,
      },
      {
        id: "employment",
        header: "Employment",
        accessorFn: (row) => row.employmentTypeLabels.join(", "),
        cell: ({ getValue }) => <span className="text-sm text-white/80">{getValue<string>()}</span>,
      },
      {
        id: "cv",
        header: "CV",
        cell: ({ row }) => (
          <Button variant="secondary" size="sm" onClick={() => setSelectedCvUrl(row.original.cvUrl)}>
            View
          </Button>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }) => {
          const rawStatus = (getValue<string>() ?? "PENDING").toUpperCase();
          const normalizedStatus = rawStatus as ApplicationStatus;
          const badgeClass = STATUS_BADGE_CLASSES[normalizedStatus] ?? STATUS_BADGE_CLASSES.PENDING;
          return (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider",
                badgeClass,
              )}
            >
              {rawStatus.replace(/_/g, " ")}
            </span>
          );
        },
      },
      {
        accessorKey: "createdAt",
        header: "Submitted",
        cell: ({ getValue }) => (
          <span className="text-sm text-white/60">{formatDate(getValue<string>())}</span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const status = row.original.status;
          const isAccepted = status === "ACCEPTED";
          const isSystemDesign = status === "SYSTEM_DESIGN";

          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="accent"
                disabled={decideMutation.isPending || isAccepted || isSystemDesign}
                onClick={() => handleDecision(row.original.id, "accept")}
              >
                Accept
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={decideMutation.isPending || isSystemDesign}
                onClick={() => handleDecision(row.original.id, "reject")}
              >
                Reject
              </Button>
              {isAccepted ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={moveToSystemDesignMutation.isPending}
                  onClick={() => handleMoveToSystemDesign(row.original.id)}
                >
                  Move to system design
                </Button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [decideMutation.isPending, handleDecision, handleMoveToSystemDesign, moveToSystemDesignMutation.isPending],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (!unlocked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#090200]">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-10 shadow-[0_0_40px_rgba(255,54,0,0.25)]">
          <div className="relative mb-8 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/60">Vecta Admin</p>
              <h1 className="mt-2 text-3xl font-semibold text-white">Secure Access</h1>
              <p className="mt-2 text-sm text-white/50">
                Enter the access code to review candidates in the Vecta network.
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-gradient-primary opacity-80" />
          </div>
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              if (code === ACCESS_CODE) {
                setUnlocked(true);
              } else {
                alert("Invalid code");
              }
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="admin-code">Access code</Label>
              <Input
                id="admin-code"
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter secure code"
              />
            </div>
            <Button type="submit" className="w-full" size="lg" variant="hero">
              Unlock dashboard
            </Button>
            <p className="text-center text-xs text-white/50">
              Need help? Email <a className="underline" href="mailto:team@vecta.co">team@vecta.co</a>
            </p>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090200] px-6 pb-16 pt-10 text-white">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-white/50">Vecta Applications</p>
            <h1 className="mt-2 text-4xl font-semibold">Talent Pipeline</h1>
            <p className="mt-2 text-sm text-white/60">
              Review submissions, open CVs, and move talent forward in the network.
            </p>
          </div>
          <div className="h-16 w-16 rounded-full bg-gradient-primary opacity-70" />
        </header>

        <div className="rounded-3xl border border-white/10 bg-black/60 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-white/40">Filter by Status</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((filter) => {
                const isActive = statusFilter === filter.value;
                return (
                  <Button
                    key={filter.value}
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatusFilter(filter.value)}
                    className={cn(
                      "rounded-full border border-white/10 px-4 py-1 text-xs uppercase tracking-wide text-white/70 transition",
                      isActive ? FILTER_BUTTON_CLASSES[filter.value] : "hover:border-white/20 hover:text-white",
                    )}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </div>
          </div>
          {listQuery.isLoading ? (
            <div className="flex h-48 items-center justify-center text-white/60">Loading…</div>
          ) : listQuery.isError ? (
            <div className="flex h-48 items-center justify-center text-white/60">
              Unable to load applications. Please refresh.
            </div>
          ) : rows.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-white/50">No applications yet.</div>
          ) : filteredRows.length === 0 ? (
            <div className="flex h-48 items-center justify-center text-white/50">
              No applications in this status.
            </div>
          ) : (
            <ScrollArea className="w-full">
              <div className="relative">
                <div className="w-full overflow-x-auto">
                  <table className="w-full min-w-[1100px] table-auto border-collapse">
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id} className="text-left text-xs uppercase tracking-wide text-white/40">
                          {headerGroup.headers.map((header) => {
                            const columnId = header.column.id ?? "";
                            const columnClass = TABLE_COLUMN_CLASSES[columnId]?.header;
                            return (
                              <th
                                key={header.id}
                                className={cn(
                                  "border-b border-white/10 px-4 py-3 font-medium whitespace-nowrap",
                                  columnClass,
                                )}
                              >
                                {header.isPlaceholder
                                  ? null
                                  : flexRender(header.column.columnDef.header, header.getContext())}
                              </th>
                            );
                          })}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      {table.getRowModel().rows.map((row) => (
                        <tr key={row.id} className="border-b border-white/5 last:border-b-0">
                          {row.getVisibleCells().map((cell) => {
                            const columnId = cell.column.id ?? "";
                            const columnClass = TABLE_COLUMN_CLASSES[columnId]?.cell;
                            return (
                              <td
                                key={cell.id}
                                className={cn("px-4 py-4 align-middle text-sm text-white/80", columnClass)}
                              >
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>

      {selectedCvUrl ? (
        <div
          role="dialog"
          aria-modal
          onClick={() => setSelectedCvUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-black/80 shadow-[0_30px_90px_rgba(0,0,0,0.6)]"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <h2 className="text-lg font-semibold">Candidate CV</h2>
              <Button variant="ghost" onClick={() => setSelectedCvUrl(null)}>
                Close
              </Button>
            </div>
            <div className="h-[80vh]">
              <iframe title="CV" src={selectedCvUrl} className="h-full w-full" />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

const toStringArray = (value: unknown) => {
  if (!Array.isArray(value)) return [] as string[];
  return value.filter((item): item is string => typeof item === "string");
};

function useListData(data: unknown): ApplicationRow[] {
  return useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data
      .map((item) => {
        const record = item as Record<string, unknown> | null | undefined;
        if (!record) return null;

        const id = typeof record.id === "string" ? record.id : null;
        const name = typeof record.name === "string" ? record.name : null;
        const email = typeof record.email === "string" ? record.email : null;
        const phone = typeof record.phone === "string" ? record.phone : null;
        const workTypeLabels = toStringArray(record.workTypeLabels);
        const employmentTypeLabels = toStringArray(record.employmentTypeLabels);
        const cvUrl = typeof record.cvUrl === "string" ? record.cvUrl : null;
        const status = normalizeStatus(record.status);
        const createdAt = typeof record.createdAt === "string" ? record.createdAt : null;

        if (!id || !name || !email || !cvUrl || !createdAt) {
          return null;
        }

        const entry: ApplicationRow = {
          id,
          name,
          email,
          phone,
          workTypeLabels,
          employmentTypeLabels,
          cvUrl,
          status,
          createdAt,
        };

        return entry;
      })
      .filter((item): item is ApplicationRow => item !== null);
  }, [data]);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function onDecide(mutate: (opts: { id: string; decision: Decision }) => void, id: string, decision: Decision) {
  const message = decision === "accept" ? "Accept this application?" : "Reject this application?";
  const ok = typeof window !== "undefined" ? window.confirm(message) : true;
  if (!ok) return;
  mutate({ id, decision });
}

function onMoveToSystemDesign(mutate: (opts: { id: string }) => void, id: string) {
  const ok = typeof window !== "undefined" ? window.confirm("Move this candidate to the system design round?") : true;
  if (!ok) return;
  mutate({ id });
}

function normalizeStatus(value: unknown): ApplicationStatus {
  if (typeof value !== "string") return "PENDING";
  const upper = value.toUpperCase();
  if (upper === "ACCEPTED" || upper === "REJECTED" || upper === "SYSTEM_DESIGN") {
    return upper;
  }
  return "PENDING";
}


