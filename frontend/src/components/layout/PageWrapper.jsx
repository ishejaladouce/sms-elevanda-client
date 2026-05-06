import Navbar from "./Navbar.jsx";

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

