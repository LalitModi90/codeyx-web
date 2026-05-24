import TopNavbar from '../components/shared/TopNavbar';
import Hero from '../components/Hero';
import Features from '../components/Features';
import Projects from '../components/Projects';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import CompanySheets from '../components/CompanySheets';
import Workspace from '../components/Workspace';
import FAQ from '../components/FAQ';
import Footer from '../components/Footer';

export default function Home() {
  return (
    <main className="min-h-screen">
      <TopNavbar />
      <Hero />
      <AnalyticsDashboard />
      <Projects />
      <CompanySheets />
      <Workspace />
      <Features />
      <FAQ />
      <Footer />
    </main>
  );
}
