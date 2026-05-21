"use server";

import { redirect } from "next/navigation";
import { hasSupabaseEnv } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";

function authRedirect(path: string, message: string) {
  const params = new URLSearchParams({ message });
  redirect(`${path}?${params.toString()}`);
}

function formValue(formData: FormData, key: string) {
  return String(formData.get(key) ?? "");
}

export async function login(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/dashboard");
  }

  const email = formValue(formData, "email");
  const password = formValue(formData, "password");
  const next = formValue(formData, "next") || "/dashboard";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    authRedirect("/login", "E-Mail oder Passwort ist falsch.");
  }

  redirect(next.startsWith("/") ? next : "/dashboard");
}

export async function signup(formData: FormData) {
  if (!hasSupabaseEnv()) {
    redirect("/settings/company");
  }

  const email = formValue(formData, "email");
  const password = formValue(formData, "password");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    authRedirect("/signup", error.message);
  }

  if (!data.session) {
    authRedirect("/login", "Bitte bestätige deine E-Mail und melde dich danach an.");
  }

  redirect("/settings/company");
}

export async function logout() {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  redirect("/login");
}
