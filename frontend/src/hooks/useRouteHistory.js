import { useEffect, useRef } from "react";
import { useLocation, useNavigationType, useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";

export const useRouteHistory = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const nav = useNavigate();
  const user = useUser();
  const routeHistory = useRef([]);
  const customHistory = useRef({
    entries: [],
    index: -1,
  });

  useEffect(() => {
    if (customHistory.current.index === -1) {
      customHistory.current.entries.push(location.pathname);
      customHistory.current.index = 0;
    } else {
      switch (navType) {
        case "PUSH":
          customHistory.current.entries = customHistory.current.entries.slice(
            0,
            customHistory.current.index + 1
          );
          customHistory.current.entries.push(location.pathname);
          customHistory.current.index++;
          break;
        case "REPLACE":
          customHistory.current.entries[customHistory.current.index] =
            location.pathname;
          break;
        case "POP": {
          const idx = customHistory.current.entries.indexOf(location.pathname);
          if (idx !== -1) {
            customHistory.current.index = idx;
          } else {
            customHistory.current.entries.push(location.pathname);
            customHistory.current.index =
              customHistory.current.entries.length - 1;
          }
          break;
        }
        default:
          break;
      }
    }

    if (user) {
      if (
        navType === "POP" &&
        ["/login", "/signup"].includes(location.pathname)
      ) {
        let i = customHistory.current.index;
        while (
          i > 0 &&
          ["/login", "/signup"].includes(customHistory.current.entries[i])
        ) {
          i--;
        }
        if (i >= 0) {
          const target = customHistory.current.entries[i];
          customHistory.current.index = i;
          nav(target, { replace: true });
          return;
        }
      }
    }

    const publicPaths = ["/login", "/signup"];
    if (!publicPaths.includes(location.pathname)) {
      sessionStorage.setItem("lastPublicPath", location.pathname);
    }

    routeHistory.current.push(location.pathname);
  }, [location, navType, nav, user]);
};
