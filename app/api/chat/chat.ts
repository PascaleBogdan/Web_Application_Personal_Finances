// chat.ts
import { Hono } from 'hono';
import { Configuration, OpenAIApi } from "openai-edge";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { AxiosError } from 'axios';

const config = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(config);

const chat = new Hono();

const handleErrorResponse = (ctx: any, error: any) => {
    console.error('Error communicating with OpenAI API:', error);

    if (error instanceof AxiosError) {
        const { response } = error;
        if (response) {
            const { status, data } = response;
            return ctx.json({ error: data }, { status });
        } else {
            return ctx.json({ error: error.message }, { status: 500 });
        }
    } else {
        return ctx.json({ error: 'An unknown error occurred.' }, { status: 500 });
    }
};

chat.post('/', async (ctx) => {
    try {
        const { messages } = await ctx.req.json();

        const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            stream: true,
            messages: [
                { role: "system", content: "You are a helpful assistant. You explain software concepts simply to intermediate programmers." },
                ...messages
            ]
        });

        const stream = await OpenAIStream(response);
        return new StreamingTextResponse(stream);
    } catch (error) {
        return handleErrorResponse(ctx, error);
    }
});

export default chat;
