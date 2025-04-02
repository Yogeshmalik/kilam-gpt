// src/App.js
import React, { useState } from "react";
import { useUser, SignIn } from "@clerk/clerk-react";
import Header from "./components/Header";
import ScrollToTop from "./components/scrollToTopBottom";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import ErrorMessage from "./components/ErrorMessage";
import useChat from "./hooks/useChat";
import WelcomeModal from "./components/WelcomeModal";

function App() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || null;
  const { messages, error, sendTextQuery, setError, handleLogout } =
    useChat(userEmail);
  const [query, setQuery] = useState("");
  const [showWelcome, setShowWelcome] = useState(!user);

  // const showSignInModal = !user && error?.includes("You have reached your free query limit. Please sign in");
  // const showLimitModal = user && error?.includes("You have exhausted your free queries");

  const showSignInModal =
    !user &&
    error ===
      "⚠️ You have reached your free query limit. Please sign in to continue.";
  const showLimitModal =
    user && error === "🚨 You have exhausted your free queries.";

  return (
    <>
      {/* <div className="min-h-screen justify-between max-w-[100vw] bg-gray-900 flex flex-col">
        <SignedOut>
          <div className="flex items-center m-auto">
            <SignIn />
          </div>
        </SignedOut>
        <SignedIn>
          <Header />
          <ErrorMessage error={error} />
          <ChatMessages messages={messages} />
          <ScrollToTop />
          <ChatInput
            query={query}
            setQuery={setQuery}
            sendTextQuery={sendTextQuery}
            setError={setError}
          />
        </SignedIn>
      </div> */}
      <div
        className={`relative min-h-screen justify-between flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-black ${
          showSignInModal || showLimitModal ? "overflow-hidde" : ""
        }`}
      >
        <Header
          disableSignIn={showSignInModal || showLimitModal || showWelcome}
        />
        <ErrorMessage error={error} />
        {/* ✅ Blur everything if sign-in modal is active */}
        <div
          className={`${
            showSignInModal || showLimitModal
              ? "blur-md pointer-events-none"
              : ""
          }`}
        >
          <ChatMessages messages={messages} />
          <ScrollToTop />
          <ChatInput
            query={query}
            setQuery={setQuery}
            sendTextQuery={sendTextQuery}
            setError={setError}
          />
        </div>

        {/* ✅ Welcome Modal */}
        {showWelcome && !user &&  (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-40 ">
            <WelcomeModal onClose={() => setShowWelcome(false)} />
          </div>
        )}

        {/* ✅ Show a message when free queries are exhausted */}
        {showSignInModal && (
          <div className="fixed inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 z-40">
            <SignIn appearance={{ baseTheme: "dark" }} />
          </div>
        )}

        {/* ✅ Show "Limit Exhausted" modal when all queries are used */}
        {showLimitModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 p-6 rounded-md text-center shadow-md">
              <h2 className="text-white text-lg mb-4">
                🚨 You have exhausted your free queries.
              </h2>
              {/* <SignInButton mode="modal">
                <button className="bg-gradient-to-r from-blue-600 to-blue-400 text-transparent bg-clip-text">
                  Sign In
                </button>
              </SignInButton> */}
              <div className="flex gap-2 justify-between">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                >
                  Signout
                </button>
                <button
                  disabled
                  onClick={""}
                  className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded cursor-not-allowed"
                >
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
