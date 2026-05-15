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

async function fetchDbProfile(userId: string): Promise<PatientProfile | null> {
  const supabase = getSupabaseBrowserClient();
  const { data: row } = await supabase
    .from("patient_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (!row) return null;
  return {
    age: row.age ?? null,
    gender: (row.gender as PatientProfile["gender"]) ?? null,
    knownConditions: row.known_conditions ?? [],
    currentMedications: row.current_medications ?? "",
    knownAllergies: row.known_allergies ?? "",
    lastBp: row.last_bp ?? "",
    bloodSugar: row.blood_sugar ?? "",
  };
}

async function upsertDbProfile(userId: string, p: PatientProfile) {
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
}

export function usePatientProfile() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<PatientProfile>(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Initial load + keep all hook instances in sync when auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      void (async () => {
        if (session?.user) {
          setUserId(session.user.id);
          setUserEmail(session.user.email ?? null);
          setIsAuthenticated(true);

          if (event === "INITIAL_SESSION" || event === "SIGNED_IN") {
            const dbProfile = await fetchDbProfile(session.user.id);
            if (dbProfile) {
              setProfile(dbProfile);
              localStorage.setItem(LS_KEY, JSON.stringify(dbProfile));
            } else if (event === "INITIAL_SESSION") {
              setProfile(loadFromStorage());
            }
          }
        } else {
          setUserId(null);
          setUserEmail(null);
          setIsAuthenticated(false);
          if (event === "INITIAL_SESSION") setProfile(loadFromStorage());
        }

        if (event === "INITIAL_SESSION") setLoading(false);
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const saveProfile = useCallback(async (p: PatientProfile) => {
    localStorage.setItem(LS_KEY, JSON.stringify(p));
    if (!userId) return;
    await upsertDbProfile(userId, p);
  }, [userId]);

  const signIn = useCallback(async (emailAddr: string, pwd: string): Promise<boolean> => {
    setAuthError(null);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: emailAddr, password: pwd });
    if (error) { setAuthError(error.message); return false; }
    if (!data.user) return false;

    setUserId(data.user.id);
    setUserEmail(data.user.email ?? null);
    setIsAuthenticated(true);

    const dbProfile = await fetchDbProfile(data.user.id);
    if (dbProfile) {
      setProfile(dbProfile);
      localStorage.setItem(LS_KEY, JSON.stringify(dbProfile));
    }
    return true;
  }, []);

  const signUp = useCallback(async (emailAddr: string, pwd: string): Promise<boolean> => {
    setAuthError(null);
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signUp({ email: emailAddr, password: pwd });
    if (error) { setAuthError(error.message); return false; }
    if (!data.user) return false;

    setUserId(data.user.id);
    setUserEmail(data.user.email ?? null);
    setIsAuthenticated(true);

    // Migrate current form / localStorage profile to DB
    const local = loadFromStorage();
    await upsertDbProfile(data.user.id, local);
    return true;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    setUserId(null);
    setUserEmail(null);
    setIsAuthenticated(false);
  }, []);

  return {
    userId,
    userEmail,
    isAuthenticated,
    profile,
    setProfile,
    loading,
    saveProfile,
    email,
    setEmail,
    password,
    setPassword,
    authError,
    signIn,
    signUp,
    signOut,
  };
}
