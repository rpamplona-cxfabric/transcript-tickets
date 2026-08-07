import { redirect } from 'next/navigation';
import { ArrowRight, Headphones, ShieldCheck } from 'lucide-react';
import { auth0 } from '@/lib/auth/auth0';

const getSafeReturnTo = (requested: string | undefined) => {
  if (!requested?.startsWith('/') || requested.startsWith('//')) {
    return '/';
  }

  return requested;
};

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo: requestedReturnTo } = await searchParams;
  const returnTo = getSafeReturnTo(requestedReturnTo);
  const session = await auth0.getSession();

  if (session) {
    redirect(returnTo);
  }

  const loginUrl = `/auth/login?returnTo=${encodeURIComponent(returnTo)}`;

  return (
    <main className="relative flex min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(63,63,70,0.5),transparent_42%)]" />
      <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/5" />
      <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5" />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-12 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <section className="max-w-xl">
          <div className="mb-8 inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-zinc-950 shadow-lg shadow-black/30">
              <Headphones className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold tracking-[0.18em] text-zinc-300">
              CXF WORKSPACE | SUPPORT AND TRANSCRIPTS
            </span>
          </div>

          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Support intelligence,
            <span className="block text-zinc-400">ready when you are.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-zinc-400">
            Review call transcriptions, track customer issues, and keep your support workflow moving
            from one secure workspace.
          </p>

          <div className="mt-8 flex items-center gap-3 text-sm text-zinc-400">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
            Secured with Auth0
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-9">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
            Welcome back
          </p>
          <h2 className="mt-3 text-2xl font-semibold">Sign in to continue</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            You’ll be redirected to your organization’s secure Auth0 sign-in page.
          </p>

          <a
            href={loginUrl}
            className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Continue with Auth0
            <ArrowRight className="h-4 w-4" />
          </a>

          <p className="mt-5 text-center text-xs leading-5 text-zinc-500">
            Access is limited to authorized CXF workspace users.
          </p>
        </section>
      </div>
    </main>
  );
}
