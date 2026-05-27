import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <div className={`flex min-h-svh flex-col transition-all duration-300 ${
      !isAuthenticated 
        ? "bg-gradient-to-br from-white via-[#f8fdf8] to-[#edf6e4]" 
        : "bg-white"
    }`}>
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
