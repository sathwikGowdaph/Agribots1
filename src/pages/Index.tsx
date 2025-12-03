import React, { useState } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import DetectionSection from '@/components/DetectionSection';
import AgribotChat from '@/components/AgribotChat';
import CommunitySection from '@/components/CommunitySection';
import FeaturesSection from '@/components/FeaturesSection';
import MobileNavBar from '@/components/MobileNavBar';
import { translations } from '@/translations';

const Index = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
  };

  const handleStartDetection = () => {
    const detectSection = document.getElementById('detect');
    if (detectSection) {
      detectSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentTranslations = translations[currentLanguage as keyof typeof translations] || translations.en;

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        translations={currentTranslations}
      />
      
      <main className="pt-16">
        <HeroSection
          translations={currentTranslations}
          onStartDetection={handleStartDetection}
        />
        
        <DetectionSection translations={currentTranslations} currentLanguage={currentLanguage} />
        
        <section id="chatbot" className="py-12 md:py-20 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AgribotChat currentLanguage={currentLanguage} translations={currentTranslations} />
          </div>
        </section>
        
        <CommunitySection translations={currentTranslations} />
        
        <FeaturesSection translations={currentTranslations} />
      </main>

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8 md:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl md:text-2xl font-bold font-heading mb-3">
              🌱 {currentTranslations.appName}
            </h3>
            <p className="text-primary-foreground/80 mb-4 text-sm md:text-base">
              👨‍🌾 Empowering farmers with AI-powered crop disease detection
            </p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-xs md:text-sm text-primary-foreground/70">
              <span>© 2024 AgriBot AI</span>
              <span>🌾 Made for farmers</span>
              <span>🌐 3 Languages</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileNavBar 
        currentLanguage={currentLanguage} 
        onLanguageChange={handleLanguageChange} 
      />
    </div>
  );
};

export default Index;
