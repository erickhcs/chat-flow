import { useEffect, useState } from "react";

const useIsMobile = () => {
  const query = "(max-width: 768px)";
  const [matches, setMatches] = useState(window.matchMedia(query).matches);

  useEffect(() => {
    const media = window.matchMedia(query);

    const listener = () => setMatches(media.matches);

    media.addEventListener("change", listener);
    return () => media.removeEventListener("change", listener);
  }, []);

  return matches;
};

export default useIsMobile;
