import { useEffect, useState } from "react";

export type Route = "landing" | "join" | "lobby" | "meeting" | "summary";

const ROUTES: Route[] = ["landing", "join", "lobby", "meeting", "summary"];

const TITLES: Record<Route, string> = {
  landing: "Cenivo live demo",
  join: "Get ready | Cenivo demo",
  lobby: "Waiting room | Cenivo demo",
  meeting: "Product launch sync | Cenivo demo",
  summary: "Meeting ended | Cenivo demo",
};

function readRoute(): Route {
  const value = window.location.hash.replace(/^#\/?/, "") as Route;
  return ROUTES.includes(value) ? value : "landing";
}

export function navigate(route: Route) {
  window.location.hash = route === "landing" ? "/" : `/${route}`;
}

/** Hash routing, so the demo works from any static host path (GitHub Pages). */
export function useRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  useEffect(() => {
    document.title = TITLES[route];
    window.scrollTo(0, 0);
  }, [route]);

  return route;
}
