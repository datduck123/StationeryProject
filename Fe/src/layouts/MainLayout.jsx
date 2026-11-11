import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import AuthModal from "../components/auth/AuthModal";
import BackToTop from "../components/shared/BackToTop";
import Footer from "../components/shared/Footer";
import Header from "../components/shared/Header";
import MobileMenu from "../components/shared/MobileMenu";
import Preloader from "../components/shared/Preloader";
import QuickViewModal from "../components/shared/QuickViewModal";
import ErrorBoundary from "../components/shared/ErrorBoundary";
import SidebarCart from "../components/shared/SidebarCart";
import SidebarWishlist from "../components/shared/SidebarWishlist";

export const MainLayout = () => {
  useEffect(() => {
    if (typeof window !== "undefined" && window.WOW) {
      try {
        new window.WOW({ live: false }).init();
      } catch (e) {}
    }
  }, []);

  return (
    <>
      <Preloader />
      <div id="scroll-container" className="main-wrapper">
        <Header />
        <main className="main-wrapper">
          <Outlet />
          <Footer />
        </main>
      </div>
      <BackToTop />
      <MobileMenu />
      <SidebarCart />
      <SidebarWishlist />
      <ErrorBoundary>
        <QuickViewModal />
      </ErrorBoundary>
      <AuthModal />
    </>
  );
};

export default MainLayout;
