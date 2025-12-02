import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: "Image data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are Agribot AI Vision, an expert plant pathologist specialized in detecting crop diseases and pests for Indian farmers.

Your task is to analyze crop images and provide comprehensive multilingual diagnostic reports.

CRITICAL OUTPUT FORMAT - You MUST return ONLY valid JSON with this exact structure:
{
  "crop": "Name of crop detected",
  "issue": "Specific disease/pest name",
  "category": "disease or pest",
  "severity": "Low or Medium or High",
  "confidence": "85-99",
  "description": {
    "english": "2-3 sentences describing the issue, visible symptoms, and what farmers can see on their plants. Use simple words.",
    "hindi": "2-3 वाक्य जिसमें समस्या, लक्षण और किसान क्या देख सकते हैं। सरल भाषा में।",
    "kannada": "2-3 ವಾಕ್ಯಗಳಲ್ಲಿ ಸಮಸ್ಯೆ, ಲಕ್ಷಣಗಳು ಮತ್ತು ರೈತರು ಏನು ನೋಡಬಹುದು. ಸರಳ ಭಾಷೆಯಲ್ಲಿ."
  },
  "solutions": {
    "english": "✔ Organic method: [simple organic treatment]. ✔ Chemical option (if needed): [low-cost chemical]. ✔ Prevention: [2-3 prevention tips].",
    "hindi": "✔ जैविक उपचार: [सरल जैविक उपचार]. ✔ रासायनिक उपचार (यदि ज़रूरी हो): [कम लागत वाला रासायनिक]. ✔ बचाव: [2-3 बचाव के उपाय].",
    "kannada": "✔ ಸಾವಯವ ಚಿಕಿತ್ಸೆ: [ಸರಳ ಸಾವಯವ ಚಿಕಿತ್ಸೆ]. ✔ ರಾಸಾಯನಿಕ ಚಿಕಿತ್ಸೆ (ಅಗತ್ಯವಿದ್ದರೆ): [ಕಡಿಮೆ ಬೆಲೆಯ ರಾಸಾಯನಿಕ]. ✔ ತಡೆಗಾರಿಕೆ: [2-3 ತಡೆಗಾರಿಕೆ ಸಲಹೆಗಳು]."
  },
  "tts": {
    "english": "Your [crop] has [issue]. [Brief treatment]. [Brief prevention].",
    "hindi": "आपके [फसल] में [समस्या] है। [संक्षिप्त उपचार]। [संक्षिप्त बचाव]।",
    "kannada": "ನಿಮ್ಮ [ಬೆಳೆ] ಗೆ [ಸಮಸ್ಯೆ] ಇದೆ. [ಸಂಕ್ಷಿಪ್ತ ಚಿಕಿತ್ಸೆ]. [ಸಂಕ್ಷಿಪ್ತ ತಡೆಗಾರಿಕೆ]."
  },
  "preventive_tips": "General prevention: Crop rotation, proper spacing, field hygiene, resistant varieties.",
  "timestamp": "${new Date().toISOString()}"
}

DETECTION GUIDELINES:
- Identify crop type first (Tomato, Potato, Rice/Paddy, Cotton, Chili, Wheat, Mango, Banana, etc.)
- Detect disease or pest accurately based on visual symptoms
- Common diseases: Late Blight, Early Blight, Powdery Mildew, Leaf Curl, Brown Spot, Anthracnose
- Common pests: Aphids, Whitefly, Thrips, Fruit Borer, Stem Borer, Bollworm
- If plant appears healthy, set issue as "Healthy Plant" and provide preventive care tips
- Confidence should be 85-99% based on image clarity
- Severity: Low (early stage), Medium (spreading), High (severe damage)
- TTS text must be SHORT, RHYTHMIC, and CLEAR for audio output

RESPONSE RULES:
1. Return ONLY the JSON object, no markdown, no code blocks
2. Use emojis in solutions (✔ ⚠️ 🌿) to make it friendly
3. Keep language simple - a farmer with basic education should understand
4. Be confident but supportive in tone
5. Provide practical, affordable solutions

TARGET CROPS IN INDIA:
Tomato, Potato, Rice/Paddy, Cotton, Chili, Wheat, Mango, Banana, Groundnut, Sugarcane, Onion, Garlic, Brinjal/Eggplant`;

    console.log("Analyzing crop image with AI vision...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: systemPrompt 
          },
          { 
            role: "user", 
            content: [
              {
                type: "text",
                text: "Analyze this crop image. Identify the crop, detect any diseases or pests, and provide a complete diagnostic report in the specified JSON format."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    console.log("AI response received:", aiResponse);

    // Parse the JSON response
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedResponse = aiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      parsedResponse = JSON.parse(cleanedResponse);
      
      // Validate required fields
      if (!parsedResponse.crop || !parsedResponse.issue || !parsedResponse.description) {
        throw new Error("Missing required fields in AI response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      console.error("Raw response:", aiResponse);
      
      // Return a fallback response
      return new Response(
        JSON.stringify({
          crop: "Unknown",
          issue: "Detection Error",
          category: "disease",
          severity: "Unknown",
          confidence: "0",
          description: {
            english: "Unable to analyze the image. Please ensure the image is clear and shows the affected crop area.",
            hindi: "छवि का विश्लेषण करने में असमर्थ। कृपया सुनिश्चित करें कि छवि स्पष्ट है।",
            kannada: "ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ಚಿತ್ರ ಸ್ಪಷ್ಟವಾಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."
          },
          solutions: {
            english: "Please upload a clearer image for accurate detection.",
            hindi: "कृपया सटीक पहचान के लिए एक स्पष्ट छवि अपलोड करें।",
            kannada: "ದಯವಿಟ್ಟು ನಿಖರವಾದ ಪತ್ತೆಗಾಗಿ ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ."
          },
          tts: {
            english: "Unable to detect disease. Please upload a clearer image.",
            hindi: "रोग का पता लगाने में असमर्थ। कृपया एक स्पष्ट छवि अपलोड करें।",
            kannada: "ರೋಗ ಪತ್ತೆ ಮಾಡಲು ಸಾಧ್ಯವಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಸ್ಪಷ್ಟ ಚಿತ್ರವನ್ನು ಅಪ್ಲೋಡ್ ಮಾಡಿ."
          },
          preventive_tips: "Ensure good image quality for accurate detection.",
          timestamp: new Date().toISOString()
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in detect-disease:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        crop: "Error",
        issue: "System Error",
        category: "disease",
        severity: "Unknown",
        confidence: "0",
        description: {
          english: "An error occurred during detection. Please try again.",
          hindi: "पहचान के दौरान त्रुटि हुई। कृपया पुनः प्रयास करें।",
          kannada: "ಪತ್ತೆ ಸಮಯದಲ್ಲಿ ದೋಷ ಸಂಭವಿಸಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        },
        solutions: {
          english: "Please try again with a different image.",
          hindi: "कृपया एक अलग छवि के साथ पुनः प्रयास करें।",
          kannada: "ದಯವಿಟ್ಟು ಬೇರೆ ಚಿತ್ರದೊಂದಿಗೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        },
        tts: {
          english: "System error. Please try again.",
          hindi: "सिस्टम त्रुटि। कृपया पुनः प्रयास करें।",
          kannada: "ವ್ಯವಸ್ಥೆ ದೋಷ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
        },
        preventive_tips: "System error occurred.",
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
