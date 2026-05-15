"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { MedicationReminder } from "@/lib/types";

export function useReminders(userId: string | null) {
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [dueNow, setDueNow] = useState<MedicationReminder[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();
    void supabase
      .from("medication_reminders")
      .select("*")
      .eq("patient_id", userId)
      .eq("active", true)
      .order("created_at")
      .then(({ data }) => {
        if (data) setReminders(data as MedicationReminder[]);
      });
  }, [userId]);

  // Check for due reminders every minute
  useEffect(() => {
    function check() {
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const due = reminders.filter((r) =>
        r.times.some((t) => {
          const key = `${r.id}-${t}`;
          if (dismissed.has(key)) return false;
          const [h, m] = t.split(":").map(Number);
          const diff = Math.abs(now.getHours() * 60 + now.getMinutes() - (h ?? 0) * 60 - (m ?? 0));
          return diff <= 15; // fire within 15 min window
        })
      );
      setDueNow(due);
      return hhmm;
    }
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, [reminders, dismissed]);

  const addReminder = useCallback(async (reminder: Omit<MedicationReminder, "id" | "active">) => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();
    const { data } = await supabase
      .from("medication_reminders")
      .insert({ ...reminder, patient_id: userId, active: true })
      .select()
      .single();
    if (data) setReminders((prev) => [...prev, data as MedicationReminder]);
  }, [userId]);

  const deleteReminder = useCallback(async (id: number) => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.from("medication_reminders").delete().eq("id", id).eq("patient_id", userId);
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, [userId]);

  const dismissDue = useCallback((reminder: MedicationReminder) => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const matchedTime = reminder.times.find((t) => {
      const [h, m] = t.split(":").map(Number);
      const diff = Math.abs(now.getHours() * 60 + now.getMinutes() - (h ?? 0) * 60 - (m ?? 0));
      return diff <= 15;
    }) ?? hhmm;
    setDismissed((prev) => new Set([...prev, `${reminder.id}-${matchedTime}`]));
    setDueNow((prev) => prev.filter((r) => r.id !== reminder.id));
  }, []);

  return { reminders, dueNow, addReminder, deleteReminder, dismissDue };
}
