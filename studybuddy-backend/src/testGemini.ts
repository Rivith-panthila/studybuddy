import geminiAI from "./config/gemini";

const testGemini = async () => {
  try {
    const response = await geminiAI.models.generateContent({
      model: "gemini-3.8-flash",
      contents: "Say hello to StudyBuddy!",
    });

    console.log("Gemini Response:", response.text);
  } catch (error) {
    console.error("Gemini connection failed:", error);
  }
};

testGemini();