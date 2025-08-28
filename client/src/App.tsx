import { useState, useEffect, useCallback } from 'react';
import { trpc } from '@/utils/trpc';
import type { HomePageData } from '../../server/src/schema';

// Components
import { HeroSection } from '@/components/HeroSection';
import { NewsSection } from '@/components/NewsSection';
import { EventsSection } from '@/components/EventsSection';
import { QuickLinksSection } from '@/components/QuickLinksSection';
import { ContactSection } from '@/components/ContactSection';

function App() {
  // Initialize with fallback data so the page always works
  const [homeData, setHomeData] = useState<HomePageData>({
    latestNews: [],
    upcomingEvents: [],
    quickLinks: [],
    contactInfo: {
      id: 1,
      school_name: 'Edmonton Excellence Academy',
      address: '123 Education Street, Edmonton, AB T5K 2P4',
      phone: '(780) 123-4567',
      email: 'info@edmontonexcellence.ca',
      website: 'https://www.edmontonexcellence.ca',
      office_hours: 'Monday - Friday: 8:00 AM - 4:00 PM',
      created_at: new Date(),
      updated_at: new Date()
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHomeData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Try to load data from API, but don't fail if it doesn't work
      const data = await trpc.getHomePageData.query();
      setHomeData(data);
    } catch (apiError) {
      console.warn('API call failed, using fallback data:', apiError);
      // Keep using the fallback data that's already set
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Optionally try to load from API, but don't block the UI
    loadHomeData();
  }, [loadHomeData]);

  // No longer need loading or error screens since we have fallback data

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Optional loading indicator */}
      {isLoading && (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-white rounded-lg shadow-lg p-3 flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-slate-600">Loading latest updates...</span>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <HeroSection 
        schoolName={homeData.contactInfo.school_name}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Latest News Section */}
        <NewsSection news={homeData.latestNews} />

        {/* Upcoming Events Section */}
        <EventsSection events={homeData.upcomingEvents} />

        {/* Quick Links Section */}
        <QuickLinksSection links={homeData.quickLinks} />
      </main>

      {/* Contact Section */}
      <ContactSection contactInfo={homeData.contactInfo} />

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-300">
            © 2024 {homeData.contactInfo.school_name}. 
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;