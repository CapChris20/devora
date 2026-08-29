"use client";

import dynamic from "next/dynamic";

const SplashCursor = dynamic(() => import("./SplashCursor.jsx"), { ssr: false });

export default SplashCursor;
