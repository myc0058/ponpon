
import 'dotenv/config'
import axios from 'axios'
import fs from 'fs'

const apiKey = process.env.GOOGLE_AI_STUDIO_KEY

async function testImagen() {
    console.log('Testing Nano Banana (Gemini 2.5 Flash Image) API...')
    try {
        const response = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${apiKey}`,
            {
                contents: [{ parts: [{ text: 'Generate a high quality 512x512 image of: A simple cute kitten, Studio Ghibli style. Return only the image data.' }] }]
            }
        )
        console.log('Success!', JSON.stringify(response.data, null, 2).substring(0, 500))
        // If it returns base64, save it
        const base64Data = response.data.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)?.inlineData?.data;
        if (base64Data) {
            fs.writeFileSync('test-kitten.png', Buffer.from(base64Data, 'base64'))
            console.log('Saved test-kitten.png')
        } else {
            console.log('No image data found in response.')
        }
    } catch (err: any) {
        console.error('Error:', err.response?.data || err.message)
    }
}

testImagen()
