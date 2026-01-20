export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between">
        <div className="flex flex-col items-center gap-8">
          <h1 className="text-3xl font-bold text-center text-gray-900">
            Welcome to the Pokemon Trading Card DApp
          </h1>
          <p className="text-center text-gray-700 text-lg max-w-2xl">
            Connect your wallet and ensure you&apos;re on the correct network to get started.
          </p>
        </div>
      </div>
    </div>
  );
}
