import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import express from "express";
import multer from "multer";
import cors from "cors";

const app = express()
const port = 3000

const upload = multer();
const model = "gemini-2.5-flash-lite";

// The client gets the API key from the environment variable `GEMINI_API_KEY`.
const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.post('/generate-text', async (req, res) => {
    try {
        const {prompt} = req.body;

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
        });

        res.status(200).json({result: response.text});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

app.post('/generate-from-image', upload.single("image"), async (req, res) => {
    try {
        const {prompt} = req.body;
        const base64Image = req.file.buffer.toString('base64');
        
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                {
                    text: prompt,
                    type: "text"
                },
                {
                    inlineData: {
                        data: base64Image,
                        mimeType: req.file.mimetype
                    },
                },
            ]
        })

        res.status(200).json({result: response.text});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

app.post('/generate-from-document', upload.single("document"), async (req, res) => {
    try {
        const {prompt} = req.body;
        const base64Document = req.file.buffer.toString('base64');

        const response = await ai.models.generateContent({
            model: model,
            contents: [
                {
                    text: prompt,
                    type: "text"
                },
                {
                    inlineData: {
                        data: base64Document,
                        mimeType: req.file.mimetype
                    },
                },
            ]
        })

        res.status(200).json({result: response.text});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

app.post('/generate-from-audio', upload.single("audio"), async (req, res) => {
    try {
        const {prompt} = req.body;
        const base64Audio = req.file.buffer.toString('base64');
        
        const response = await ai.models.generateContent({
            model: model,
            contents: [
                {
                    text: prompt,
                    type: "text"
                },
                {
                    inlineData: {
                        data: base64Audio,
                        mimeType: req.file.mimetype
                    },
                },
            ]
        })
        
        res.status(200).json({result: response.text});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

app.post('/api/chat', async (req, res) => {
    try {
        const {conversation} = req.body;

        if(!Array.isArray(conversation)) throw new Error('Message must be an array!');

        const contents = conversation.map(({role, text}) => ({
            role,
            parts: [{text}]
        }));

        const response = await ai.models.generateContent({
            model: model,
            contents,
            config: {
                temperature: 0.1,
                systemInstruction: `
                Kamu adalah seorang travel agent yang diprogram untuk membantu pengguna aplikasi menjawab
                pertanyaan-pertanyaan terkait destinasi wisata dan segala hal yang berhubungan dengan
                wisata pengguna (akomodasi, transportasi, dll). Jawab dengan gaya bahasa yang santai,
                seperti teman sebaya. Jangan menjawab pertanyaan atau perintah yang tidak berhubungan
                dengan hal yang saya sebutkan, terutama terkait politik, medis, dan segala hal yang 
                bersifat sensitif dan kontroversial. Jawab hanya dalam Bahasa Indonesia. Pastikan berikan
                format teks yang dapat dibaca dengan jelas oleh pengguna aplikasi pada platform web.
                `
            }
        })

        res.status(200).json({result: response.text});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})

// async function main() {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash-lite",
//     contents: "Explain how AI works in a few words",
//   });
//   console.log(response.text);
// }

// main();