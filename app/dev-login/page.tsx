import { notFound } from "next/navigation";
import DevLoginClient from "./DevLoginClient";

// notFound() must be called in a server component, so this wrapper stays server-side
export default function DevLoginPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DevLoginClient />;
}
