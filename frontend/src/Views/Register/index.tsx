// src/routes/Login.tsx
import { EyeClosedIcon, EyeIcon } from "lucide-react";
import logo from "@/logo.svg?inline";
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import Input from "@/components/Input";

export default function Register() {
  const [showPwd, setShowPwd] = useState(false);

  return (
    <div className="min-h-[calc(100dvh-121px-65px)] md:min-h-[calc(100dvh-65px-65px)] w-full flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 md:p-12 bg-white dark:bg-surface-dark/50 rounded-3xl shadow-lg dark:shadow-[#1F2937]">
        {/* Logo / Icon */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="mb-4 flex items-center justify-center rounded-full">
            <Link
              to="/"
              className="fill-current text-xl font-semibold flex items-center gap-3 text-text-primary-light dark:text-text-primary-dark"
            >
              <img src={logo} alt="SyncNotes" className="h-10 w-10 fill-current" />
              <span className="text-xl font-bold">SyncNotes</span>
            </Link>
          </div>
          <h1 className="text-[32px] font-bold leading-tight tracking-tight text-text-primary dark:text-text-inverse">
            Create an Account
          </h1>
          <h2 className="text-base text-text-secondary dark:text-gray-300"> Join SyncNotes to start collaborating</h2>
        </div>

        {/* Form */}
        <form
          className="mt-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault(); /* handle login */
          }}
        >
          {/* name */}
          <Input label="Name" name="name" type="text" autoComplete="name" required placeholder="Enter your name" />
          {/* Email */}
          <Input label="Email" name="email" type="email" autoComplete="email" required placeholder="Enter your email" />
          {/* Password*/}
          <Input
            label="Password"
            name="password"
            type={showPwd ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            endContent={
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="p-2 cursor-pointer flex items-center text-text-default dark:text-gray-400"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? (
                  /* visibility icon */
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeClosedIcon className="h-5 w-5" />
                )}
              </button>
            }
          />
          {/* Confirm Password*/}
          <Input
            label="Confirm Password"
            name="confirm-password"
            type={showPwd ? "text" : "password"}
            autoComplete="new-password"
            required
            placeholder="Confirm your password"
            endContent={
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="p-2 cursor-pointer flex items-center text-text-default dark:text-gray-400"
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? (
                  /* visibility icon */
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeClosedIcon className="h-5 w-5" />
                )}
              </button>
            }
          />
          

          {/* Actions */}
          <div className="pt-2 space-y-4">
            <button
              type="submit"
              className="cursor-pointer w-full inline-flex items-center justify-center font-bold px-6 p-3 rounded-2xl btn-primary"
            >
              <span className="truncate">Register</span>
            </button>

            <button
              type="button"
              className="cursor-pointer w-full inline-flex items-center justify-center font-bold px-6 p-3 rounded-2xl btn-ghost"
            >
              <svg className="h-6 w-6 mr-3" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M22.56 12.25C22.56 11.45 22.49 10.68 22.36 9.92H12V14.4H18.06C17.74 16.08 16.89 17.47 15.58 18.39V21.01H19.47C21.45 19.16 22.56 16.03 22.56 12.25Z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23C14.97 23 17.45 22.02 19.47 20.51L15.58 17.89C14.59 18.52 13.38 18.9 12 18.9C9.27 18.9 6.94 17.08 6.08 14.61H2.09V17.32C4.07 20.68 7.72 23 12 23Z"
                  fill="#34A853"
                />
                <path
                  d="M6.08 14.61C5.83 13.88 5.68 13.08 5.68 12.25C5.68 11.42 5.83 10.62 6.08 9.89V7.18H2.09C1.22 8.87 0.75 10.74 0.75 12.75C0.75 14.76 1.22 16.63 2.09 18.32L6.08 14.61Z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.6C13.59 5.6 14.93 6.13 15.99 7.12L19.54 3.57C17.45 1.69 14.97 0.5 12 0.5C7.72 0.5 4.07 2.82 2.09 6.18L6.08 8.89C6.94 6.42 9.27 4.6 12 4.6V5.6Z"
                  fill="#EA4335"
                />
              </svg>
              <span className="truncate">Continue with Google</span>
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-base text-text-secondary dark:text-gray-300">
            Already have an account?{"  "}
            <Link
              to="/register"
              className="font-bold hover:underline text-surface-primary/90 dark:text-surface-primary"
            >
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
