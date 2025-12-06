import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Sun, Cloud, Droplets, Thermometer, Leaf, AlertTriangle } from 'lucide-react';

interface PersonalizationPanelProps {
  currentLanguage: string;
  selectedCrop: string;
  selectedRegion: string;
  selectedSeason: string;
  recentDiseases: string[];
  onCropChange: (crop: string) => void;
  onRegionChange: (region: string) => void;
  onSeasonChange: (season: string) => void;
}

// Crop types for lesson generation
const CROP_TYPES = [
  { id: 'tomato', emoji: '🍅', en: 'Tomato', hi: 'टमाटर', kn: 'ಟೊಮೆಟೊ' },
  { id: 'potato', emoji: '🥔', en: 'Potato', hi: 'आलू', kn: 'ಆಲೂಗಡ್ಡೆ' },
  { id: 'rice', emoji: '🌾', en: 'Rice/Paddy', hi: 'धान', kn: 'ಭತ್ತ' },
  { id: 'chili', emoji: '🌶️', en: 'Chili', hi: 'मिर्च', kn: 'ಮೆಣಸಿನಕಾಯಿ' },
  { id: 'cotton', emoji: '🏵️', en: 'Cotton', hi: 'कपास', kn: 'ಹತ್ತಿ' },
  { id: 'mango', emoji: '🥭', en: 'Mango', hi: 'आम', kn: 'ಮಾವು' },
  { id: 'banana', emoji: '🍌', en: 'Banana', hi: 'केला', kn: 'ಬಾಳೆಹಣ್ಣು' },
  { id: 'wheat', emoji: '🌾', en: 'Wheat', hi: 'गेहूं', kn: 'ಗೋಧಿ' },
  { id: 'sugarcane', emoji: '🎋', en: 'Sugarcane', hi: 'गन्ना', kn: 'ಕಬ್ಬು' },
];

const REGIONS = [
  { id: 'karnataka', en: 'Karnataka', hi: 'कर्नाटक', kn: 'ಕರ್ನಾಟಕ' },
  { id: 'maharashtra', en: 'Maharashtra', hi: 'महाराष्ट्र', kn: 'ಮಹಾರಾಷ್ಟ್ರ' },
  { id: 'andhra', en: 'Andhra Pradesh', hi: 'आंध्र प्रदेश', kn: 'ಆಂಧ್ರ ಪ್ರದೇಶ' },
  { id: 'tamil', en: 'Tamil Nadu', hi: 'तमिलनाडु', kn: 'ತಮಿಳುನಾಡು' },
  { id: 'punjab', en: 'Punjab', hi: 'पंजाब', kn: 'ಪಂಜಾಬ್' },
  { id: 'up', en: 'Uttar Pradesh', hi: 'उत्तर प्रदेश', kn: 'ಉತ್ತರ ಪ್ರದೇಶ' },
  { id: 'gujarat', en: 'Gujarat', hi: 'गुजरात', kn: 'ಗುಜರಾತ್' },
  { id: 'mp', en: 'Madhya Pradesh', hi: 'मध्य प्रदेश', kn: 'ಮಧ್ಯ ಪ್ರದೇಶ' },
  { id: 'rajasthan', en: 'Rajasthan', hi: 'राजस्थान', kn: 'ರಾಜಸ್ಥಾನ' },
  { id: 'kerala', en: 'Kerala', hi: 'केरल', kn: 'ಕೇರಳ' },
];

const SEASONS = [
  { id: 'kharif', en: 'Kharif (Monsoon)', hi: 'खरीफ (मानसून)', kn: 'ಖಾರಿಫ್ (ಮುಂಗಾರು)', icon: Cloud },
  { id: 'rabi', en: 'Rabi (Winter)', hi: 'रबी (सर्दी)', kn: 'ರಬಿ (ಚಳಿಗಾಲ)', icon: Thermometer },
  { id: 'zaid', en: 'Zaid (Summer)', hi: 'जायद (गर्मी)', kn: 'ಜೈದ್ (ಬೇಸಿಗೆ)', icon: Sun },
];

const PersonalizationPanel: React.FC<PersonalizationPanelProps> = ({
  currentLanguage,
  selectedCrop,
  selectedRegion,
  selectedSeason,
  recentDiseases,
  onCropChange,
  onRegionChange,
  onSeasonChange,
}) => {
  // Get text in current language
  const getText = (item: { en: string; hi: string; kn: string }) => {
    switch (currentLanguage) {
      case 'hi': return item.hi;
      case 'kn': return item.kn;
      default: return item.en;
    }
  };

  const selectedCropData = CROP_TYPES.find(c => c.id === selectedCrop);
  const selectedRegionData = REGIONS.find(r => r.id === selectedRegion);
  const selectedSeasonData = SEASONS.find(s => s.id === selectedSeason);

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Leaf className="h-5 w-5 text-primary" />
          {currentLanguage === 'hi' ? '🎯 आपकी पसंद' : currentLanguage === 'kn' ? '🎯 ನಿಮ್ಮ ಆಯ್ಕೆ' : '🎯 Your Preferences'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Crop Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              🌱 {currentLanguage === 'hi' ? 'फसल' : currentLanguage === 'kn' ? 'ಬೆಳೆ' : 'Crop'}
            </label>
            <Select value={selectedCrop} onValueChange={onCropChange}>
              <SelectTrigger>
                <SelectValue placeholder={currentLanguage === 'hi' ? 'फसल चुनें' : currentLanguage === 'kn' ? 'ಬೆಳೆ ಆಯ್ಕೆಮಾಡಿ' : 'Select Crop'} />
              </SelectTrigger>
              <SelectContent>
                {CROP_TYPES.map((crop) => (
                  <SelectItem key={crop.id} value={crop.id}>
                    {crop.emoji} {getText(crop)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Region Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {currentLanguage === 'hi' ? 'क्षेत्र' : currentLanguage === 'kn' ? 'ಪ್ರದೇಶ' : 'Region'}
            </label>
            <Select value={selectedRegion} onValueChange={onRegionChange}>
              <SelectTrigger>
                <SelectValue placeholder={currentLanguage === 'hi' ? 'क्षेत्र चुनें' : currentLanguage === 'kn' ? 'ಪ್ರದೇಶ ಆಯ್ಕೆಮಾಡಿ' : 'Select Region'} />
              </SelectTrigger>
              <SelectContent>
                {REGIONS.map((region) => (
                  <SelectItem key={region.id} value={region.id}>
                    {getText(region)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Season Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1">
              <Sun className="h-4 w-4" />
              {currentLanguage === 'hi' ? 'मौसम' : currentLanguage === 'kn' ? 'ಋತು' : 'Season'}
            </label>
            <Select value={selectedSeason} onValueChange={onSeasonChange}>
              <SelectTrigger>
                <SelectValue placeholder={currentLanguage === 'hi' ? 'मौसम चुनें' : currentLanguage === 'kn' ? 'ಋತು ಆಯ್ಕೆಮಾಡಿ' : 'Select Season'} />
              </SelectTrigger>
              <SelectContent>
                {SEASONS.map((season) => (
                  <SelectItem key={season.id} value={season.id}>
                    {getText(season)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current Selection Summary */}
        <div className="flex flex-wrap gap-2 pt-2 border-t">
          {selectedCropData && (
            <Badge variant="secondary">
              {selectedCropData.emoji} {getText(selectedCropData)}
            </Badge>
          )}
          {selectedRegionData && (
            <Badge variant="outline">
              <MapPin className="h-3 w-3 mr-1" />
              {getText(selectedRegionData)}
            </Badge>
          )}
          {selectedSeasonData && (
            <Badge variant="outline">
              <selectedSeasonData.icon className="h-3 w-3 mr-1" />
              {getText(selectedSeasonData)}
            </Badge>
          )}
        </div>

        {/* Recent Disease History */}
        {recentDiseases.length > 0 && (
          <div className="pt-2 border-t">
            <div className="flex items-center gap-1 text-sm font-medium mb-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {currentLanguage === 'hi' ? 'हाल की बीमारियाँ' : currentLanguage === 'kn' ? 'ಇತ್ತೀಚಿನ ರೋಗಗಳು' : 'Recent Diseases'}
            </div>
            <div className="flex flex-wrap gap-1">
              {recentDiseases.slice(0, 3).map((disease, idx) => (
                <Badge key={idx} variant="destructive" className="text-xs">
                  🦠 {disease}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PersonalizationPanel;
