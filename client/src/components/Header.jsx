import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/clerk-react";
import AgentPulse from "./AgentPulse";

const Header = () => {
  return (
    <header className="bg-opacity-90 sticky top-0 z-50 px-4 md:px- bg-gray-800 backdrop-blur-sm border-b border-gray-900 shadow-lg">
      <div className="container mx-auto">
        <div className="flex justify-between items-center h-12 sm:h-16">
          {/* Left */}
          <div className="flex items-center justify-between h-16">
            <AgentPulse size="medium" color="blue" />
          </div>
          <a
            href="https://yogeshmalikportfolio.netlify.app/"
            className="flex items-center gap-4"
          >
            <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-300 via-blue-400 to-blue-100 bg-clip-text text-transparent">
              Kilam AI Agent
            </h1>
          </a>
          {/* Right */}
          <div className="flex items-center gap-4">
            <SignedIn>
              {/* <div className="p-2 w-12 h-12 sm:w-auto sm:h-auto  flex items-center justify-center rounded-full"> */}
                <UserButton />
              {/* </div> */}
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
