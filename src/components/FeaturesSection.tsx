import React from 'react';
import { Brain, Globe, Users2, Smartphone, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface FeaturesSectionProps {
  translations: any;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ translations }) => {
  const features = [
    {
      icon: Brain,
      title: translations.features.items.aiPowered.title,
      description: translations.features.items.aiPowered.description,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      icon: Globe,
      title: translations.features.items.multilingual.title,
      description: translations.features.items.multilingual.description,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      icon: Users2,
      title: translations.features.items.community.title,
      description: translations.features.items.community.description,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      icon: Smartphone,
      title: "Mobile Optimized",
      description: "Designed specifically for mobile devices with large, easy-to-use touch targets.",
      color: "text-secondary-foreground",
      bgColor: "bg-secondary/20",
    },
    {
      icon: Shield,
      title: "Data Security",  
      description: "Your crop data and images are securely stored and protected with enterprise-grade security.",
      color: "text-primary-light",
      bgColor: "bg-primary-light/10",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              {translations.features.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {translations.features.subtitle}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card 
                  key={index} 
                  className="shadow-medium hover:shadow-strong transition-smooth border-0 bg-card/80 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                      {/* Icon */}
                      <div 
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${feature.bgColor}`}
                      >
                        <IconComponent className={`h-8 w-8 ${feature.color}`} />
                      </div>
                      
                      {/* Content */}
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold font-heading text-foreground">
                          {feature.title}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {feature.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-card/60 backdrop-blur-sm rounded-2xl p-8 shadow-medium border border-border/50">
              <h3 className="text-2xl font-bold font-heading text-foreground mb-4">
                Ready to Protect Your Crops?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Join thousands of farmers who trust CropCare AI for crop disease detection and prevention.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-success rounded-full" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  <span>No signup required</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="w-2 h-2 bg-accent rounded-full" />
                  <span>Multilingual support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;