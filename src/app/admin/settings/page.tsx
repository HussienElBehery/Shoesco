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
      <form action={saveSettings} className="mt-8 max-w-3xl rounded-[1.75rem] bg-[#181b21] p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          {fields.map(([name, label, value]) => <label className="text-sm font-semibold" key={name}>{label}<input className="mt-2 h-12 w-full rounded-xl border px-4" defaultValue={value} name={name} required /></label>)}
        </div>
        <label className="mt-5 block text-sm font-semibold">Homepage description<textarea className="mt-2 min-h-28 w-full rounded-xl border p-4" defaultValue={settings.heroDescription} name="heroDescription" required /></label>
        <label className="mt-5 block text-sm font-semibold">Delivery note<textarea className="mt-2 min-h-24 w-full rounded-xl border p-4" defaultValue={settings.deliveryNote} name="deliveryNote" required /></label>
        <label className="mt-5 block text-sm font-semibold">Exchange note<textarea className="mt-2 min-h-24 w-full rounded-xl border p-4" defaultValue={settings.returnsNote} name="returnsNote" required /></label>
        <label className="mt-5 block text-sm font-semibold">Size guide note<textarea className="mt-2 min-h-24 w-full rounded-xl border p-4" defaultValue={settings.sizeGuideNote} name="sizeGuideNote" required /></label>
        <div className="mt-7 border-t border-[#2a2e36] pt-7">
          <div className="flex items-start justify-between gap-5">
            <div>
              <h2 className="text-xl font-semibold">WhatsApp order reply</h2>
              <p className="mt-2 text-sm leading-6 text-neutral-500">
                Used to prefill the owner&apos;s reply. Available placeholders: {"{customer_name}"}, {"{order_reference}"}, {"{subtotal}"}, and {"{status}"}.
              </p>
            </div>
            <label className="flex shrink-0 items-center gap-2 text-sm font-semibold">
              <input defaultChecked={settings.orderReplyEnabled} name="orderReplyEnabled" type="checkbox" />
              Enabled
            </label>
          </div>
          <label className="mt-5 block text-sm font-semibold">
            Reply template
            <textarea className="mt-2 min-h-36 w-full rounded-xl border p-4" defaultValue={settings.orderReplyTemplate} maxLength={1000} name="orderReplyTemplate" required />
          </label>
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            This is a one-click reply in phase one. Automatic sending begins only after the Meta WhatsApp Business webhook is configured.
          </p>
        </div>
        <button className="mt-7 rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-semibold text-[#f4f1ea]" type="submit">Save settings</button>
      </form>
      <form action={changeOwnerPassword} className="mt-6 max-w-3xl rounded-[1.75rem] bg-[#181b21] p-6 sm:p-8">
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
