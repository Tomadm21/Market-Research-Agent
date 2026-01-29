import "./globals.css";

export const metadata = {
  title: "Market Analyst AI",
  description: "AI-powered market intelligence with real-time research",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
