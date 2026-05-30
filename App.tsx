import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { Loader2 } from 'lucide-react';

// Lazy load pages for performance
const HomePage = lazy(() => import('./pages/HomePage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const WaitlistPage = lazy(() => import('./pages/WaitlistPage'));
const VerificationPage = lazy(() => import('./pages/VerificationPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));

const PageLoader = () => (



  <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
    <Loader2 className="animate-spin text-gold" size={48} />
    <p className="text-gold font-serif text-xl tracking-widest uppercase animate-pulse">Entering the Archives...</p>
  </div>
);

console.log('Loading page...');


const ScrollToHash: React.FC = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [hash, pathname]);

  return null;
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <ScrollToHash />
      <Header />
      <main className="flex-grow">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/waitlist" element={<WaitlistPage />} />
            <Route path="/verify" element={<VerificationPage />} />
            <Route path="/certificate" element={<CertificatePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default App;