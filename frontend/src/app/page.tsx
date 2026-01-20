import { WalletConnect } from '@/components/WalletConnect';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-4xl font-bold">5BLOCK</h1>
          <p className="text-xl">Pokemon Trading Card DApp</p>
          <div className="mt-8">
            <WalletConnect />
          </div>
        </div>
      </div>
    </main>
  );
}
