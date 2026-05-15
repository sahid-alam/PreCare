"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { PatientProfile } from "@/lib/types";

const EMPTY_PROFILE: PatientProfile = {
  age: null,
  gender: null,
  knownConditions: [],
  currentMedications: "",
  knownAllergies: "",
  lastBp: "",
  bloodSugar: "",
};

export function usePatientProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  // Sign in anonymously on mount and load any saved profile
  useEffect(() => {
    void (async () => {
      const supabase = getSupabaseBrowserClient();
      let { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        const { data } = await supabase.auth.signInAnonymously();
        user = data.user;
      }

      if (!user) { setLoading(false); return; }
      setUserId(user.id);

      // Load saved profile from DB
      const { data: row } = await supabase
        .from("patient_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (row) {
        setProfile({
          age: row.age ?? null,
          gender: (row.gender as PatientProfile["gender"]) ?? null,
          knownConditions: row.known_conditions ?? [],
          currentMedications: row.current_medications ?? "",
          knownAllergies: row.known_allergies ?? "",
          lastBp: row.last_bp ?? "",
          bloodSugar: row.blood_sugar ?? "",
        });
      }
      setLoading(false);
    })();
  }, []);

  const saveProfile = useCallback(async (p: PatientProfile) => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.from("patient_profiles").upsert({
      id: userId,
      age: p.age,
      gender: p.gender,
      known_conditions: p.knownConditions,
      current_medications: p.currentMedications || null,
      known_allergies: p.knownAllergies || null,
      last_bp: p.lastBp || null,
      blood_sugar: p.bloodSugar || null,
      updated_at: new Date().toISOString(),
    });
  }, [userId]);

  const sendMagicLink = useCallback(async (emailAddr: string) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: emailAddr,
      options: { shouldCreateUser: true },
    });
    if (!error) setEmailSent(true);
    return !error;
  }, []);

  return {
    userId,
    profile,
    setProfile,
    loading,
    saveProfile,
    email,
    setEmail,
    emailSent,
    sendMagicLink,
  };
}
