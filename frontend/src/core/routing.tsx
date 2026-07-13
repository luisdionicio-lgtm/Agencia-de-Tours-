"use client";

/* oxlint-disable react/only-export-components */

import React, { createContext, isValidElement, useContext, useEffect, useMemo, useState } from "react";

type Navigate = (to: string) => void;
type RouterState = {
  pathname: string;
  search: string;
  navigate: Navigate;
};

type RouteProps = {
  path: string;
  element: React.ReactNode;
};

const RouterContext = createContext<RouterState | null>(null);
const ParamsContext = createContext<Record<string, string>>({});

function currentLocation() {
  if (typeof window === "undefined") return { pathname: "/", search: "" };
  return { pathname: window.location.pathname || "/", search: window.location.search || "" };
}

function normalizePath(path: string) {
  return path.length > 1 ? path.replace(/\/$/, "") : path;
}

function matchRoute(pattern: string, pathname: string) {
  const patternParts = normalizePath(pattern).split("/").filter(Boolean);
  const pathParts = normalizePath(pathname).split("/").filter(Boolean);
  const params: Record<string, string> = {};

  if (patternParts.length !== pathParts.length) return null;
  if (patternParts.length === 0 && pathParts.length === 0) return params;

  for (let index = 0; index < patternParts.length; index += 1) {
    const patternPart = patternParts[index];
    const pathPart = pathParts[index];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
      continue;
    }

    if (patternPart !== pathPart) return null;
  }

  return params;
}

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useState(currentLocation);

  useEffect(() => {
    const sync = () => setLocation(currentLocation());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const navigate = (to: string) => {
    const url = new URL(to, window.location.origin);
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setLocation({ pathname: url.pathname, search: url.search });

    if (url.hash) {
      window.requestAnimationFrame(() => document.querySelector(url.hash)?.scrollIntoView({ behavior: "smooth" }));
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const value = useMemo(() => ({ ...location, navigate }), [location]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

function useRouter() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("RouterProvider is required");
  return context;
}

export function Link({
  to,
  className,
  children,
  onClick,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & { to: string }) {
  const { navigate } = useRouter();

  return (
    <a
      {...props}
      href={to}
      className={className}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target) return;
        event.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}

export function NavLink(props: React.ComponentProps<typeof Link>) {
  return <Link {...props} />;
}

export function useNavigate() {
  return useRouter().navigate;
}

export function useSearchParams(): [URLSearchParams, (next: Record<string, string> | URLSearchParams) => void] {
  const { pathname, search, navigate } = useRouter();
  const params = useMemo(() => new URLSearchParams(search), [search]);

  const setParams = (next: Record<string, string> | URLSearchParams) => {
    const nextParams = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    const query = nextParams.toString();
    navigate(query ? `${pathname}?${query}` : pathname);
  };

  return [params, setParams];
}

export function useParams() {
  return useContext(ParamsContext);
}

export function Route(_props: RouteProps) {
  return null;
}

export function Routes({ children }: { children: React.ReactNode }) {
  const { pathname } = useRouter();
  const routes = React.Children.toArray(children);

  for (const child of routes) {
    if (!isValidElement<RouteProps>(child)) continue;
    const params = matchRoute(child.props.path, pathname);
    if (!params) continue;
    return <ParamsContext.Provider value={params}>{child.props.element}</ParamsContext.Provider>;
  }

  return null;
}
