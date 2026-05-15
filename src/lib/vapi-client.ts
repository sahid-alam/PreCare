"use client";

import Vapi from "@vapi-ai/web";

let _vapi: Vapi | null = null;

export function getVapiClient(): Vapi {
  if (!_vapi) {
    const key = process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY ?? "";
    _vapi = new Vapi(key);
  }
  return _vapi;
}
