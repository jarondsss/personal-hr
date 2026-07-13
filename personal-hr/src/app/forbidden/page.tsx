import { deleteSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default function ForbiddenPage() {
  async function signOut() {
    "use server";

    await deleteSession();
    redirect("/login");
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="surface stack-md" style={{ maxWidth: 420, width: "100%" }}>
        <div className="stack-sm">
          <p className="t-label-sm">403</p>
          <h1 className="t-headline-lg" style={{ fontSize: "1.75rem" }}>
            Access denied
          </h1>
          <p className="t-body-sm">
            Your account does not have admin access to Personal HR.
          </p>
        </div>
        <form action={signOut}>
          <button type="submit" className="btn btn-primary rounded-full">
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
