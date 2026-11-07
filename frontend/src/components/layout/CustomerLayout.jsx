import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";

const CustomerLayout = () => (
  <div className="flex min-h-screen flex-col bg-background">
    <Navbar />
    <main className="flex-1">
      <div className="mx-auto w-full max-w-7xl px-6 py-8">
        <Outlet />
      </div>
    </main>
    <Footer />
  </div>
);

export default CustomerLayout;
