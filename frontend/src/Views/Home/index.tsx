import { Link } from "@tanstack/react-router";

export default function Home() {
  return (
    <div className="min-h-[calc(100dvh-121px-65px)] md:min-h-[calc(100dvh-65px-65px)] container mx-auto flex items-stretch justify-center">
      <div className="w-full grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:gap-8 lg:text-left">
          <div className="flex flex-col gap-4">
            <h1 className="text-4xl font-black leading-tight tracking-tight text-text-primary dark:text-text-inverse sm:text-5xl md:text-6xl">
              Your ideas, synced everywhere.
            </h1>
            <p className="text-base text-text-secondary dark:text-gray-300 sm:text-lg text-center lg:text-left">
              Collaborate in real-time with secure sessions and versioned notes.
            </p>
          </div>

          <div className="flex  flex-wrap justify-center gap-4 lg:justify-start">
            <Link to="/register" className="inline-flex items-center justify-center font-bold px-6 p-3 rounded-2xl btn-primary focus-visible:outline-surface-primary">
              <span className="truncate">Get Started</span>
            </Link>
   
            <Link
              to="/login"
              className="inline-flex items-center justify-center font-bold px-6 py-3 rounded-2xl btn-ghost focus-visible:outline-[--color-surface-primary]"
            >
              <span className="truncate">Login</span>
            </Link>
          </div>
        </div>

        {/* Right: Illustration */}
        <div className="hidden lg:block">
          <img
            className="aspect-video w-full rounded-3xl object-cover"
            alt="A developer's workspace with a laptop showing code, surrounded by plants and a cup of coffee."
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCyt9YEltIyQjRwaMF9HmY3rfpZ0zG1-vSJoBdGHiC2nwPR6fT5LeenGCm2qv9yzKxnNNMRvHIwXBHsk6iSX5lT6Qq2jteVudRZztE56wE0tohktuEtB8YGkrVVC9MCpvmceX42g-6oQottELMH8F17YbHnbJUgyQQGycdxRud0nTuJmuIixDKqhaf9-rXdG4bIZKrG-an0XHmcu90nEr-diWAlEKEbcisVsP8rSqIXNRK3IOpPmkBjO2Vz0ifaHAlMsQiLyX7Dcusb"
          />
        </div>
      </div>
    </div>
  );
}
