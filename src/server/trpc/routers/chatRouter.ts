import { t } from "../trpc";
import { z } from "zod";
import { ai, TEXT_MODEL, IMAGE_MODEL } from "@/server/ai/gemini";

export const chatRouter = t.router({
  // Fetch messages for logged-in user
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

  // Text chat with Gemini
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

      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      // ✅ Generate text with Gemini
      const response = await ai.models.generateContent({
        model: TEXT_MODEL,
        contents: [{ role: "user", parts: [{ text: input.content }] }],
      });

      const reply =
        response.candidates?.[0]?.content?.parts?.[0]?.text ??
        "(no response)";

      // Save assistant reply
      const { error } = await ctx.supabase.from("messages").insert({
        user_sub: ctx.user.sub,
        role: "assistant",
        content: reply,
      });

      if (error) throw error;
      return { reply };
    }),

  // Image generation
  generateImage: t.procedure
    .input(z.object({ prompt: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set");
      }

      try {
        const response = await ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: [{ role: "user", parts: [{ text: input.prompt }] }],
        });

        const part: any = response?.candidates?.[0]?.content?.parts?.[0];
        const b64 = part?.inlineData?.data;
        if (!b64) throw new Error("No image returned from Gemini");

        const dataUrl = `data:image/png;base64,${b64}`;

        await ctx.supabase.from("messages").insert({
          user_sub: ctx.user.sub,
          role: "image",
          content: input.prompt,
          image_url: dataUrl,
        });

        return { imageUrl: dataUrl };
      } catch (err: any) {
        console.error("❌ Error in generateImage:", err);

        let message = "⚠️ Failed to generate image.";
        if (err.message?.includes("429") || err?.status === 429) {
          message = "⚠️ Rate limit reached. Please wait or upgrade your plan.";
        }

        await ctx.supabase.from("messages").insert({
          user_sub: ctx.user.sub,
          role: "assistant",
          content: message,
        });

        throw new Error(message);
      }
    }),

  // Edit a message (UUID = string)
  editMessage: t.procedure
    .input(
      z.object({
        id: z.string(), // 👈 UUID
        newContent: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const { error } = await ctx.supabase
        .from("messages")
        .update({ content: input.newContent })
        .eq("id", input.id)
        .eq("user_sub", ctx.user.sub);

      if (error) throw error;
      return { success: true };
    }),

  // Delete a message (UUID = string)
  deleteMessage: t.procedure
    .input(z.object({ id: z.string() })) // 👈 UUID
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Unauthorized");

      const { error } = await ctx.supabase
        .from("messages")
        .delete()
        .eq("id", input.id)
        .eq("user_sub", ctx.user.sub);

      if (error) throw error;
      return { success: true };
    }),
});
