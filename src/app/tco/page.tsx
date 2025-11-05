export const runtime = "nodejs";
export const revalidate = 0;
import TcoForm from "./TcoForm";
export default async function Page() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">TCO-kalkulator</h1>
      <TcoForm />
    </main>
  );
}
