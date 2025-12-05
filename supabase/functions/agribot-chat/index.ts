import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, language = "en" } = await req.json();

    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit message length
    const trimmedMessage = message.slice(0, 1000);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Agribot, a friendly and knowledgeable AI assistant for Indian farmers. You specialize in:
- Crop diseases and pests (tomato, potato, rice/paddy, chili, cotton, mango, banana)
- Organic and chemical treatments
- Prevention methods
- Best farming practices

IMPORTANT RULES:
1. Only answer farming-related questions. Politely decline other topics.
2. Use simple, farmer-friendly language - avoid complex scientific terms.
3. Be supportive and encouraging like a helpful neighbor.
4. Provide practical, actionable advice.
5. Consider Indian farming context (monsoon, regional crops, local practices).
6. Use emojis sparingly for friendliness (🌱 🌾 💧 🐛 ✅).

RESPONSE FORMAT:
Return a JSON object with translations:
{
  "en": "English response (3-5 sentences)",
  "hi": "Hindi response (same content in Hindi)",
  "kn": "Kannada response (same content in Kannada)"
}

Keep responses concise but helpful. Focus on the most important information first.`;

    console.log("Processing chat message:", trimmedMessage.substring(0, 50));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: trimmedMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No response from AI");
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Clean potential markdown wrapping
      const cleanedContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsedResponse = JSON.parse(cleanedContent);
    } catch {
      // If parsing fails, use the raw content
      console.log("Failed to parse JSON, using raw content");
      parsedResponse = {
        en: content,
        hi: content,
        kn: content,
      };
    }

    console.log("Chat response generated successfully");

    return new Response(
      JSON.stringify({ response: parsedResponse }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Agribot chat error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        response: {
          en: "I'm sorry, I encountered an error. Please try again.",
          hi: "क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।",
          kn: "ಕ್ಷಮಿಸಿ, ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
