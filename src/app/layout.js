import "./globals.css";

export const metadata = {
  title: "PictoCreds Admin Dashboard",
  description: "PictoCreds admin workspace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
