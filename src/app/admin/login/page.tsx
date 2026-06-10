import { redirect } from "next/navigation";

import { signIn } from "@/app/admin/actions";
import { BrandMark } from "@/components/ui/BrandMark";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type LoginPageProps = { searchParams: Promise<{ error?: string }> };

export default async function AdminLoginPage({ searchParams }: LoginPageProps) {
  if (!isSupabaseConfigured) redirect("/admin?setup=required");
  const { error } = await searchParams;
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eeeae1] px-5">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl sm:p-10">
        <BrandMark />
        <p className="eyebrow mt-10">Owner dashboard</p>
        <h1 className="mt-3 text-3xl font-semibold">Welcome back.</h1>
        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error === "not-authorized" ? "This account is not approved as an owner." : error}</p>}
        <form action={signIn} className="mt-7 space-y-5">
          <label className="block text-sm font-semibold">Email<input className="mt-2 h-12 w-full rounded-xl border px-4" name="email" required type="email" /></label>
          <label className="block text-sm font-semibold">Password<input className="mt-2 h-12 w-full rounded-xl border px-4" name="password" required type="password" /></label>
          <button className="w-full rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white" type="submit">Sign in</button>
        </form>
      </div>
    </main>
  );
}
