"use client";

import { useState } from "react";
import { Bell, X, Plus, Trash2 } from "lucide-react";
import type { MedicationReminder } from "@/lib/types";
import { useReminders } from "@/hooks/useReminders";

interface Props {
  userId: string | null;
}

export default function MedicationReminders({ userId }: Props) {
  const { reminders, dueNow, addReminder, deleteReminder, dismissDue } = useReminders(userId);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time1, setTime1] = useState("08:00");
  const [time2, setTime2] = useState("");

  async function handleAdd() {
    if (!name.trim()) return;
    const times = [time1, time2].filter(Boolean);
    await addReminder({ name: name.trim(), dose: dose.trim(), times });
    setName(""); setDose(""); setTime1("08:00"); setTime2("");
  }

  return (
    <>
      {/* Due-now toasts */}
      {dueNow.length > 0 && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-2">
          {dueNow.map((r) => (
            <div
              key={r.id}
              className="flex max-w-xs items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 shadow-lg"
            >
              <Bell className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900">Medication reminder</p>
                <p className="text-xs text-amber-700">
                  {r.name}{r.dose ? ` — ${r.dose}` : ""}
                </p>
              </div>
              <button onClick={() => dismissDue(r)} className="text-amber-400 hover:text-amber-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bell button */}
      <button
        onClick={() => setOpen(true)}
        className="relative flex h-8 w-8 items-center justify-center rounded-full text-[#bfc8c2] transition-colors hover:text-white"
        title="Medication reminders"
      >
        <Bell className="h-4 w-4" />
        {dueNow.length > 0 && (
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-400" />
        )}
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-5 shadow-2xl sm:rounded-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-[#14241c]">Medication Reminders</h2>
              <button onClick={() => setOpen(false)} className="text-[#a8b5ad] hover:text-[#14241c]">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Add form */}
            <div className="mb-4 space-y-2 rounded-xl border border-[#d3e5d9] bg-[#f4f1e9] p-3">
              <input
                placeholder="Medication name *"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
              />
              <input
                placeholder="Dose (e.g. 500mg)"
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2 text-sm text-[#14241c] placeholder-[#a8b5ad] focus:border-[#1e6a47] focus:outline-none"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <p className="mb-1 text-[10px] uppercase text-[#6f7a73]">Time 1</p>
                  <input
                    type="time"
                    value={time1}
                    onChange={(e) => setTime1(e.target.value)}
                    className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2 text-sm text-[#14241c] focus:border-[#1e6a47] focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <p className="mb-1 text-[10px] uppercase text-[#6f7a73]">Time 2 (opt.)</p>
                  <input
                    type="time"
                    value={time2}
                    onChange={(e) => setTime2(e.target.value)}
                    className="w-full rounded-lg border border-[#d3e5d9] bg-white px-3 py-2 text-sm text-[#14241c] focus:border-[#1e6a47] focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => void handleAdd()}
                disabled={!name.trim()}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1e6a47] py-2 text-sm font-medium text-white disabled:opacity-40"
              >
                <Plus className="h-4 w-4" /> Add reminder
              </button>
            </div>

            {/* List */}
            {reminders.length === 0 ? (
              <p className="py-2 text-center text-sm text-[#a8b5ad]">No reminders yet.</p>
            ) : (
              <ul className="divide-y divide-[#f0ede4]">
                {reminders.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-[#14241c]">
                        {r.name}{r.dose ? <span className="ml-1 text-xs font-normal text-[#6f7a73]">— {r.dose}</span> : null}
                      </p>
                      <p className="text-xs text-[#6f7a73]">{r.times.join(" · ")}</p>
                    </div>
                    <button
                      onClick={() => void deleteReminder(r.id)}
                      className="ml-2 text-[#c9b8b5] hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </>
  );
}
