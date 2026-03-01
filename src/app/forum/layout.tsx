import { ForumAuthProvider } from "@/components/ForumAuth";

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return <ForumAuthProvider>{children}</ForumAuthProvider>;
}
