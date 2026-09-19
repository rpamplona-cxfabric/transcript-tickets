'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  ChevronDown,
  MailPlus,
  MoreHorizontal,
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { Select } from '@/components/select';
import { StatusBadge } from '@/components/statusBadge';
import { SortableTableHeaderCell, TableHeader, TableSortDirection } from '@/components/tableHeader';
import { fetchUsers, inviteUsers, removeUser, updateUserRole, updateUserStatus } from '@/lib/api/users';
import type { TenantRole, TenantUser } from '@/lib/udas/usersApi';
import { useUserStore } from '@/lib/store/user';

const emailExpression = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const userName = (user: TenantUser) =>
  `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email_address || 'Unnamed user';

const Dialog = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/45 p-4 backdrop-blur-sm" onClick={onClose}>
    <section
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => event.stopPropagation()}
      className="app-surface app-shadow-surface w-full max-w-lg rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800 sm:p-6"
    >
      <div className="flex items-center justify-between gap-4 border-b border-zinc-200 pb-4 dark:border-zinc-800">
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white">{title}</h2>
        <button type="button" onClick={onClose} className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-black dark:hover:text-white" aria-label={`Close ${title}`}>
          <X className="h-5 w-5" />
        </button>
      </div>
      {children}
    </section>
  </div>
);

const InviteDialog = ({
  roles,
  onClose,
  onInvite,
  isPending,
}: {
  roles: TenantRole[];
  onClose: () => void;
  onInvite: (emails: string[], userRoles: Record<string, string>, message: string) => void;
  isPending: boolean;
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [emails, setEmails] = useState<string[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const roleOptions = roles.filter((role) => role.name.toLowerCase() !== 'owner').map((role) => ({ value: role.id, label: role.name }));

  const addEmails = () => {
    const values = emailInput.split(/[\s,;]+/).map((email) => email.trim().toLowerCase()).filter(Boolean);
    const invalid = values.filter((email) => !emailExpression.test(email));
    if (invalid.length) {
      toast.error('Enter valid email addresses.');
      return;
    }
    const nextEmails = [...new Set([...emails, ...values])].slice(0, 10);
    if (nextEmails.length < emails.length + values.length) toast.error('You can invite up to 10 users at a time.');
    setEmails(nextEmails);
    setEmailInput('');
  };

  return (
    <Dialog title="Invite users" onClose={isPending ? () => undefined : onClose}>
      <div className="space-y-5 pt-5">
        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Email addresses</label>
          <div className="flex gap-2">
            <input
              value={emailInput}
              onChange={(event) => setEmailInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addEmails();
                }
              }}
              placeholder="name@example.com"
              className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white"
            />
            <button type="button" onClick={addEmails} className="rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-black">Add</button>
          </div>
          <p className="mt-2 text-xs lg:text-sm text-zinc-500 dark:text-zinc-400">Separate multiple addresses with commas, spaces, or Enter.</p>
        </div>

        {emails.length > 0 && (
          <div className="space-y-2">
            {emails.map((email) => (
              <div key={email} className="app-surface-raised flex flex-col gap-2 rounded-xl border border-zinc-200 p-3 dark:border-[#293442] sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">{email}</span>
                <div className="flex items-center gap-2 sm:w-48">
                  <Select value={userRoles[email] || ''} onChange={(value) => setUserRoles((current) => ({ ...current, [email]: value }))} options={[{ value: '', label: 'Select role' }, ...roleOptions]} />
                  <button type="button" onClick={() => setEmails((current) => current.filter((item) => item !== email))} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-black" aria-label={`Remove ${email}`}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Message <span className="font-normal text-zinc-400">(optional)</span></label>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={3} placeholder="Hey! I’m inviting you to my team." className="w-full resize-none rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white" />
        </div>

        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <button type="button" onClick={onClose} disabled={isPending} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-black">Cancel</button>
          <button type="button" onClick={() => onInvite(emails, userRoles, message)} disabled={!emails.length || isPending} className="inline-flex items-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
            <MailPlus className="h-4 w-4" /> {isPending ? 'Sending…' : 'Send invite'}
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export const UsersClient = () => {
  const queryClient = useQueryClient();
  const profile = useUserStore((state) => state.profile);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [actionUser, setActionUser] = useState<TenantUser | null>(null);
  const [roleUser, setRoleUser] = useState<TenantUser | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TenantUser | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sort, setSort] = useState<{ field: 'user' | 'role' | 'status'; direction: Exclude<TableSortDirection, null> } | null>(null);

  const { data, isLoading, error } = useQuery({ queryKey: ['tenant-users'], queryFn: fetchUsers });
  const users = data?.users ?? [];
  const roles = data?.roles ?? [];
  const roleOptions = roles.filter((role) => role.name.toLowerCase() !== 'owner').map((role) => ({ value: role.id, label: role.name }));
  const roleName = (roleId: string | null) => roles.find((role) => role.id === roleId)?.name || 'No role';
  const refresh = () => queryClient.invalidateQueries({ queryKey: ['tenant-users'] });

  const inviteMutation = useMutation({
    mutationFn: async (input: Parameters<typeof inviteUsers>[0]) => {
      const result = await inviteUsers(input);
      if (!result?.isSuccessful) throw new Error(result?.message || 'Unable to send invitations.');
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || 'Invitations sent.');
      setIsInviteOpen(false);
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const statusMutation = useMutation({
    mutationFn: async ({ auth0Id, status }: { auth0Id: string; status: 'active' | 'suspended' }) => {
      const result = await updateUserStatus(auth0Id, status);
      if (!result?.isSuccessful) throw new Error(result?.message || 'Unable to update user status.');
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || 'User status updated.');
      setActionUser(null);
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const roleMutation = useMutation({
    mutationFn: async ({ auth0Id, roleId }: { auth0Id: string; roleId: string }) => {
      const result = await updateUserRole(auth0Id, roleId);
      if (!result?.isSuccessful) throw new Error(result?.message || 'Unable to update user role.');
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || 'Role updated.');
      setRoleUser(null);
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const removeMutation = useMutation({
    mutationFn: async (auth0Id: string) => {
      const result = await removeUser(auth0Id);
      if (!result?.isSuccessful) throw new Error(result?.message || 'Unable to remove user.');
      return result;
    },
    onSuccess: (result) => {
      toast.success(result.message || 'User removed.');
      setRemoveTarget(null);
      void refresh();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const searchTerm = search.trim().toLowerCase();
  const filteredUsers = users.filter((user) => {
    const matchesSearch = !searchTerm || `${userName(user)} ${user.email_address || ''} ${roles.find((role) => role.id === user.role_id)?.name || ''} ${user.status || ''}`
      .toLowerCase()
      .includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role_id === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  }).sort((left, right) => {
    if (!sort) return 0;
    const value = (user: TenantUser) => {
      if (sort.field === 'user') return userName(user);
      if (sort.field === 'role') return roleName(user.role_id);
      return user.status || '';
    };
    return value(left).localeCompare(value(right)) * (sort.direction === 'asc' ? 1 : -1);
  });

  const toggleSort = (field: 'user' | 'role' | 'status') => {
    setSort((current) => current?.field === field
      ? { field, direction: current.direction === 'asc' ? 'desc' : 'asc' }
      : { field, direction: 'asc' });
  };

  return (
    <div className="workspace-canvas flex flex-1">
      <main className="flex w-full flex-col gap-4">
        <section className="app-surface app-shadow-surface rounded-2xl border border-zinc-200 p-5 dark:border-zinc-800 sm:p-6">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white md:text-2xl">Users</h1>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Manage invitations, roles, and account access for your workspace.</p>
            </div>
            <button type="button" onClick={() => setIsInviteOpen(true)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200">
              <MailPlus className="h-4 w-4" /> Invite users
            </button>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search users..." className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-10 pr-3.5 text-sm outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-black dark:text-white dark:focus:border-white" />
            </div>
            <Select value={statusFilter} onChange={setStatusFilter} options={[{ value: 'all', label: 'All statuses' }, { value: 'active', label: 'Active' }, { value: 'invited', label: 'Invited' }, { value: 'suspended', label: 'Suspended' }]} className="lg:w-40" />
            <Select value={roleFilter} onChange={setRoleFilter} options={[{ value: 'all', label: 'All roles' }, ...roles.map((role) => ({ value: role.id, label: role.name }))]} className="lg:w-48" />
          </div>
        </section>

        <section className="app-surface app-shadow-surface min-h-0 flex-1 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {isLoading ? (
            <>
              <div className="space-y-3 p-4 lg:hidden">{Array.from({ length: 5 }, (_, index) => <div key={index} className="h-16 animate-pulse rounded-xl bg-zinc-100 dark:bg-[#151d27]" />)}</div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <TableHeader><tr><SortableTableHeaderCell sortDirection={null}>USERS</SortableTableHeaderCell><SortableTableHeaderCell sortDirection={null}>ROLE</SortableTableHeaderCell><SortableTableHeaderCell sortDirection={null}>STATUS</SortableTableHeaderCell><th className="px-6 py-2 text-right">ACTIONS</th></tr></TableHeader>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {Array.from({ length: 5 }, (_, index) => <tr key={index}><td className="px-6 py-4"><div className="h-9 w-52 animate-pulse rounded-lg bg-zinc-100 dark:bg-[#151d27]" /></td><td className="px-6 py-4"><div className="h-4 w-20 animate-pulse rounded bg-zinc-100 dark:bg-[#151d27]" /></td><td className="px-6 py-4"><div className="h-7 w-20 animate-pulse rounded-full bg-zinc-100 dark:bg-[#151d27]" /></td><td className="px-6 py-4"><div className="ml-auto h-8 w-8 animate-pulse rounded-lg bg-zinc-100 dark:bg-[#151d27]" /></td></tr>)}
                  </tbody>
                </table>
              </div>
            </>
          ) : error ? (
            <div className="p-8 text-center text-sm text-red-600 dark:text-red-400">{error instanceof Error ? error.message : 'Unable to load users.'}</div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center"><UserRound className="mx-auto h-9 w-9 text-zinc-300 dark:text-zinc-700" /><p className="mt-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300">No users found</p></div>
          ) : (
            <>
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800 lg:hidden">
                {filteredUsers.map((user) => <UserCard key={user.auth0_id} user={user} role={roleName(user.role_id)} onAction={setActionUser} />)}
              </div>
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full text-left text-sm">
                  <TableHeader><tr><SortableTableHeaderCell sortDirection={sort?.field === 'user' ? sort.direction : null} onSort={() => toggleSort('user')}>USERS</SortableTableHeaderCell><SortableTableHeaderCell sortDirection={sort?.field === 'role' ? sort.direction : null} onSort={() => toggleSort('role')}>ROLE</SortableTableHeaderCell><SortableTableHeaderCell sortDirection={sort?.field === 'status' ? sort.direction : null} onSort={() => toggleSort('status')}>STATUS</SortableTableHeaderCell><th className="px-6 py-2 text-right">ACTIONS</th></tr></TableHeader>
                  <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    {filteredUsers.map((user) => <tr key={user.auth0_id} className="hover:bg-zinc-50 dark:hover:bg-[#151d27]"><td className="px-6 py-4"><UserIdentity user={user} /></td><td className="px-6 py-4 font-bold text-zinc-700 dark:text-zinc-300">{roleName(user.role_id)}</td><td className="px-6 py-4"><StatusBadge status={user.status} /></td><td className="px-6 py-4 text-right"><button type="button" onClick={() => setActionUser(user)} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-black dark:hover:text-white" aria-label={`Actions for ${userName(user)}`}><MoreHorizontal className="h-5 w-5" /></button></td></tr>)}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>

      {isInviteOpen && <InviteDialog roles={roles} onClose={() => setIsInviteOpen(false)} isPending={inviteMutation.isPending} onInvite={(emails, userRoles, message) => inviteMutation.mutate({ emails, roles: userRoles, message })} />}
      {actionUser && <ActionDialog user={actionUser} isCurrentUser={actionUser.auth0_id === profile?.auth0_id} onClose={() => setActionUser(null)} onAssignRole={() => { setRoleUser(actionUser); setActionUser(null); }} onRemove={() => { setRemoveTarget(actionUser); setActionUser(null); }} onReinvite={() => inviteMutation.mutate({ emails: [actionUser.email_address || ''], roles: actionUser.role_id ? { [actionUser.email_address || '']: actionUser.role_id } : {}, message: '' })} onStatus={(status) => statusMutation.mutate({ auth0Id: actionUser.auth0_id, status })} isPending={inviteMutation.isPending || statusMutation.isPending} />}
      {roleUser && <RoleDialog user={roleUser} roleOptions={roleOptions} onClose={() => setRoleUser(null)} onSave={(roleId) => roleMutation.mutate({ auth0Id: roleUser.auth0_id, roleId })} isPending={roleMutation.isPending} />}
      {removeTarget && <RemoveDialog user={removeTarget} onClose={() => setRemoveTarget(null)} onRemove={() => removeMutation.mutate(removeTarget.auth0_id)} isPending={removeMutation.isPending} />}
    </div>
  );
};

const UserIdentity = ({ user, role }: { user: TenantUser; role?: string }) => {
  const initials = userName(user).split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return <div className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 text-xs lg:text-sm font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-200">{user.image ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={user.image} alt="" className="h-full w-full object-cover" />
  ) : initials}</span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-zinc-900 dark:text-white">{userName(user)}</span><span className={`block truncate text-xs lg:text-sm text-zinc-500 dark:text-zinc-400 ${role ? 'mb-1' : ''}`}>{user.email_address || 'No email address'}</span>{role && <span className="block text-xs lg:text-sm font-bold text-zinc-700 dark:text-zinc-300">{role}</span>}</span></div>;
};

const UserCard = ({ user, role, onAction }: { user: TenantUser; role: string; onAction: (user: TenantUser) => void }) => <button type="button" onClick={() => onAction(user)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-zinc-50 dark:hover:bg-[#151d27]"><UserIdentity user={user} role={role} /><div className="ml-auto shrink-0"><StatusBadge status={user.status} /></div><ChevronDown className="h-4 w-4 shrink-0 text-zinc-400 -rotate-90" /></button>;

const ActionDialog = ({ user, isCurrentUser, onClose, onAssignRole, onRemove, onReinvite, onStatus, isPending }: { user: TenantUser; isCurrentUser: boolean; onClose: () => void; onAssignRole: () => void; onRemove: () => void; onReinvite: () => void; onStatus: (status: 'active' | 'suspended') => void; isPending: boolean }) => <Dialog title={userName(user)} onClose={onClose}><div className="space-y-2 pt-5">{user.status === 'invited' && <ActionButton onClick={onReinvite} disabled={isPending} icon={MailPlus} label={isPending ? 'Sending invitation…' : 'Reinvite'} />}{user.status === 'active' && <ActionButton onClick={() => onStatus('suspended')} disabled={isPending} icon={ShieldCheck} label="Suspend user" />}{user.status === 'suspended' && <ActionButton onClick={() => onStatus('active')} disabled={isPending} icon={ShieldCheck} label="Unsuspend user" />}{!isCurrentUser && <><ActionButton onClick={onAssignRole} icon={UserRoundCheck} label="Assign role" /><ActionButton onClick={onRemove} icon={Trash2} label="Remove user" danger /></>}</div></Dialog>;

const ActionButton = ({ onClick, icon: Icon, label, danger = false, disabled = false }: { onClick: () => void; icon: typeof MailPlus; label: string; danger?: boolean; disabled?: boolean }) => <button type="button" onClick={onClick} disabled={disabled} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors disabled:opacity-50 ${danger ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20' : 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-black'}`}><Icon className="h-4 w-4" />{label}</button>;

const RoleDialog = ({ user, roleOptions, onClose, onSave, isPending }: { user: TenantUser; roleOptions: { value: string; label: string }[]; onClose: () => void; onSave: (roleId: string) => void; isPending: boolean }) => { const [roleId, setRoleId] = useState(user.role_id || ''); return <Dialog title="Assign role" onClose={onClose}><div className="space-y-5 pt-5"><p className="text-sm text-zinc-500 dark:text-zinc-400">Choose the role for {userName(user)}.</p><Select value={roleId} onChange={setRoleId} options={[{ value: '', label: 'Select role' }, ...roleOptions]} /><div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800"><button type="button" onClick={onClose} disabled={isPending} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">Cancel</button><button type="button" onClick={() => onSave(roleId)} disabled={!roleId || roleId === user.role_id || isPending} className="rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-zinc-950">{isPending ? 'Saving…' : 'Save role'}</button></div></div></Dialog>; };

const RemoveDialog = ({ user, onClose, onRemove, isPending }: { user: TenantUser; onClose: () => void; onRemove: () => void; isPending: boolean }) => <Dialog title="Remove user" onClose={onClose}><div className="space-y-5 pt-5"><p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">Are you sure you want to remove <strong className="text-zinc-900 dark:text-white">{user.email_address || userName(user)}</strong> from this workspace?</p><div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800"><button type="button" onClick={onClose} disabled={isPending} className="rounded-xl border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 dark:border-zinc-700 dark:text-zinc-200">Cancel</button><button type="button" onClick={onRemove} disabled={isPending} className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50">{isPending ? 'Removing…' : 'Remove user'}</button></div></div></Dialog>;
