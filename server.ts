import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const port = Number(process.env.PORT) || 3000;

// Initialize Gemini API Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface AppUsageInput {
  name: string;
  category: string;
  minutes: number;
  opens: number;
}

// Fallback generator when API key is missing or offline
function generateFallbackAdvice(
  highUsageApps: AppUsageInput[],
  totalMinutes: number,
  pickups: number
) {
  const topApp = highUsageApps[0]?.name || 'Instagram';
  const secondApp = highUsageApps[1]?.name || 'WhatsApp';

  return {
    healthScore: Math.max(30, Math.min(85, 100 - Math.round(totalMinutes / 6) - Math.round(pickups / 4))),
    summary: `Your screen time shows elevated engagement on ${topApp} and ${secondApp}, accounting for the majority of daytime unlocks. Introducing intentional friction and boundary rituals can reclaim 45-60 minutes daily.`,
    behavioralTriggers: [
      {
        app: topApp,
        trigger: 'Variable reward dopamine loops via algorithmic short-form feeds and story updates.',
        frictionFix: 'Relocate the app into a secondary subfolder or remove it from the Android home screen dock.',
      },
      {
        app: secondApp,
        trigger: 'Frequent ambient phone pick-ups driven by unread chat notification badges.',
        frictionFix: 'Mute non-urgent group chats and batch messaging reviews to top-of-the-hour check-ins.',
      },
    ],
    actionableTips: [
      {
        category: 'Physical Environment',
        title: 'The 20-Foot Charger Rule',
        description: 'Charge your Android phone across the room at bedtime rather than on the nightstand to eliminate late-night revenge bedtime scrolling.',
        impact: 'high',
      },
      {
        category: 'App Architecture',
        title: 'Grayscale Focus Switch',
        description: 'Toggle Android Bedtime or accessibility Grayscale mode during work hours to make colorful thumbnails and video feeds significantly less visually stimulating.',
        impact: 'high',
      },
      {
        category: 'Notification Hygiene',
        title: 'Batch Notification Windows',
        description: 'Turn off lock-screen banners for social apps; only allow direct phone calls and calendar appointments through priority DND.',
        impact: 'quick_win',
      },
      {
        category: 'Mindful Friction',
        title: 'The 3-Breath Pause Before Opening',
        description: 'Whenever you tap an infinite-feed app, pause for 3 slow deep breaths to verify if you are opening it intentionally or unconsciously out of boredom.',
        impact: 'medium',
      },
    ],
    dailyCurfews: highUsageApps.slice(0, 3).map((a) => ({
      app: a.name,
      recommendedLimitMinutes: Math.max(20, Math.round(a.minutes * 0.7)),
      reason: `Trimming ~${Math.round(a.minutes * 0.3)}m from ${a.name} keeps you within a balanced digital diet without cold-turkey withdrawal.`,
    })),
    microChallenge: {
      title: '7-Day Screen Time Taper Challenge',
      steps: [
        'Day 1: No phone for the first 30 minutes after waking up.',
        'Day 2: Move social media apps off your primary home screen.',
        'Day 3: Turn off lock-screen notifications for social feeds.',
        'Day 4: Take a 60-minute completely screen-free dinner.',
        'Day 5: Set a 45-minute daily cap on your top distraction app.',
        'Day 6: Enable Grayscale mode starting at 9:00 PM.',
        'Day 7: Review your weekly trends and celebrate staying under goal!',
      ],
    },
  };
}

// POST endpoint for Gemini AI Digital Wellbeing Advice
app.post('/api/wellbeing/advice', async (req, res) => {
  const {
    highUsageApps = [],
    totalScreenTimeMinutes = 200,
    pickups = 60,
    goalMinutes = 240,
    detectedSpikesCount = 2,
    focusRatio = '1:2.5',
  } = req.body;

  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    // If user has not configured API key yet, return the crafted clinical fallback
    return res.json(generateFallbackAdvice(highUsageApps, totalScreenTimeMinutes, pickups));
  }

  try {
    const appsSummary = highUsageApps
      .map(
        (a: AppUsageInput) =>
          `- ${a.name} (${a.category}): ${a.minutes} mins, ${a.opens} opens`
      )
      .join('\n');

    const prompt = `You are a world-class Digital Wellbeing and Behavioral Psychology specialist (similar to Google Digital Wellbeing & Cal Newport's Deep Work philosophy).

Analyze the following Android user screen time profile:
- Total Screen Time Today: ${totalScreenTimeMinutes} minutes (~${(totalScreenTimeMinutes / 60).toFixed(1)} hrs)
- Daily Screen Time Goal: ${goalMinutes} minutes
- Phone Pick-ups / Unlocks Today: ${pickups} pickups
- 30-Day Distraction Spikes: ${detectedSpikesCount} surge days
- Focus Ratio (Work to Distraction): ${focusRatio}

Tracked High-Usage Apps:
${appsSummary || '- Instagram (social): 55m, 35 opens\n- WhatsApp (social): 60m, 45 opens\n- Chrome (browsing): 45m, 22 opens'}

Provide personalized, empathetic, actionable advice and specific micro-adjustments for their Android device to reduce screen time and tame social media addiction while preserving productivity.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are an expert digital wellbeing coach. Output strictly valid JSON matching the requested schema with motivating, non-judgmental, psychologically proven tips.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            healthScore: {
              type: Type.INTEGER,
              description: 'Overall digital wellbeing score between 0 and 100 based on usage.',
            },
            summary: {
              type: Type.STRING,
              description: '2-3 sentence personalized overview of their screen time habits and biggest opportunity.',
            },
            behavioralTriggers: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  app: { type: Type.STRING },
                  trigger: { type: Type.STRING, description: 'Psychological hook causing excessive use' },
                  frictionFix: { type: Type.STRING, description: 'Practical friction trick to break the loop' },
                },
                required: ['app', 'trigger', 'frictionFix'],
              },
            },
            actionableTips: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  category: { type: Type.STRING },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impact: { type: Type.STRING, description: 'high, medium, or quick_win' },
                },
                required: ['category', 'title', 'description', 'impact'],
              },
            },
            dailyCurfews: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  app: { type: Type.STRING },
                  recommendedLimitMinutes: { type: Type.INTEGER },
                  reason: { type: Type.STRING },
                },
                required: ['app', 'recommendedLimitMinutes', 'reason'],
              },
            },
            microChallenge: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: ['title', 'steps'],
            },
          },
          required: [
            'healthScore',
            'summary',
            'behavioralTriggers',
            'actionableTips',
            'dailyCurfews',
            'microChallenge',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    // Return high quality fallback on error
    return res.json(generateFallbackAdvice(highUsageApps, totalScreenTimeMinutes, pickups));
  }
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer();
