import { useEffect, useState } from "react";

export default function ScrollToTopBottom() {
  const [showButton, setShowButton] = useState(false);
  const [scrollToBottom, setScrollToBottom] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const fullHeight = document.documentElement.scrollHeight;
      const nearBottom = scrollY + windowHeight >= fullHeight - 100;

      setShowButton(scrollY > 50); // Show button after scrolling down
      setScrollToBottom(!nearBottom); // If near bottom, switch to scroll up mode
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleClick = () => {
    window.scrollTo({
      top: scrollToBottom ? document.documentElement.scrollHeight : 0,
      behavior: "smooth",
    });
  };

  return (
    showButton && (
      <button
        onClick={handleClick}
        className="fixed left-1/2 -translate-x-1/2 bottom-24 z-50 flex h-12 w-12 items-center justify-center rounded-ful bg-gray-60 text-white text-xl shadow-lg hover:bg-gray-70 transition-all duration-300 cursor-pointer"
        title={scrollToBottom ? "Scroll to Bottom" : "Scroll to Top"}
      >
        {scrollToBottom ? "▼" : "▲"}
      </button>
    )
  );
}
