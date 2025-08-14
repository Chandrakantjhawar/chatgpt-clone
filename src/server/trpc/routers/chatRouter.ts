// src/server/trpc/routers/chatRouter.ts
import { t } from '../trpc';
import { z } from 'zod';
import { ai, TEXT_MODEL, IMAGE_MODEL } from '@/server/ai/gemini';

export const chatRouter = t.router({
  listMessages: t.procedure.query(async ({ ctx }) => {
    if (!ctx.user) return [];
    const { data, error } = await ctx.supabase
      .from('messages')
      .select('*')
      .eq('user_sub', ctx.user.sub)
      .order('created_at', { ascending: true });

    if (error) return [];
    return data || [];
  }),

  sendMessage: t.procedure.input(z.object({ content: z.string().min(1) })).mutation(async ({ ctx, input }) => {
    if (!ctx.user) throw new Error('Unauthorized');

    await ctx.supabase.from('messages').insert({
      user_sub: ctx.user.sub,
      role: 'user',
      content: input.content,
    });

    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

    const resp = await ai.models.generateContent({
      model: TEXT_MODEL,
      contents: [{ role: 'user', parts: [{ text: input.content }] }],
    });

    const part: any = resp?.candidates?.[0]?.content?.parts?.[0];
    const reply: string = part?.text ?? '(no response)';

    const { error } = await ctx.supabase.from('messages').insert({
      user_sub: ctx.user.sub,
      role: 'assistant',
      content: reply,
    });

    if (error) throw error;
    return { reply };
  }),

  generateImage: t.procedure.input(z.object({ prompt: z.string().min(3) })).mutation(async ({ ctx, input }) => {
    if (!ctx.user) throw new Error('Unauthorized');
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not set');

    const res = await ai.models.generateContent({
      model: IMAGE_MODEL,
      contents: [{ role: 'user', parts: [{ text: input.prompt }] }],
      config: { responseMimeType: 'image/png' as any },
    });

    const part: any = res?.candidates?.[0]?.content?.parts?.[0];
    const b64 = part?.inlineData?.data || part?.data || '';
    if (!b64) throw new Error('No image returned from Gemini');

    const dataUrl = `data:image/png;base64,${b64}`;

    const { error } = await ctx.supabase.from('messages').insert({
      user_sub: ctx.user.sub,
      role: 'image',
      content: input.prompt,
      image_url: dataUrl,
    });

    if (error) throw error;
    return { imageUrl: dataUrl };
  }),
});
