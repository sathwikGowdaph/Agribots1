import React from 'react';
import { Camera, History, Users, Globe, MessageCircle } from 'lucide-react';

interface MobileNavBarProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
}

const MobileNavBar: React.FC<MobileNavBarProps> = ({ currentLanguage, onLanguageChange }) => {
  const navItems = [
    { id: 'detect', icon: Camera, label: '📷 Detect', emoji: '📷' },
    { id: 'chatbot', icon: MessageCircle, label: '💬 Chat', emoji: '💬' },
    { id: 'community', icon: Users, label: '👨‍🌾 Community', emoji: '👨‍🌾' },
  ];

  const languages = [
    { code: 'en', label: 'EN', flag: '🇺🇸' },
    { code: 'hi', label: 'हिं', flag: '🇮🇳' },
    { code: 'kn', label: 'ಕ', flag: '🇮🇳' },
  ];

  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cycleLanguage = () => {
    const currentIndex = languages.findIndex(l => l.code === currentLanguage);
    const nextIndex = (currentIndex + 1) % languages.length;
    onLanguageChange(languages[nextIndex].code);
  };

  const currentLang = languages.find(l => l.code === currentLanguage) || languages[0];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t-2 border-primary/20 shadow-lg md:hidden">
      <div className="flex items-center justify-around py-2 px-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollTo(item.id)}
            className="flex flex-col items-center justify-center py-2 px-4 rounded-xl hover:bg-primary/10 transition-fast min-w-[70px]"
          >
            <span className="text-2xl mb-1">{item.emoji}</span>
            <span className="text-xs font-medium text-muted-foreground">
              {item.label.split(' ')[1]}
            </span>
          </button>
        ))}
        
        {/* Language Toggle */}
        <button
          onClick={cycleLanguage}
          className="flex flex-col items-center justify-center py-2 px-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-fast min-w-[70px]"
        >
          <span className="text-2xl mb-1">🌐</span>
          <span className="text-xs font-bold text-primary">
            {currentLang.label}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default MobileNavBar;
