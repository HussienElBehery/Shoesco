import { changeOwnerPassword, saveSettings } from "@/app/admin/actions";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/admin";
import { getStoreSettings } from "@/lib/catalog";

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    saved?: string;
    passwordChanged?: string;
    passwordError?: string;
  }>;
}) {
  await requireAdmin();
  const settings = await getStoreSettings();
  const status = await searchParams;
  const inputClass = "mt-2 h-12 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115] px-4";
  const textareaClass = "mt-2 min-h-28 w-full rounded-xl border border-[#2a2e36] bg-[#0f1115] p-4";
  const sectionClass = "rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-6 sm:p-8";

  return (
    <AdminShell>
      <p className="eyebrow">Website content</p>
      <h1 className="mt-3 text-4xl font-semibold">Store settings</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-neutral-400">
        These settings feed the homepage, contact page, order replies, and customer service notes. Save changes to refresh the public store cache.
      </p>

      {status.saved && (
        <p className="mt-6 max-w-3xl rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Settings saved and public pages refreshed.
        </p>
      )}

      <form action={saveSettings} className="mt-8 max-w-5xl space-y-6">
        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">Contact channels</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Used on the contact page, footer actions, and WhatsApp order links.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              WhatsApp international number
              <input className={inputClass} defaultValue={settings.whatsappNumber} name="whatsappNumber" required />
            </label>
            <label className="text-sm font-semibold">
              WhatsApp display number
              <input className={inputClass} defaultValue={settings.whatsappDisplayNumber} name="whatsappDisplayNumber" required />
            </label>
            <label className="text-sm font-semibold">
              Email
              <input className={inputClass} defaultValue={settings.email} name="email" required type="email" />
            </label>
            <label className="text-sm font-semibold">
              Support hours
              <input className={inputClass} defaultValue={settings.supportHours} name="supportHours" required />
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Location
              <input className={inputClass} defaultValue={settings.location} name="location" required />
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">Social links</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Instagram URL
              <input className={inputClass} defaultValue={settings.instagramUrl} name="instagramUrl" type="url" />
            </label>
            <label className="text-sm font-semibold">
              TikTok URL
              <input className={inputClass} defaultValue={settings.tiktokUrl} name="tiktokUrl" type="url" />
            </label>
          </div>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">Homepage copy</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Updates the public homepage text. Product uploads do not replace the fixed homepage mockups.
          </p>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Homepage eyebrow
              <input className={inputClass} defaultValue={settings.heroEyebrow} name="heroEyebrow" required />
            </label>
            <label className="text-sm font-semibold">
              Homepage headline
              <input className={inputClass} defaultValue={settings.heroTitle} name="heroTitle" required />
            </label>
          </div>
          <label className="mt-5 block text-sm font-semibold">
            Homepage description
            <textarea className={textareaClass} defaultValue={settings.heroDescription} name="heroDescription" required />
          </label>
        </section>

        <section className={sectionClass}>
          <h2 className="text-xl font-semibold">Customer service notes</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-500">
            Shown where customers need delivery, exchange, and sizing guidance.
          </p>
          <label className="mt-5 block text-sm font-semibold">
            Delivery note
            <textarea className={textareaClass} defaultValue={settings.deliveryNote} name="deliveryNote" required />
          </label>
          <label className="mt-5 block text-sm font-semibold">
            Exchange note
            <textarea className={textareaClass} defaultValue={settings.returnsNote} name="returnsNote" required />
          </label>
          <label className="mt-5 block text-sm font-semibold">
            Size guide note
            <textarea className={textareaClass} defaultValue={settings.sizeGuideNote} name="sizeGuideNote" required />
          </label>
        </section>

        <section className={sectionClass}>
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
            <textarea className={textareaClass} defaultValue={settings.orderReplyTemplate} maxLength={1000} name="orderReplyTemplate" required />
          </label>
          <p className="mt-3 text-xs leading-5 text-neutral-500">
            This is a one-click reply in phase one. Automatic sending begins only after the Meta WhatsApp Business webhook is configured.
          </p>
        </section>

        <button className="rounded-full bg-[#c6ff3a] px-6 py-3.5 text-sm font-semibold text-[#0f1115]" type="submit">
          Save settings
        </button>
      </form>

      <form action={changeOwnerPassword} className="mt-6 max-w-5xl rounded-[1.5rem] border border-[#2a2e36] bg-[#181b21] p-6 sm:p-8">
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
            <input className={inputClass} name="password" required type="password" />
          </label>
          <label className="text-sm font-semibold">
            Confirm password
            <input className={inputClass} name="passwordConfirmation" required type="password" />
          </label>
        </div>
        <button className="mt-6 rounded-full border border-[#2a2e36] px-6 py-3 text-sm font-semibold" type="submit">
          Update password
        </button>
      </form>
    </AdminShell>
  );
}
