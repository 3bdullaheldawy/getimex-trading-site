"use client";

import { useState } from "react";
import { ApiState, PageHead, Switch, TableSkeleton, fmtDate, relTime, send, useApi, useToast } from "@/components/admin/ui";
import { IconPlus, IconUsers } from "@/components/admin/AdminIcons";

type Role = "SuperAdmin" | "ContentEditor" | "SalesInbox";
type User = { id: string; name: string; email: string; role: Role; isActive: boolean; lastLoginAt: string | null; createdAt: string };
const roles: { value: Role; label: string; hint: string }[] = [
  { value: "SalesInbox", label: "Sales inbox", hint: "Reads and updates quotation requests" },
  { value: "ContentEditor", label: "Content editor", hint: "Manages products, categories and media" },
  { value: "SuperAdmin", label: "Super admin", hint: "Full access including team and settings" },
];
const roleLabel = Object.fromEntries(roles.map((r) => [r.value, r.label])) as Record<Role, string>;

export default function AdminUsersPage() {
  const api = useApi<User[]>("/api/admin/users");
  const { node: toast, show } = useToast();
  const [adding, setAdding] = useState(false);
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const items = api.data ?? [];

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    setSending(true);
    try {
      const created = await send("/api/admin/users", "POST", { name: form.get("name"), email: form.get("email"), role: form.get("role"), password: form.get("password"), isActive: true });
      api.setData((current) => [...(current ?? []), { ...created, lastLoginAt: null, createdAt: new Date().toISOString() }]);
      formEl.reset(); setAdding(false); show("Team member added");
    } catch (error) { show(error instanceof Error ? error.message : "Unable to add user", true); }
    setSending(false);
  }

  async function update(user: User, patch: Partial<User>, message: string) {
    setBusy(user.id);
    const next = { ...user, ...patch };
    try { await send(`/api/admin/users/${user.id}`, "PATCH", { name: next.name, email: next.email, role: next.role, isActive: next.isActive }); api.setData((current) => current?.map((u) => u.id === user.id ? next : u) ?? null); show(message); }
    catch (error) { show(error instanceof Error ? error.message : "Unable to update", true); }
    setBusy(null);
  }

  return <>
    <PageHead title="Team & access" body="Who can sign in to the CMS and what each person can change.">
      <button type="button" className="btn btn-accent" onClick={() => setAdding((v) => !v)}><IconPlus size={15} />{adding ? "Cancel" : "Add member"}</button>
    </PageHead>
    {adding && <form className="panel" onSubmit={create}>
      <div className="form-section"><div><h3>New team member</h3><p>Share the password privately. They can sign in immediately.</p></div>
        <div className="form">
          <div className="form-row"><label className="f"><span>Full name</span><input name="name" required minLength={2} autoComplete="off" /></label><label className="f"><span>Work email</span><input name="email" type="email" required autoComplete="off" /></label></div>
          <div className="form-row"><label className="f"><span>Role</span><select name="role" defaultValue="SalesInbox">{roles.map((r) => <option key={r.value} value={r.value}>{r.label} — {r.hint}</option>)}</select></label><label className="f"><span>Temporary password</span><input name="password" type="password" required minLength={12} autoComplete="new-password" /><small>At least 12 characters.</small></label></div>
        </div>
      </div>
      <div className="form-bar"><button type="button" className="btn" onClick={() => setAdding(false)}>Cancel</button><button className="btn btn-primary" disabled={sending}>{sending ? "Adding…" : "Add member"}</button></div>
    </form>}
    <div className="panel">
      {api.loading ? <TableSkeleton cols={5} rows={3} /> : api.error ? <ApiState status={api.status} error={api.error} onRetry={api.reload} /> : !items.length ? <div className="state"><span className="state-ico"><IconUsers size={24} /></span><h3>No team members</h3><p>Add the first editor or sales colleague.</p></div> :
        <div className="table-wrap"><table className="table"><thead><tr><th>Member</th><th>Role</th><th>Last sign-in</th><th>Joined</th><th>Active</th></tr></thead><tbody>
          {items.map((u) => <tr key={u.id}>
            <td><div className="cell-media"><span className="cms-avatar" style={{ width: 32, height: 32, fontSize: 12 }}>{u.name.split(/\s+/).map((p) => p[0]).join("").slice(0, 2).toUpperCase()}</span><div><span className="primary">{u.name}</span><span className="sub">{u.email}</span></div></div></td>
            <td><select className="btn btn-sm" value={u.role} disabled={busy === u.id} onChange={(e) => update(u, { role: e.target.value as Role }, "Role updated")} aria-label={`Role for ${u.name}`}>{roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}</select></td>
            <td className="num" title={fmtDate(u.lastLoginAt)}>{u.lastLoginAt ? relTime(u.lastLoginAt) : "Never"}</td>
            <td className="num">{fmtDate(u.createdAt).split(",")[0]}</td>
            <td><Switch checked={u.isActive} disabled={busy === u.id} label={`Activate ${u.name}`} onChange={() => update(u, { isActive: !u.isActive }, u.isActive ? `${roleLabel[u.role]} access paused` : "Access restored")} /></td>
          </tr>)}
        </tbody></table></div>}
    </div>
    {toast}
  </>;
}
