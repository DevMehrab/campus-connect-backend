import OpenAI from "openai";
import { Routine } from "./routine.model";
import { CalendarEvent } from "./calendar.model";
import { User } from "../user/user.model";
import redisClient from "../../config/redis";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

export const askAssistant = async (userId: string, userMessage: string) => {
  try {
    const historyKey = `chat_history:${userId}`;
    const rawHistory = await redisClient.get(historyKey);
    let chatHistory: Array<{ role: string; content: string }> = rawHistory
      ? JSON.parse(rawHistory)
      : [];

    const lastAssistantMessage =
      chatHistory.length > 0 ? chatHistory[chatHistory.length - 1].content : "None";

    chatHistory.push({ role: "user", content: userMessage });
    const routerPrompt = `
      Analyze the following student message. Determine if answering it accurately requires checking their class routine (schedule) or the academic calendar (exam dates, holidays, events).
      Keep the context of the previous AI response in mind. For example, if the previous response was about a class, and the user asks "What room is it in?", the answer is YES.
      
      Respond with EXACTLY one word: "YES" or "NO".
      Examples:
        1. Student Message: "When is the next holiday?" -> Response: "YES"
        2. Student Message: "What is the capital of France?" -> Response: "NO"
        3. Student Message: "Give me the schedule for my classes on Monday." -> Response: "YES"
        4. Student Message: "Hello, how are you?" -> Response: "NO"
        
      Previous AI Response: "${lastAssistantMessage}"
      Student Message: "${userMessage}"
    `;

    const intentCheck = await groq.chat.completions.create({
      messages: [{ role: "user", content: routerPrompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.0,
      max_tokens: 2
    });

    const requiresContext = intentCheck.choices[0]?.message?.content?.trim().toUpperCase();
    if (requiresContext !== "YES") {
      const casualCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are the Campus Hub AI assistant. Provide a friendly, concise response."
          },
          ...chatHistory
        ] as any,
        model: "llama-3.1-8b-instant",
        temperature: 0.5
      });

      const aiResponse = casualCompletion.choices[0]?.message?.content || "";

      chatHistory.push({ role: "assistant", content: aiResponse });
      if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);
      await redisClient.set(historyKey, JSON.stringify(chatHistory), "EX", 3600);

      return aiResponse;
    }

    const now = new Date();
    const bdTimeStr = now.toLocaleString("en-US", { timeZone: "Asia/Dhaka" });

    const year = now.toLocaleDateString("en-US", { timeZone: "Asia/Dhaka", year: "numeric" });
    const month = now.toLocaleDateString("en-US", { timeZone: "Asia/Dhaka", month: "2-digit" });
    const day = now.toLocaleDateString("en-US", { timeZone: "Asia/Dhaka", day: "2-digit" });
    const todayString = `${year}-${month}-${day}`;

    const student = await User.findById(userId);
    const userRoutine = student ? await Routine.find({ batch: student.batch }) : [];

    const cacheKey = `calendar:upcoming:${todayString}`;
    let academicCalendar;

    const cachedCalendar = await redisClient.get(cacheKey);

    if (cachedCalendar) {
      academicCalendar = JSON.parse(cachedCalendar);
      console.log("⚡ Calendar fetched from Redis Cache");
    } else {
      academicCalendar = await CalendarEvent.find({
        startDate: { $gte: todayString }
      })
        .sort({ startDate: 1 })
        .limit(5);

      await redisClient.set(cacheKey, JSON.stringify(academicCalendar), "EX", 86400);
      console.log("💾 Calendar fetched from MongoDB and cached");
    }

    const systemPrompt = `
      You are the official AI Assistant for Campus Connect (for cse department of BUP). 
      Current Date and Time in Bangladesh: ${bdTimeStr}.
      Today's Date reference: ${todayString}.
      
      Upcoming academic calendar events:
      ${JSON.stringify(academicCalendar)}
      
      User's class routine:
      ${JSON.stringify(userRoutine)}
      
      Instructions:
      - Answer the user's question accurately based ONLY on the data provided above.
      - If they ask about "tomorrow", calculate the target date using the current date provided.
      - Keep answers concise, helpful, and friendly.
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "system", content: systemPrompt }, ...chatHistory] as any,
      model: "llama-3.3-70b-versatile",
      temperature: 0.2
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "";

    chatHistory.push({ role: "assistant", content: aiResponse });
    if (chatHistory.length > 6) chatHistory = chatHistory.slice(-6);
    await redisClient.set(historyKey, JSON.stringify(chatHistory), "EX", 3600);

    return aiResponse;
  } catch (error) {
    console.error("AI Assistant Error:", error);
    return "I'm having trouble connecting to my database right now. Please try again in a few moments!";
  }
};
