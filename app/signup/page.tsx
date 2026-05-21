import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { hasSupabaseEnv } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { signup } from "@/server/actions/auth";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const { message } = await searchParams;

  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      redirect("/settings/company");
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8">
      <form action={signup} className="grid w-full max-w-sm gap-4 rounded-lg border border-zinc-200 bg-white p-5">
        <div>
          <h1 className="text-2xl font-bold">CraftFlow starten</h1>
          <p className="mt-1 text-sm text-zinc-600">Nach der Registrierung folgt das Firmenprofil.</p>
        </div>
        {message ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm font-medium text-amber-900">{message}</p>
        ) : null}
        <Field label="E-Mail">
          <Input name="email" type="email" autoComplete="email" required />
        </Field>
        <Field label="Passwort">
          <Input name="password" type="password" autoComplete="new-password" minLength={6} required />
        </Field>
        <Button type="submit">Registrieren</Button>
        <Link className="text-center text-sm font-medium text-emerald-800" href="/login">
          Ich habe schon ein Konto
        </Link>
      </form>
    </main>
  );
}
