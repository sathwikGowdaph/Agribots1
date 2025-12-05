import React from 'react';
import { Scan, Users, Zap } from 'lucide-react';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import farmerHeroBg from '@/assets/farmer-hero-bg.jpg';

interface HeroSectionProps {
  translations: any;
  onStartDetection: () => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ translations, onStartDetection }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${farmerHeroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-white leading-tight">
              {translations.hero.title}
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 max-w-2xl mx-auto leading-relaxed">
              {translations.hero.subtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-12">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4 text-center">
              <Scan className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">
                {translations.hero.features.aiDetection}
              </h3>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4 text-center">
              <Zap className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">
                {translations.hero.features.instantResults}
              </h3>
            </Card>
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-4 text-center">
              <Users className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="font-semibold text-white text-sm">
                {translations.hero.features.community}
              </h3>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="space-y-6">
            <Button 
              variant="hero" 
              size="xl" 
              onClick={onStartDetection}
              className="text-xl px-12 py-6"
            >
              <Camera className="h-6 w-6 mr-3" />
              {translations.hero.cta.primary}
            </Button>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success rounded-full" />
                <span>{translations.hero.stats.accuracy}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>{translations.hero.stats.diseases}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary-light rounded-full" />
                <span>{translations.hero.stats.farmers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;