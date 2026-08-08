import { Header } from "@/components/public/header";
import { Footer } from "@/components/public/footer";
import { WhatsAppFloatButton } from "@/components/public/whatsapp-float-button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFloatButton />
    </>
  );
}
