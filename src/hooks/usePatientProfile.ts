"use client";

import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase-client";
import type { PatientProfile } from "@/lib/types";

const LS_KEY = "precare_profile";

const EMPTY_PROFILE: PatientProfile = {
  age: null,
  gender: null,
  knownConditions: [],
  currentMedications: "",
  knownAllergies: "",
  lastBp: "",
  bloodSugar: "",
};

function loadFromStorage(): PatientProfile {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return { ...EMPTY_PROFILE, ...(JSON.parse(raw) as Partial<PatientProfile>) };
  } catch { /* ignore */ }
  return EMPTY_PROFILE;
}

export function usePatientProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // On mount: check for existing Supabase session, else fall back to localStorage
  useEffect(() => {
    void (async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user && !( user as { is_anonymous?: boolean }).is_anonymous) {
        setUserId(user.id);
        // Load profile from DB
        const { data: row } = await supabase
          .from("patient_profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (row) {
          const p: PatientProfile = {
            age: row.age ?? null,
            gender: (row.gender as PatientProfile["gender"]) ?? null,
            knownConditions: row.known_conditions ?? [],
            currentMedications: row.current_medications ?? "",
            knownAllergies: row.known_allergies ?? "",
            lastBp: row.last_bp ?? "",
            bloodSugar: row.blood_sugar ?? "",
          };
          setProfile(p);
          // Keep localStorage in sync
          localStorage.setItem(LS_KEY, JSON.stringify(p));
        } else {
          setProfile(loadFromStorage());
        }
      } else {
        // Guest: load from localStorage only
        setProfile(loadFromStorage());
      }

      setLoading(false);
    })();
  }, []);

  // Always persist profile to localStorage immediately so it survives refreshes
  const saveProfile = useCallback(async (p: PatientProfile) => {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
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

  const signUpOrIn = useCallback(async (emailAddr: string, pwd: string): Promise<boolean> => {
    setAuthError(null);
    const supabase = getSupabaseBrowserClient();

    // Try sign in first
    const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
      email: emailAddr,
      password: pwd,
    });

    if (!signInErr && signInData.user) {
      setUserId(signInData.user.id);
      // Migrate any localStorage profile to DB
      const local = loadFromStorage();
      await supabase.from("patient_profiles").upsert({
        id: signInData.user.id,
        age: local.age,
        gender: local.gender,
        known_conditions: local.knownConditions,
        current_medications: local.currentMedications || null,
        known_allergies: local.knownAllergies || null,
        last_bp: local.lastBp || null,
        blood_sugar: local.bloodSugar || null,
        updated_at: new Date().toISOString(),
      });
      return true;
    }

    // Sign up
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email: emailAddr,
      password: pwd,
    });

    if (signUpErr) {
      setAuthError(signUpErr.message);
      return false;
    }

    if (signUpData.user) {
      setUserId(signUpData.user.id);
      const local = loadFromStorage();
      await supabase.from("patient_profiles").upsert({
        id: signUpData.user.id,
        age: local.age,
        gender: local.gender,
        known_conditions: local.knownConditions,
        current_medications: local.currentMedications || null,
        known_allergies: local.knownAllergies || null,
        last_bp: local.lastBp || null,
        blood_sugar: local.bloodSugar || null,
        updated_at: new Date().toISOString(),
      });
    }
    return true;
  }, []);

  return {
    userId,
    profile,
    setProfile,
    loading,
    saveProfile,
    email,
    setEmail,
    password,
    setPassword,
    authError,
    signUpOrIn,
  };
}
