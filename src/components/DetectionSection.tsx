import React, { useState, useRef } from 'react';
import { Camera, Upload, Scan, CheckCircle, AlertTriangle, Lightbulb, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface DetectionSectionProps {
  translations: any;
  currentLanguage: string;
}

interface DetectionResult {
  crop: string;
  issue: string;
  category: string;
  severity: string;
  confidence: string;
  description: {
    english: string;
    hindi: string;
    kannada: string;
  };
  solutions: {
    english: string;
    hindi: string;
    kannada: string;
  };
  tts: {
    english: string;
    hindi: string;
    kannada: string;
  };
  preventive_tips: string;
  timestamp: string;
}

const DetectionSection: React.FC<DetectionSectionProps> = ({ translations, currentLanguage }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setDetectionResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDetection = async () => {
    if (!selectedImage) return;
    
    setIsDetecting(true);
    
    try {
      console.log('Sending image for AI detection...');
      
      const { data, error } = await supabase.functions.invoke('detect-disease', {
        body: { imageData: selectedImage }
      });

      if (error) {
        console.error('Detection error:', error);
        toast.error('Detection failed. Please try again.');
        return;
      }

      console.log('Detection result:', data);
      setDetectionResult(data as DetectionResult);
      toast.success(`🌱 Detected: ${data.issue} in ${data.crop}`);
      
    } catch (error) {
      console.error('Error during detection:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsDetecting(false);
    }
  };

  const openCamera = () => {
    // Mock camera functionality - in real app, this would open device camera
    toast.info("Camera functionality coming soon. Please use upload for now.");
  };

  const handleSpeak = () => {
    if (!detectionResult || isSpeaking) return;

    const langKey = currentLanguage as 'english' | 'hindi' | 'kannada';
    const textToSpeak = detectionResult.tts[langKey] || detectionResult.tts.english;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    const langCodes: { [key: string]: string } = {
      en: 'en-US',
      english: 'en-US',
      hi: 'hi-IN',
      hindi: 'hi-IN',
      kn: 'kn-IN',
      kannada: 'kn-IN'
    };
    utterance.lang = langCodes[currentLanguage] || 'en-US';
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const getDescriptionText = (result: DetectionResult): string => {
    const langKey = currentLanguage === 'en' ? 'english' : currentLanguage === 'hi' ? 'hindi' : 'kannada';
    return result.description[langKey];
  };

  const getSolutionsText = (result: DetectionResult): string => {
    const langKey = currentLanguage === 'en' ? 'english' : currentLanguage === 'hi' ? 'hindi' : 'kannada';
    return result.solutions[langKey];
  };

  return (
    <section id="detect" className="py-20 bg-gradient-earth">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-foreground mb-4">
              {translations.detection.title}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {translations.detection.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scan className="h-5 w-5 text-primary" />
                  🌿 Upload Crop Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Image Preview */}
                {selectedImage ? (
                  <div className="relative">
                    <img
                      src={selectedImage}
                      alt="Selected crop"
                      className="w-full h-64 object-cover rounded-lg border-2 border-border"
                    />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute top-2 right-2 bg-error text-error-foreground rounded-full w-8 h-8 flex items-center justify-center text-sm hover:bg-error/90 transition-fast"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-lg p-12 text-center">
                    <Camera className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      No image selected. Choose an option below.
                    </p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    variant="farmer" 
                    size="lg" 
                    onClick={openCamera}
                    className="w-full"
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    {translations.detection.buttons.camera}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Upload className="h-5 w-5 mr-2" />
                    {translations.detection.buttons.upload}
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Detect Button */}
                {selectedImage && (
                  <Button
                    variant="hero"
                    size="lg"
                    onClick={handleDetection}
                    disabled={isDetecting}
                    className="w-full"
                  >
                    {isDetecting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        🔬 Analyzing with AI...
                      </>
                    ) : (
                      <>
                        <Scan className="h-5 w-5 mr-2" />
                        {translations.detection.buttons.detect}
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Results Section */}
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-success" />
                  📊 {translations.detection.results.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {detectionResult ? (
                  <div className="space-y-6">
                     {/* Disease Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-foreground">
                          🪲 {detectionResult.issue}
                        </h3>
                        <Badge 
                          variant={parseInt(detectionResult.confidence) > 90 ? "default" : "secondary"}
                          className="text-sm"
                        >
                          {detectionResult.confidence}% {translations.detection.results.confidence}
                        </Badge>
                      </div>

                      {/* Listen Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleSpeak}
                        disabled={isSpeaking}
                        className="w-full"
                      >
                        <Volume2 className={`h-4 w-4 mr-2 ${isSpeaking ? 'animate-pulse' : ''}`} />
                        {isSpeaking ? '🔊 Speaking...' : '🔊 Listen to Explanation'}
                      </Button>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">🌾 Crop:</span>
                        <span className="font-medium">{detectionResult.crop}</span>
                        <span className="text-sm text-muted-foreground">⚠️ Severity:</span>
                        <Badge variant={detectionResult.severity === 'High' ? 'destructive' : detectionResult.severity === 'Medium' ? 'secondary' : 'default'}>
                          {detectionResult.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">📂 Type:</span>
                        <Badge variant="outline">
                          {detectionResult.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Scan className="h-4 w-4 text-primary" />
                        🔍 What We Detected
                      </h4>
                      <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg whitespace-pre-line">
                        {getDescriptionText(detectionResult)}
                      </div>
                    </div>

                    {/* Solutions */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        💊 Treatment & Solutions
                      </h4>
                      <div className="text-sm text-muted-foreground bg-warning/10 p-3 rounded-lg whitespace-pre-line">
                        {getSolutionsText(detectionResult)}
                      </div>
                    </div>

                    {/* Prevention */}
                    <div className="space-y-2">
                      <h4 className="font-semibold text-foreground flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-accent" />
                        🛡️ Prevention Tips
                      </h4>
                      <div className="text-sm text-muted-foreground bg-accent/10 p-3 rounded-lg whitespace-pre-line">
                        {detectionResult.preventive_tips}
                      </div>
                    </div>

                    {/* Timestamp */}
                    <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                      ⏰ Detected at: {new Date(detectionResult.timestamp).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Scan className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      Upload an image and click detect to see AI-powered results here.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DetectionSection;
