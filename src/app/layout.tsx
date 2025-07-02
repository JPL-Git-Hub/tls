import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The Law Shop",
  description: "Professional legal services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}