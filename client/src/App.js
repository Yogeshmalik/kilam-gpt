// src/App.js
import React, { useState } from "react";
import { useUser, SignedIn, SignedOut, SignIn } from "@clerk/clerk-react";
import Header from "./components/Header";
import ScrollToTop from "./components/scrollToTopBottom";
import ChatMessages from "./components/ChatMessages";
import ChatInput from "./components/ChatInput";
import ErrorMessage from "./components/ErrorMessage";
import useChat from "./hooks/useChat";

function App() {
  const { user } = useUser();
  const userEmail = user?.primaryEmailAddress?.emailAddress || null;
  const { messages, error, sendTextQuery, setError } = useChat(userEmail);
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen justify-between max-w-[100vw] bg-gray-900 flex flex-col">
      <SignedOut>
        <SignIn />
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
    </div>
  );
}

export default App;
