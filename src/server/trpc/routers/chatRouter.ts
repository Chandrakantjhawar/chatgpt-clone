import { z } from 'zod';
import { initTRPC } from '@trpc/server';
import type { Context } from '../context';
import { ai, TEXT_MODEL, IMAGE_MODEL } from '@/server/ai/gemini';

const t = initTRPC.context<Context>().create();

// Type for AI response
type AIResponse = {
  candidates?: { content?: { parts?: { text?: string; inlineData?: { data?: string } }[] } }[];
  text?: string | (() => string);
};

export const chatRouter = t.router({
  // List messages for logged-in user
  listMessages: t.procedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) return [];
      const { data, error } = await ctx.supabase
        .from('messages')
        .select('*')
        .eq('user_sub', ctx.user.sub)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Supabase listMessages error:', error);
        return [];
      }
      return data || [];
    } catch (e) {
      console.error('listMessages failed:', e);
      return [];
    }
  }),

  // Send a chat message and get AI reply
  sendMessage: t.procedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error('Unauthorized');
      try {
        // Save user message
        await ctx.supabase.from('messages').insert({
          user_sub: ctx.user.sub,
          role: 'user',
          content: input.content,
        });

        if (!process.env.GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY is not set');
        }

        // Call Gemini AI
        const resp = await ai.models.generateContent({
          model: TEXT_MODEL,
          contents: [{ role: 'user', parts: [{ text: input.content }] }],
        });

        // Type-safe extraction of AI text
        const respTyped = resp as AIResponse;
        const part = respTyped.candidates?.[0]?.content?.parts?.[0];
        const reply =
          part?.text ??
          (typeof respTyped.text === 'function' ? respTyped.text() : respTyped.text ?? '') ??
          '(no response)';

        // Save AI reply
        const { error } = await ctx.supabase.from('messages').insert({
          user_sub: ctx.user.sub,
          role: 'assistant',
          content: reply,
        });

        if (error) {
          console.error('Supabase insert assistant error:', error);
          throw error;
        }

        return { reply };
      } catch (err) {
        console.error('sendMessage failed:', err);
        throw new Error(
          `sendMessage failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }),

  // Generate AI image
  generateImage: t.procedure
    .input(z.object({ prompt: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error('Unauthorized');

      try {
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('GEMINI_API_KEY is not set');
        }

        const res = await ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
          config: { responseMimeType: 'image/png' as any },
        });

        const part: { inlineData?: { data?: string }; data?: string } | undefined =
          res?.candidates?.[0]?.content?.parts?.[0];
        const b64 = part?.inlineData?.data || part?.data || '';
        if (!b64) throw new Error('No image returned from Gemini');

        const dataUrl = `data:image/png;base64,${b64}`;

        const { error } = await ctx.supabase.from('messages').insert({
          user_sub: ctx.user.sub,
          role: 'image',
          content: input.prompt,
          image_url: dataUrl,
        });
        if (error) {
          console.error('Supabase insert image error:', error);
          throw error;
        }

        return { imageUrl: dataUrl };
      } catch (err) {
        console.error('generateImage failed:', err);
        throw new Error(
          `generateImage failed: ${err instanceof Error ? err.message : String(err)}`
        );
      }
    }),
});
