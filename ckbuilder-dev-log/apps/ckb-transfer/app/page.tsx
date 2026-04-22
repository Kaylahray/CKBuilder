import { Navbar } from "../components/navbar";
import { TransferCard } from "../components/transfer-card";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <Navbar />
      <TransferCard />
      
    </main>
  );
}