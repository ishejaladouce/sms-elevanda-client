import Navbar from "./Navbar.jsx";

export default function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <main className="px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
