import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
function Layout() {

  return (
    <div className="flex min-h-svh flex-col transition-all duration-300 bg-gradient-to-br from-white via-[#f8fdf8] to-[#edf6e4]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout;
