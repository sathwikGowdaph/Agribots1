import React, { useState } from 'react';
import { Users, MessageCircle, HelpCircle, TrendingUp, Pin, Send, Image, ThumbsUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CommunitySectionProps {
  translations: any;
  currentLanguage: string;
}

interface Question {
  id: number;
  question: {
    en: string;
    hi: string;
    kn: string;
  };
  author: string;
  category: string;
  timeAgo: string;
  replies: number;
  likes: number;
  isPinned: boolean;
  isAnswered: boolean;
  imageUrl?: string;
}

const CommunitySection: React.FC<CommunitySectionProps> = ({ translations, currentLanguage }) => {
  const [showAskForm, setShowAskForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');

  const pinnedQuestions: Question[] = [
    {
      id: 1,
      question: {
        en: "🌾 How to identify Late Blight in Tomato early?",
        hi: "🌾 टमाटर में लेट ब्लाइट की जल्दी पहचान कैसे करें?",
        kn: "🌾 ಟೊಮೆಟೋದಲ್ಲಿ ಲೇಟ್ ಬ್ಲೈಟ್ ಅನ್ನು ಬೇಗ ಗುರುತಿಸುವುದು ಹೇಗೆ?"
      },
      author: "Dr. Ravi Kumar",
      category: "🍅 Tomato",
      timeAgo: "Pinned",
      replies: 45,
      likes: 128,
      isPinned: true,
      isAnswered: true
    },
    {
      id: 2,
      question: {
        en: "🐛 Best organic method for Stem Borer in Rice?",
        hi: "🐛 चावल में तना छेदक के लिए सबसे अच्छा जैविक तरीका?",
        kn: "🐛 ಭತ್ತದಲ್ಲಿ ಕಾಂಡ ಕೊರೆಯುವ ಹುಳುಗಳಿಗೆ ಉತ್ತಮ ಸಾವಯವ ವಿಧಾನ?"
      },
      author: "Expert Panel",
      category: "🌾 Rice/Paddy",
      timeAgo: "Pinned",
      replies: 67,
      likes: 203,
      isPinned: true,
      isAnswered: true
    }
  ];

  const recentQuestions: Question[] = [
    {
      id: 3,
      question: {
        en: "My chili leaves have white spots, is it Thrips?",
        hi: "मेरी मिर्च की पत्तियों पर सफेद धब्बे हैं, क्या यह थ्रिप्स है?",
        kn: "ನನ್ನ ಮೆಣಸಿನಕಾಯಿ ಎಲೆಗಳಲ್ಲಿ ಬಿಳಿ ಚುಕ್ಕೆಗಳಿವೆ, ಇದು ಥ್ರಿಪ್ಸ್ ಆಗಿದೆಯೇ?"
      },
      author: "Manjunath S",
      category: "🌶️ Chili",
      timeAgo: "2 hours ago",
      replies: 8,
      likes: 12,
      isPinned: false,
      isAnswered: true,
      imageUrl: "/placeholder.svg"
    },
    {
      id: 4,
      question: {
        en: "Cotton bollworm attack increasing, what to do?",
        hi: "कपास में बॉलवर्म का हमला बढ़ रहा है, क्या करें?",
        kn: "ಹತ್ತಿಯಲ್ಲಿ ಬಾಲ್‌ವರ್ಮ್ ದಾಳಿ ಹೆಚ್ಚುತ್ತಿದೆ, ಏನು ಮಾಡಬೇಕು?"
      },
      author: "Priya Devi",
      category: "🧵 Cotton",
      timeAgo: "5 hours ago",
      replies: 15,
      likes: 23,
      isPinned: false,
      isAnswered: false
    },
    {
      id: 5,
      question: {
        en: "Banana leaves curling at edges - Bunchy Top Virus?",
        hi: "केले की पत्तियां किनारों पर मुड़ रही हैं - क्या यह बंची टॉप वायरस है?",
        kn: "ಬಾಳೆ ಎಲೆಗಳು ಅಂಚುಗಳಲ್ಲಿ ಸುರುಳಿಯಾಗುತ್ತಿವೆ - ಬಂಚಿ ಟಾಪ್ ವೈರಸ್?"
      },
      author: "Suresh K",
      category: "🍌 Banana",
      timeAgo: "1 day ago",
      replies: 21,
      likes: 34,
      isPinned: false,
      isAnswered: true,
      imageUrl: "/placeholder.svg"
    }
  ];

  const getQuestionText = (q: Question) => {
    if (currentLanguage === 'hi') return q.question.hi;
    if (currentLanguage === 'kn') return q.question.kn;
    return q.question.en;
  };

  const handleAskQuestion = () => {
    if (!newQuestion.trim()) {
      toast.error('Please enter your question');
      return;
    }
    toast.success('📝 Question posted! Our community will respond soon.');
    setNewQuestion('');
    setShowAskForm(false);
  };

  const labels = {
    en: {
      pinnedQuestions: "📌 Pinned Questions",
      recentQuestions: "💬 Recent Questions",
      askQuestion: "❓ Ask Question",
      viewAll: "👀 View All Discussions",
      replies: "replies",
      answered: "✅ Answered",
      pending: "⏳ Pending",
      placeholder: "Type your farming question here...",
      postQuestion: "📤 Post Question",
      addImage: "📷 Add Image",
      communityStats: "📊 Community Stats",
      activeFarmers: "👨‍🌾 Active Farmers",
      questionsAnswered: "✅ Questions Answered",
      experts: "🎓 Expert Contributors"
    },
    hi: {
      pinnedQuestions: "📌 पिन किए गए प्रश्न",
      recentQuestions: "💬 हाल के प्रश्न",
      askQuestion: "❓ प्रश्न पूछें",
      viewAll: "👀 सभी चर्चाएं देखें",
      replies: "जवाब",
      answered: "✅ उत्तर दिया गया",
      pending: "⏳ लंबित",
      placeholder: "अपना खेती का प्रश्न यहां टाइप करें...",
      postQuestion: "📤 प्रश्न पोस्ट करें",
      addImage: "📷 फोटो जोड़ें",
      communityStats: "📊 समुदाय आंकड़े",
      activeFarmers: "👨‍🌾 सक्रिय किसान",
      questionsAnswered: "✅ उत्तर दिए गए प्रश्न",
      experts: "🎓 विशेषज्ञ योगदानकर्ता"
    },
    kn: {
      pinnedQuestions: "📌 ಪಿನ್ ಮಾಡಿದ ಪ್ರಶ್ನೆಗಳು",
      recentQuestions: "💬 ಇತ್ತೀಚಿನ ಪ್ರಶ್ನೆಗಳು",
      askQuestion: "❓ ಪ್ರಶ್ನೆ ಕೇಳಿ",
      viewAll: "👀 ಎಲ್ಲಾ ಚರ್ಚೆಗಳನ್ನು ನೋಡಿ",
      replies: "ಉತ್ತರಗಳು",
      answered: "✅ ಉತ್ತರಿಸಲಾಗಿದೆ",
      pending: "⏳ ಬಾಕಿ",
      placeholder: "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಯನ್ನು ಇಲ್ಲಿ ಟೈಪ್ ಮಾಡಿ...",
      postQuestion: "📤 ಪ್ರಶ್ನೆ ಪೋಸ್ಟ್ ಮಾಡಿ",
      addImage: "📷 ಫೋಟೋ ಸೇರಿಸಿ",
      communityStats: "📊 ಸಮುದಾಯ ಅಂಕಿಅಂಶಗಳು",
      activeFarmers: "👨‍🌾 ಸಕ್ರಿಯ ರೈತರು",
      questionsAnswered: "✅ ಉತ್ತರಿಸಿದ ಪ್ರಶ್ನೆಗಳು",
      experts: "🎓 ತಜ್ಞ ಕೊಡುಗೆದಾರರು"
    }
  };

  const t = labels[currentLanguage as keyof typeof labels] || labels.en;

  return (
    <section id="community" className="py-12 md:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading text-foreground mb-3">
              👥 {translations.community.title}
            </h2>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">
              🌱 {translations.community.subtitle}
            </p>
          </div>

          {/* Ask Question Button & Form */}
          <div className="mb-8">
            {!showAskForm ? (
              <Button 
                variant="farmer" 
                size="lg" 
                onClick={() => setShowAskForm(true)}
                className="w-full text-lg py-6"
              >
                <HelpCircle className="h-6 w-6 mr-3" />
                {t.askQuestion}
              </Button>
            ) : (
              <Card className="shadow-medium">
                <CardContent className="pt-6 space-y-4">
                  <Textarea
                    placeholder={t.placeholder}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    className="min-h-[100px] text-base"
                  />
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" className="flex-1">
                      <Image className="h-5 w-5 mr-2" />
                      {t.addImage}
                    </Button>
                    <Button variant="hero" size="lg" className="flex-1" onClick={handleAskQuestion}>
                      <Send className="h-5 w-5 mr-2" />
                      {t.postQuestion}
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => setShowAskForm(false)}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Pinned Questions */}
          <Card className="shadow-medium mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Pin className="h-5 w-5 text-primary" />
                {t.pinnedQuestions}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pinnedQuestions.map((q) => (
                <div
                  key={q.id}
                  className="border-2 border-primary/30 bg-primary/5 rounded-xl p-4 hover:shadow-soft transition-smooth cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-foreground text-base leading-tight">
                      {getQuestionText(q)}
                    </h3>
                    <Badge variant="default" className="ml-2 shrink-0">
                      {t.answered}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                    <Badge variant="secondary">{q.category}</Badge>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      {q.replies} {t.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="h-4 w-4" />
                      {q.likes}
                    </span>
                    <span className="text-xs">by {q.author}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Questions */}
          <Card className="shadow-medium mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                {t.recentQuestions}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentQuestions.map((q) => (
                <div
                  key={q.id}
                  className="border border-border rounded-xl p-4 hover:shadow-soft transition-smooth cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {q.imageUrl && (
                      <img 
                        src={q.imageUrl} 
                        alt="Question" 
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-foreground text-base leading-tight">
                          {getQuestionText(q)}
                        </h3>
                        <Badge 
                          variant={q.isAnswered ? "default" : "secondary"} 
                          className="ml-2 shrink-0 text-xs"
                        >
                          {q.isAnswered ? t.answered : t.pending}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 flex-wrap text-sm text-muted-foreground">
                        <Badge variant="outline">{q.category}</Badge>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          {q.replies}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          {q.likes}
                        </span>
                        <span className="text-xs">{q.timeAgo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="lg" className="w-full mt-4">
                <Eye className="h-5 w-5 mr-2" />
                {t.viewAll}
              </Button>
            </CardContent>
          </Card>

          {/* Community Stats */}
          <Card className="shadow-soft">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
                {t.communityStats}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <p className="text-2xl font-bold text-primary">12,847</p>
                  <p className="text-xs text-muted-foreground">{t.activeFarmers}</p>
                </div>
                <div className="p-3 bg-success/10 rounded-xl">
                  <p className="text-2xl font-bold text-success">8,392</p>
                  <p className="text-xs text-muted-foreground">{t.questionsAnswered}</p>
                </div>
                <div className="p-3 bg-accent/10 rounded-xl">
                  <p className="text-2xl font-bold text-accent">156</p>
                  <p className="text-xs text-muted-foreground">{t.experts}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;