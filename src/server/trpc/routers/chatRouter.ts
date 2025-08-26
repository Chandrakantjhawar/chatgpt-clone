import { t } from "../trpc";
import { z } from "zod";
import { ai, TEXT_MODEL, IMAGE_MODEL } from "@/server/ai/gemini";

export const chatRouter = t.router({
  listMessages: t.procedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const { data, error } = await ctx.supabase
      .from("messages")
      .select("*")
      .eq("user_sub", ctx.user.sub)
      .order("created_at", { ascending: true });

    if (error) return [];
    return data || [];
  }),

  sendMessage: t.procedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      // Save user message
      await ctx.supabase.from("messages").insert({
        user_sub: ctx.user.sub,
        role: "user",
        content: input.content,
      });

      if (!process.env.GEMINI_API_KEY)
        throw new Error("GEMINI_API_KEY is not set");

      // ✅ Correct Gemini usage
      const model = ai.getGenerativeModel({ model: TEXT_MODEL });
      const result = await model.generateContent(input.content);

      const reply = result.response.text() ?? "(no response)";

      // Save assistant reply
      const { error } = await ctx.supabase.from("messages").insert({
        user_sub: ctx.user.sub,
        role: "assistant",
        content: reply,
      });

      if (error) throw error;
      return { reply };
    }),

  generateImage: t.procedure
    .input(z.object({ prompt: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      if (!process.env.GEMINI_API_KEY)
        throw new Error("GEMINI_API_KEY is not set");

      const model = ai.getGenerativeModel({ model: IMAGE_MODEL });
      const result = await model.generateContent(input.prompt);

      // Extract inline base64 image
      const part: any = result.response.candidates?.[0]?.content?.parts?.[0];
      const b64 = part?.inlineData?.data || "";
      if (!b64) throw new Error("No image returned from Gemini");

      const dataUrl = `data:image/png;base64,${b64}`;

      const { error } = await ctx.supabase.from("messages").insert({
        user_sub: ctx.user.sub,
        role: "image",
        content: input.prompt,
        image_url: dataUrl,
      });

      if (error) throw error;
      return { imageUrl: dataUrl };
    }),
});
