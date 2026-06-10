import { changeOwnerPassword, saveSettings } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { getStoreSettings } from "@/lib/catalog";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    passwordChanged?: string;
    passwordError?: string;
  }>;
}) {
  await requireAdmin();
  const settings = await getStoreSettings();
  const status = await searchParams;
  const fields = [
    ["whatsappNumber", "WhatsApp international number", settings.whatsappNumber],
    ["whatsappDisplayNumber", "WhatsApp display number", settings.whatsappDisplayNumber],
    ["instagramUrl", "Instagram URL", settings.instagramUrl],
    ["tiktokUrl", "TikTok URL", settings.tiktokUrl],
    ["email", "Email", settings.email],
    ["location", "Location", settings.location],
    ["supportHours", "Support hours", settings.supportHours],
    ["heroEyebrow", "Homepage eyebrow", settings.heroEyebrow],
    ["heroTitle", "Homepage headline", settings.heroTitle],
  ];
  return (
    <AdminShell>
      <p className="eyebrow">Website content</p><h1 className="mt-3 text-4xl font-semibold">Store settings</h1>
      <form action={saveSettings} className="mt-8 max-w-3xl rounded-[1.75rem] bg-white p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map(([name, label, value]) => <label className="text-sm font-semibold" key={name}>{label}<input className="mt-2 h-12 w-full rounded-xl border px-4" defaultValue={value} name={name} required /></label>)}
        </div>
        <label className="mt-5 block text-sm font-semibold">Homepage description<textarea className="mt-2 min-h-28 w-full rounded-xl border p-4" defaultValue={settings.heroDescription} name="heroDescription" required /></label>
        <button className="mt-7 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-white" type="submit">Save settings</button>
      </form>
      <form action={changeOwnerPassword} className="mt-6 max-w-3xl rounded-[1.75rem] bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">Change owner password</h2>
        <p className="mt-2 text-sm text-neutral-500">
          Use at least eight characters with uppercase, lowercase, numbers, and symbols.
        </p>
        {status.passwordChanged && (
          <p className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">
            Password changed successfully.
          </p>
        )}
        {status.passwordError && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            Passwords must match and meet the security requirements.
          </p>
        )}
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-semibold">
            New password
            <input className="mt-2 h-12 w-full rounded-xl border px-4" name="password" required type="password" />
          </label>
          <label className="text-sm font-semibold">
            Confirm password
            <input className="mt-2 h-12 w-full rounded-xl border px-4" name="passwordConfirmation" required type="password" />
          </label>
        </div>
        <button className="mt-6 rounded-full border border-neutral-950 px-6 py-3 text-sm font-semibold" type="submit">
          Update password
        </button>
      </form>
    </AdminShell>
  );
}
