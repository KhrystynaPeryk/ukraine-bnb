import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Navbar from "./components/navbar/Navbar";
import RegisterModal from "./components/modals/RegisterModal";
import ToasterProvider from "./providers/ToasterProvider";
import LoginModal from "./components/modals/LoginModal";
import RentModal from "./components/modals/RentModal";
import SearchModal from "./components/modals/SearchModal";
import { AuthProvider } from "./contexts/AuthContext";
import ForgotEmailModal from "./components/modals/ForgotEmailModal";

const font = Nunito({
  subsets: ["latin"],
});


export const metadata: Metadata = {
  title: "Ukraine BnB",
  description: "Book your dream stay ",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en">
      <body className={font.className}>
        <AuthProvider>
          <ToasterProvider />
          <SearchModal />
          <RentModal />
          <RegisterModal />
          <LoginModal />
          <ForgotEmailModal />
          <Navbar/>
          <div className="pb-20 pt-28">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
