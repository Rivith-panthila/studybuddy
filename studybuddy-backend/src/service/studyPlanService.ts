import geminiAI from "../config/gemini";

interface StudyDay {
  day: string;
  hours: number;
}

interface StudyPreferences {
  hoursPerDay: number;
  availableDays: StudyDay[];
  preferredTime: "Morning" | "Afternoon" | "Evening";
  breakDuration: number;
}

const generateStudyPlan = async (
  courseworkAnalysis: string,
  preferences: StudyPreferences
) => {
  try {
    const prompt = `
You are an expert AI study planner.

Create a personalized study plan using the following information.

COURSEWORK ANALYSIS:
${courseworkAnalysis}

STUDENT STUDY PREFERENCES:
Maximum study hours per day: ${preferences.hoursPerDay}
Available days and hours:
${JSON.stringify(preferences.availableDays)}
Preferred study time: ${preferences.preferredTime}
Break duration: ${preferences.breakDuration} minutes

INSTRUCTIONS:
1. Divide all coursework tasks into manageable daily study tasks.
2. Prioritize tasks based on deadlines and difficulty.
3. Only schedule tasks on the student's available days.
4. Never exceed the available study hours for a day.
5. Include a suitable task duration in minutes.
6. Include a useful description for every task.
7. Include breaks between study sessions where appropriate.
8. Do not invent coursework requirements or deadlines.
9. Make sure the plan is realistic and achievable.
10. Use dates in YYYY-MM-DD format.
11. Return only valid JSON without Markdown.

Return JSON using this structure:

{
  "dailySchedule": [
    {
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "title": "Task title",
          "description": "Task description",
          "duration": 60
        }
      ]
    }
  ]
}
`;

    const response = await geminiAI.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;

    if (!responseText) {
      throw new Error("Gemini returned an empty response");
    }

    const parsedResponse = JSON.parse(responseText);

    if (!Array.isArray(parsedResponse.dailySchedule)) {
      throw new Error("Invalid study plan format");
    }

    return parsedResponse.dailySchedule;
  } catch (error) {
    console.error("Study plan generation failed:", error);
    throw new Error("Failed to generate AI study plan");
  }
};

export default generateStudyPlan;