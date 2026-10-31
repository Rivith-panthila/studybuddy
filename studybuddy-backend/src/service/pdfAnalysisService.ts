import geminiAI from "../config/gemini";

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

    // Ask Gemini to analyze the coursework
    const response = await geminiAI.models.generateContent({
      model: "gemini-3.8-flash",
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

    return response.text;
  } catch (error) {
    console.error("PDF analysis failed:", error);
    throw new Error("Failed to analyze coursework PDF");
  }
};

export default analyzeCourseworkPDF;