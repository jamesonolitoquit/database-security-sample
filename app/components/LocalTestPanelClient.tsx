"use client";
import dynamic from "next/dynamic";
const LocalTestPanel = dynamic(() => import("./LocalTestPanel").then(mod => mod.LocalTestPanel), { ssr: false });

import { useEffect, useState } from "react";

export function LocalTestPanelClient() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLocal = window.location.hostname.match(/^(localhost|127\.|192\.168\.|10\.)/);
      setShow(!!isLocal);
    }
  }, []);
  if (!show) return null;
  return <LocalTestPanel />;
}