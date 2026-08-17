import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout() {
  return (
    <div className="flex min-h-svh flex-col transition-all duration-300 bg-gradient-to-br from-[#e4f3e7] via-[#d6ebd9] to-[#c5e6cb] text-slate-800">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
