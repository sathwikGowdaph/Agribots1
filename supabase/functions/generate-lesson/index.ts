import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropType, region, diseaseHistory, difficulty, lessonType } = await req.json();
    
    // Input validation
    if (!cropType || typeof cropType !== 'string' || cropType.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid crop type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating lesson for:', { cropType, region, difficulty, lessonType });

    const systemPrompt = `You are AgriBot Education AI - a friendly farming teacher for Indian farmers and agriculture students.

Your job is to create SHORT, PRACTICAL micro-lessons (30-60 seconds when read aloud) about farming.

CRITICAL RULES:
1. Use SIMPLE farmer-friendly language - avoid complex scientific terms
2. Include PRACTICAL tips they can use immediately
3. Add relevant emojis for visual clarity
4. Structure content for easy reading and listening
5. Provide content in ALL THREE languages: English, Hindi, and Kannada

LESSON CONTEXT:
- Crop: ${cropType}
- Region: ${region || 'India'}
- Disease History: ${diseaseHistory || 'None specified'}
- Difficulty: ${difficulty || 'beginner'}
- Lesson Type: ${lessonType || 'general'}

OUTPUT FORMAT (JSON):
{
  "title": "Short catchy title in English",
  "title_hi": "Title in Hindi",
  "title_kn": "Title in Kannada",
  "content": "Main lesson content in English (3-5 short paragraphs with emojis)",
  "content_hi": "Same content in Hindi",
  "content_kn": "Same content in Kannada",
  "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
  "keyPoints_hi": ["Key point 1 in Hindi", "..."],
  "keyPoints_kn": ["Key point 1 in Kannada", "..."],
  "practicalTip": "One actionable tip in English",
  "practicalTip_hi": "Same tip in Hindi",
  "practicalTip_kn": "Same tip in Kannada",
  "slides": [
    {
      "title": "Slide title",
      "text": "Slide content (1-2 sentences)",
      "text_hi": "Hindi version",
      "text_kn": "Kannada version",
      "emoji": "🌱",
      "duration": 8
    }
  ]
}

Generate 3-4 slides for animated lesson presentation. Each slide should be readable in 6-10 seconds.
Make content relevant to Indian farming conditions and practices.`;

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
            content: `Generate a micro-lesson about ${lessonType || 'best practices'} for ${cropType} farming. Focus on practical knowledge farmers can apply today.`
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
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response
    let lessonData;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        lessonData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Parse error:', parseError);
      // Return a structured fallback
      lessonData = {
        title: `${cropType} Farming Tips`,
        title_hi: `${cropType} खेती के टिप्स`,
        title_kn: `${cropType} ಕೃಷಿ ಸಲಹೆಗಳು`,
        content: content,
        content_hi: content,
        content_kn: content,
        keyPoints: ['Follow good farming practices', 'Monitor crops regularly', 'Seek expert help when needed'],
        slides: [{ title: 'Farming Tips', text: content.substring(0, 200), emoji: '🌱', duration: 10 }]
      };
    }

    // Add metadata
    lessonData.cropType = cropType;
    lessonData.region = region;
    lessonData.difficulty = difficulty || 'beginner';
    lessonData.lessonType = lessonType || 'general';
    lessonData.durationSeconds = (lessonData.slides?.length || 3) * 10;
    lessonData.generatedAt = new Date().toISOString();

    console.log('Lesson generated successfully:', lessonData.title);

    return new Response(JSON.stringify(lessonData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating lesson:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate lesson' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
