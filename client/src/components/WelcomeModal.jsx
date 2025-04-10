import { SignInButton } from "@clerk/clerk-react";

const WelcomeModal = ({ onClose }) => {
  return (
    <div className="relative bg-gray-900 container ring-1 ring-white/10 rounded-3xl">
      <div className="relative h-72 overflow-hidden bg-indigo-600 md:absolute md:left-0 md:h-full md:w-1/3 lg:w-1/2 rounded-t-3xl sm:rounded-s-3xl">
        <img
          alt=""
          src="https://images.unsplash.com/photo-1525130413817-d45c1d127c42?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1920&q=60&blend=6366F1&sat=-100&blend-mode=multiply"
          className="size-full object-cover"
        />
        <svg
          viewBox="0 0 926 676"
          aria-hidden="true"
          className="absolute -bottom-24 left-24 w-[57.875rem] transform-gpu blur-[118px]"
        >
          <path
            d="m254.325 516.708-90.89 158.331L0 436.427l254.325 80.281 163.691-285.15c1.048 131.759 36.144 345.144 168.149 144.613C751.171 125.508 707.17-93.823 826.603 41.15c95.546 107.978 104.766 294.048 97.432 373.585L685.481 297.694l16.974 360.474-448.13-141.46Z"
            fill="url(#60c3c621-93e0-4a09-a0e6-4c228a0116d8)"
            fillOpacity=".4"
          />
          <defs>
            <linearGradient
              id="60c3c621-93e0-4a09-a0e6-4c228a0116d8"
              x1="926.392"
              x2="-109.635"
              y1=".176"
              y2="321.024"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#776FFF" />
              <stop offset={1} stopColor="#FF4694" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      <div className="relative mx-auto max-w-7xl py-4 sm:py-32 lg:px-8 lg:py-40">
        <div className="pl-6 pr-6 md:ml-auto md:w-2/3 md:pl-16 lg:w-1/2 lg:pl-24 lg:pr-0 xl:pl-32 items-center sm:items-start flex flex-col text-center sm:text-start">
          <h2 className="text-base/7 font-semibold text-indigo-400">
            Welcome to Kilam GPT
          </h2>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            We’re here to help
          </p>
          <p className="mt-6 text-base/7 text-gray-300">
            Your AI-powered chat assistant is here! Start asking questions and
            explore the power of AI.
          </p>
          <div className="mt-8 flex flex-col items-center sm:items-start space-y-4 sm:space-y-8">
            <button
              onClick={onClose}
              className="inline-flex rounded-md bg-gradient-to-r from-green-400 via-violet-300 to-teal-300 hover:from-purple-400 hover:via-teal-300 hover:to-violet-300 text-transparent bg-clip-text px-3.5 py-2.5 text-sm font-bold border border-lime-700 shadow-sm"
            >
              Try it out !
            </button>
            <div className="flex flex-col gap-4 items-center sm:items-start">
              <p className="text-gray-300 text-sm">Already have an account?</p>
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-purple-400 via-teal-300 to-violet-300 text-transparent bg-clip-text inline-flex rounded-md px-3.5 py-1.5 w-fit border border-lime-700 font-bold hover:from-lime-300 hover:via-purple-400 hover:to-lime-300">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default WelcomeModal;
