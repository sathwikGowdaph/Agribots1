import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropType, lessonType, numQuestions = 5 } = await req.json();

    // Validate input
    if (!cropType || typeof cropType !== 'string') {
      return new Response(JSON.stringify({ error: 'Crop type is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating quiz:', { cropType, lessonType, numQuestions });

    const systemPrompt = `You are AgriBot Quiz Generator - create educational farming quizzes for Indian farmers.

CRITICAL RULES:
1. Use SIMPLE, farmer-friendly language
2. Questions should be PRACTICAL and based on real farming scenarios
3. Provide content in ALL THREE languages: English, Hindi, Kannada
4. Each question must have exactly 4 options
5. Include helpful explanations for learning

QUIZ CONTEXT:
- Crop: ${cropType}
- Topic: ${lessonType || 'general farming'}
- Number of questions: ${numQuestions}

OUTPUT FORMAT (JSON):
{
  "questions": [
    {
      "question": "Question text in English?",
      "question_hi": "Question in Hindi?",
      "question_kn": "Question in Kannada?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "options_hi": ["विकल्प A", "विकल्प B", "विकल्प C", "विकल्प D"],
      "options_kn": ["ಆಯ್ಕೆ A", "ಆಯ್ಕೆ B", "ಆಯ್ಕೆ C", "ಆಯ್ಕೆ D"],
      "correctIndex": 0,
      "explanation": "Why this is correct...",
      "explanation_hi": "यह सही क्यों है...",
      "explanation_kn": "ಇದು ಏಕೆ ಸರಿ..."
    }
  ]
}

Make questions about:
- Disease identification and symptoms
- Pest control methods
- Best farming practices
- Seasonal care tips
- Organic vs chemical solutions`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { 
            role: 'user', 
            content: `Generate ${numQuestions} multiple-choice questions about ${cropType} farming, focusing on ${lessonType || 'general knowledge'}. Make them educational and practical for farmers.`
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please try again later.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response
    let quizData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        quizData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Return fallback quiz
      quizData = {
        questions: [
          {
            question: `What is the best time to water ${cropType} crops?`,
            question_hi: `${cropType} फसलों को पानी देने का सबसे अच्छा समय क्या है?`,
            question_kn: `${cropType} ಬೆಳೆಗಳಿಗೆ ನೀರು ಹಾಕಲು ಉತ್ತಮ ಸಮಯ ಯಾವುದು?`,
            options: ['Early morning', 'Afternoon', 'Evening', 'Midnight'],
            options_hi: ['सुबह जल्दी', 'दोपहर', 'शाम', 'आधी रात'],
            options_kn: ['ಬೆಳಿಗ್ಗೆ ಮುಂಜಾನೆ', 'ಮಧ್ಯಾಹ್ನ', 'ಸಂಜೆ', 'ಮಧ್ಯರಾತ್ರಿ'],
            correctIndex: 0,
            explanation: 'Early morning watering reduces water loss due to evaporation.',
            explanation_hi: 'सुबह पानी देने से वाष्पीकरण के कारण पानी की कम हानि होती है।',
            explanation_kn: 'ಬೆಳಿಗ್ಗೆ ನೀರುಹಾಕುವುದು ಆವಿಯಾಗುವಿಕೆಯಿಂದ ನೀರಿನ ನಷ್ಟವನ್ನು ಕಡಿಮೆ ಮಾಡುತ್ತದೆ.'
          }
        ]
      };
    }

    // Validate questions
    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      throw new Error('Invalid quiz format');
    }

    // Ensure each question has required fields
    quizData.questions = quizData.questions.map((q: any, idx: number) => ({
      question: q.question || `Question ${idx + 1}`,
      question_hi: q.question_hi || q.question,
      question_kn: q.question_kn || q.question,
      options: q.options || ['Option A', 'Option B', 'Option C', 'Option D'],
      options_hi: q.options_hi || q.options,
      options_kn: q.options_kn || q.options,
      correctIndex: typeof q.correctIndex === 'number' ? q.correctIndex : 0,
      explanation: q.explanation || 'Learn more about this topic!',
      explanation_hi: q.explanation_hi || q.explanation,
      explanation_kn: q.explanation_kn || q.explanation,
    }));

    console.log('Quiz generated successfully:', quizData.questions.length, 'questions');

    return new Response(JSON.stringify(quizData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Quiz generation error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate quiz' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
