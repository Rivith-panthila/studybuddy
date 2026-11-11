
import geminiAI from "../config/gemini";

const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

const analyzeCourseworkPDF = async (filePath: string) => {
  try {
    // Upload PDF to Gemini
    const uploadedFile = await geminiAI.files.upload({
      file: filePath,
      config: {
        mimeType: "application/pdf",
      },
    });

    if (!uploadedFile.uri) {
      throw new Error("Gemini PDF upload failed");
    }

    let response;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        response = await geminiAI.models.generateContent({
          model: "gemini-3.7-flash",
          contents: [
            {
              role: "user",
              parts: [
                {
                  fileData: {
                    fileUri: uploadedFile.uri,
                    mimeType: "application/pdf",
                  },
                },
                {
                  text: `
                    Analyze this coursework PDF.

                    Identify:
                    1. Coursework title
                    2. Submission deadline
                    3. All tasks and activities
                    4. Requirements for each task
                    5. Important instructions
                    6. Estimated difficulty of each task

                    Return the result in a clear structured format.
                    Do not invent missing information.
                  `,
                },
              ],
            },
          ],
        });

        break;
      } catch (error: any) {
        const status = error?.status;

        console.error(
          `Gemini attempt ${attempt} failed. Status:`,
          status
        );

        // Quota exceeded: retrying will not solve this
        if (status === 429) {
          throw new Error(
            "AI service quota exceeded. Please try again later."
          );
        }

        // Retry temporary server errors only
        if (status !== 503 || attempt === maxAttempts) {
          throw error;
        }

        await delay(attempt * 3000);
      }
    }

    if (!response?.text) {
      throw new Error("Gemini returned an empty response");
    }

    return response.text;
  } catch (error: any) {
    console.error("PDF analysis failed:", error);
    console.error("Gemini error message:", error?.message);
    console.error("Gemini error status:", error?.status);

    throw error;
  }
};

export default analyzeCourseworkPDF;
