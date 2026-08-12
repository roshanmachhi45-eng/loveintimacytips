
import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const Disclaimer = lazy(() => import('./pages/Disclaimer'));
const Terms = lazy(() => import('./pages/Terms'));
const BlogDetail = lazy(() => import('./pages/BlogDetail'));
const BlogAdmin = lazy(() => import('./pages/BlogAdmin'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="
          h-8 w-8 rounded-full
          border-2 border-rose-200
          border-t-rose-500
          animate-spin
        "
      />
    </div>
  );
}

export default function App() {
  return (
    <div className="min-h-screen pb-10">
      <Navbar />

      <main className="pt-20 px-4">
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* HOME */}
            <Route path="/" element={<Home />} />

            {/* EXISTING PAGES */}
            <Route path="/about" element={<About />} />

            <Route path="/contact" element={<Contact />} />

            <Route
              path="/privacy-policy"
              element={<PrivacyPolicy />}
            />

            <Route
              path="/disclaimer"
              element={<Disclaimer />}
            />

            {/* TERMS & CONDITIONS */}
            <Route
              path="/terms"
              element={<Terms />}
            />

            {/* BLOG ARTICLE */}
            <Route
              path="/blog/:slug"
              element={<BlogDetail />}
            />

            {/* ADMIN */}
            <Route
              path="/admin/blog"
              element={<BlogAdmin />}
            />

            {/* SAFETY FALLBACK */}
            <Route
              path="*"
              element={<Navigate to="/" replace />}
            />

          </Routes>
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

            
