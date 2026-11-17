import React, { useState } from 'react';
import { Copy, Loader2, LogIn } from 'lucide-react';
import { useStore } from '../../services/store';
import { Logo } from '../common/Logo';
import { toast } from '../ui/feedback';

type Mode = 'sign_in' | 'create' | 'reset';

/** One sign-in for everyone (Firebase Authentication). What a person can open
 *  afterwards depends only on the role on their account, never on how they signed in. */
export const SignIn: React.FC<{ onNavigateHome: () => void; onOpenAccount?: () => void; embedded?: boolean }> = ({
  onNavigateHome,
  onOpenAccount,
  embedded = false
}) => {
  const {
    authStatus,
    account,
    signInWithGoogle,
    signInWithPassword,
    createPasswordAccount,
    resetPassword,
    resendVerification,
    refreshAccount,
    logout,
    staffProblems
  } = useStore();

  const [mode, setMode] = useState<Mode>('sign_in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const run = async (label: string, fn: () => Promise<string | null>, success?: string) => {
    setBusy(label);
    setError(null);
    setNotice(null);
    const problem = await fn();
    setBusy(null);
    if (problem) setError(problem);
    else if (success) setNotice(success);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'reset') {
      run('reset', () => resetPassword(email), 'If that email has an account, a reset link is on its way. Check your inbox.');
    } else if (mode === 'create') {
      if (password.length < 8) {
        setError('Use a password of at least 8 characters.');
        return;
      }
      run('create', () => createPasswordAccount(email, password));
    } else {
      run('password', () => signInWithPassword(email, password));
    }
  };

  const copyUid = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.uid);
      toast('Account code copied');
    } catch {
      toast('Select the code and copy it by hand.', 'info');
    }
  };

  // Inside the shop the page header already carries the logo; on its own it shows it.
  const shell = (children: React.ReactNode) => (
    <div
      className={
        embedded
          ? 'flex justify-center px-4 py-12 md:py-16'
          : 'min-h-screen bg-paper text-ink flex flex-col justify-center items-center p-4'
      }
    >
      <div className="panel w-full max-w-md p-6 sm:p-8">
        {!embedded && (
          <button type="button" onClick={onNavigateHome} aria-label="Powermeat home" className="rounded-xl min-h-[44px] flex items-center mb-6">
            <Logo size="lg" />
          </button>
        )}
        {children}
        <button type="button" onClick={onNavigateHome} className="link mt-6 text-sm">
          Back to the store
        </button>
      </div>
    </div>
  );

  if (authStatus === 'loading') {
    return shell(
      <p className="flex items-center gap-3 text-ink-soft" role="status">
        <Loader2 size={20} className="animate-spin" />
        Checking your sign-in
      </p>
    );
  }

  if (authStatus === 'needs_fix' && account) {
    return shell(
      <>
        <h1 className="display text-4xl">Your staff record needs a small fix</h1>
        <p className="mt-3 text-ink-soft">
          You are signed in as <strong className="text-ink">{account.email}</strong>. The business area only opens once the
          record in Firestore is exactly right. In the Firebase console open Firestore Database, then{' '}
          <code className="num">staff</code>, then the document with this account code:
        </p>
        <span className="mt-3 flex items-center gap-2">
          <code className="num break-all rounded-lg bg-sand px-2 py-1.5 select-all">{account.uid}</code>
          <button type="button" onClick={copyUid} aria-label="Copy account code" className="icon-btn hover:bg-sand">
            <Copy size={18} />
          </button>
        </span>
        <h2 className="field-label mt-6">What to change</h2>
        <ul className="list-disc pl-5 space-y-2">
          {staffProblems.map(p => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p className="mt-4 text-ink-soft">Save the change in Firebase. This page updates by itself.</p>
        <button type="button" onClick={logout} className="btn btn-outline mt-6">
          Sign out
        </button>
      </>
    );
  }

  if (authStatus === 'inactive') {
    return shell(
      <>
        <h1 className="display text-4xl">This account is switched off</h1>
        <p className="mt-3 text-ink-soft">
          {account?.email} no longer has access to the business area. Please speak to the Owner.
        </p>
        <button type="button" onClick={logout} className="btn btn-outline mt-6">
          Sign out
        </button>
      </>
    );
  }

  if (authStatus === 'not_staff' && account) {
    if (account.usesPassword && !account.emailVerified) {
      return shell(
        <>
          <h1 className="display text-4xl">
            Check your <span className="text-brand-accent">email</span>
          </h1>
          <p className="mt-3 text-ink-soft">
            We sent a link to <strong className="text-ink">{account.email}</strong>. Open it to confirm the address,
            then come back and tap the button below.
          </p>
          <div className="mt-6 flex flex-col gap-2.5">
            <button type="button" onClick={() => run('refresh', async () => { await refreshAccount(); return null; })} className="btn btn-primary">
              {busy === 'refresh' ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>I have confirmed my email</span>
            </button>
            <button type="button" onClick={() => run('resend', resendVerification, 'A new link is on its way.')} className="btn btn-outline">
              Send the link again
            </button>
            <button type="button" onClick={onNavigateHome} className="btn btn-outline">
              Continue to the shop
            </button>
          </div>
          {notice && <p className="field-help" role="status">{notice}</p>}
          {error && <p className="field-error" role="alert">{error}</p>}
        </>
      );
    }

    return shell(
      <>
        <h1 className="display text-4xl">No access to the business area</h1>
        <p className="mt-3 text-ink-soft">
          You are signed in as <strong className="text-ink">{account.email}</strong>. This account has no role in the
          business area. If you work at Powermeat, ask the Owner to give you a role, then sign in again.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          {onOpenAccount && (
            <button type="button" onClick={onOpenAccount} className="btn btn-primary">
              Go to my account
            </button>
          )}
          <button type="button" onClick={logout} className="btn btn-outline">
            Sign out
          </button>
        </div>

        <details className="mt-8 rounded-2xl bg-sand p-4">
          <summary className="font-semibold min-h-[44px] flex items-center">Setting up as the Owner for the first time?</summary>
          <ol className="mt-3 list-decimal pl-5 space-y-2 text-sm">
            <li>Open the Firebase console, then Firestore Database.</li>
            <li>
              Start a collection called <code className="num">staff</code>, and use this account code as the document ID:
              <span className="mt-2 flex items-center gap-2">
                <code className="num break-all rounded-lg bg-white px-2 py-1.5 select-all">{account.uid}</code>
                <button type="button" onClick={copyUid} aria-label="Copy account code" className="icon-btn hover:bg-white">
                  <Copy size={18} />
                </button>
              </span>
            </li>
            <li>
              Add these fields: <code className="num">name</code> (your name), <code className="num">email</code> ({account.email}),{' '}
              <code className="num">role</code> = <code className="num">owner</code>, <code className="num">active</code> ={' '}
              <code className="num">true</code> (boolean).
            </li>
            <li>Save, then come back here. You will be let in straight away.</li>
          </ol>
        </details>
      </>
    );
  }

  return shell(
    <>
      <h1 className="display text-4xl">
        Sign <span className="text-brand-accent">in</span>
      </h1>

      <button
        type="button"
        onClick={() => run('google', signInWithGoogle)}
        disabled={!!busy}
        className="btn btn-primary btn-block mt-6"
      >
        {busy === 'google' ? <Loader2 size={18} className="animate-spin" /> : <LogIn size={18} />}
        <span>Sign in with Google</span>
      </button>

      <p className="my-6 text-center text-sm text-ink-soft">or use your email</p>

      <form onSubmit={submit} noValidate>
        <label htmlFor="signin-email" className="field-label">
          Email
        </label>
        <input
          id="signin-email"
          type="email"
          autoComplete="username"
          maxLength={254}
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="field"
        />

        {mode !== 'reset' && (
          <>
            <label htmlFor="signin-password" className="field-label mt-4">
              {mode === 'create' ? 'Choose a password' : 'Password'}
            </label>
            <input
              id="signin-password"
              type="password"
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              minLength={mode === 'create' ? 8 : undefined}
              maxLength={128}
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="field"
            />
            {mode === 'create' && <p className="field-help">At least 8 characters.</p>}
          </>
        )}

        {error && (
          <p className="field-error" role="alert">
            {error}
          </p>
        )}
        {notice && (
          <p className="field-help" role="status">
            {notice}
          </p>
        )}

        <button type="submit" disabled={!!busy} className="btn btn-accent btn-block mt-5">
          {busy && busy !== 'google' ? <Loader2 size={18} className="animate-spin" /> : null}
          <span>{mode === 'create' ? 'Create my account' : mode === 'reset' ? 'Send a reset link' : 'Sign in'}</span>
        </button>
      </form>

      <div className="mt-4 flex flex-col items-start">
        {mode !== 'sign_in' && (
          <button type="button" onClick={() => { setMode('sign_in'); setError(null); setNotice(null); }} className="link text-sm text-left">
            I already have a password
          </button>
        )}
        {mode !== 'reset' && (
          <button type="button" onClick={() => { setMode('reset'); setError(null); setNotice(null); }} className="link text-sm text-left">
            Forgot your password?
          </button>
        )}
        {mode !== 'create' && (
          <button type="button" onClick={() => { setMode('create'); setError(null); setNotice(null); }} className="link text-sm text-left">
            New here? Create an account
          </button>
        )}
      </div>
    </>
  );
};
