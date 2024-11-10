import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-400/60 text-white">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-bold mb-4">Welcome to ShelfWise!</h1>
        <p className="text-lg">
          Track your groceries, plan meals, and save money — effortlessly.
        </p>
      </header>

      <main className="w-full max-w-md bg-white text-gray-900 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">🚀 Join Us Today!</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Sign up and start cooking smarter.
        </p>

        <div className="flex justify-center">
          {/* Link to the Sign In/Sign Up Page */}
          <Link
            href="/dashboard"
            className="w-full text-center bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition focus:outline-none focus:ring-2 focus:ring-yellow-300"
          >
            Sign Up Now
          </Link>
        </div>
      </main>

      <footer className="mt-8 text-center">
        <p className="text-sm">
          Already have an account?{" "}
          <Link
            href="/dashboard"
            className="text-black hover:underline hover:text-black"
          >
            Sign In
          </Link>
        </p>
      </footer>
    </div>
  );
}
