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
    const { question, cropType, context, language } = await req.json();

    // Validate input
    if (!question || typeof question !== 'string') {
      return new Response(JSON.stringify({ error: 'Question is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (question.length > 500) {
      return new Response(JSON.stringify({ error: 'Question too long (max 500 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Processing Q&A:', { question: question.substring(0, 50), cropType, language });

    const systemPrompt = `You are AgriBot Q&A - a knowledgeable and friendly farming assistant for Indian farmers.

CRITICAL RULES:
1. Answer in SIMPLE, farmer-friendly language
2. Be CONCISE - answers should be 2-4 sentences max
3. Provide PRACTICAL, actionable advice
4. Use emojis for clarity
5. ALWAYS respond in ALL THREE languages: English, Hindi, and Kannada
6. If you don't know something, say so honestly

CONTEXT:
- Crop focus: ${cropType || 'General farming'}
- Additional context: ${context || 'None'}
- Primary language: ${language || 'en'}

IMPORTANT: Respond ONLY about farming, agriculture, crops, pests, diseases, soil, weather, and related topics.
If asked about unrelated topics, politely redirect to farming.

OUTPUT FORMAT (JSON):
{
  "answer": "Answer in English",
  "answer_hi": "Answer in Hindi",
  "answer_kn": "Answer in Kannada",
  "followUpSuggestions": ["Related question 1?", "Related question 2?"],
  "confidence": "high/medium/low",
  "sources": "general_knowledge/expert_advice/research"
}`;

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
          { role: 'user', content: question }
        ],
        temperature: 0.5,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          error: 'Rate limit exceeded',
          answer: 'Please wait a moment and try again. 🙏',
          answer_hi: 'कृपया थोड़ी देर प्रतीक्षा करें और पुनः प्रयास करें। 🙏',
          answer_kn: 'ದಯವಿಟ್ಟು ಸ್ವಲ್ಪ ಕಾಯಿರಿ ಮತ್ತು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. 🙏'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in response');
    }

    // Parse response
    let qaResponse;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        qaResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch (parseError) {
      // Fallback to plain text response
      qaResponse = {
        answer: content,
        answer_hi: content,
        answer_kn: content,
        confidence: 'medium',
        followUpSuggestions: []
      };
    }

    // Add metadata
    qaResponse.question = question;
    qaResponse.cropType = cropType;
    qaResponse.timestamp = new Date().toISOString();

    console.log('Q&A processed successfully');

    return new Response(JSON.stringify(qaResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Q&A error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to process question',
      answer: 'Sorry, I could not process your question. Please try again. 🙏',
      answer_hi: 'क्षमा करें, मैं आपके प्रश्न का उत्तर नहीं दे सका। कृपया पुनः प्रयास करें। 🙏',
      answer_kn: 'ಕ್ಷಮಿಸಿ, ನಾನು ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ. 🙏'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
