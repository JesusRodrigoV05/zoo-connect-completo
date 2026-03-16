import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express, { NextFunction, Request, Response } from 'express';
import { join } from 'node:path';
import { GoogleGenAI } from '@google/genai';

import 'dotenv/config';
import { QuizJsonSchema, QuizSchema } from '@models/quiz/quiz.schemas';
import { environment } from '@env';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Acceso denegado: No autenticado' });
    return;
  }

  try {
    const baseUrl = process.env['BACKEND_INTERNAL_URL'] || environment.apiUrl;
    const backendRealUrl = baseUrl + '/auth/me';
    const validationResponse = await fetch(backendRealUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!validationResponse.ok) {
      throw new Error('Token inválido o expirado');
    }

    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
    return;
  }
};

app.get('/api/weather', requireAuth, async (req, res, next) => {
  const city = (req.query['city'] as string) || 'La Paz';
  const apiKey = process.env['WEATHER_API_KEY'];

  if (!apiKey) {
    return res
      .status(500)
      .json({ error: 'API Configuration Error: Key missing' });
  }

  const apiUrl = `http://api.weatherapi.com/v1/current.json?key=${apiKey}&q=${city}`;

  try {
    const apiResponse = await fetch(apiUrl);

    if (!apiResponse.ok) {
      return res
        .status(apiResponse.status)
        .json({ error: 'Error fetching weather data' });
    }

    const data = await apiResponse.json();

    return res.json(data);
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/generate-quiz', requireAuth, async (req, res) => {
  try {
    const amount = req.query['amount'] || '5';
    const difficulty = req.query['difficulty'] || 'medio';
    const topic =
      (req.query['category'] as string) || 'Fauna Silvestre y Conservación';

    const ai = new GoogleGenAI({});

    const prompt = `
          Genera un quiz educativo sobre: "${topic}".
          Cantidad: ${amount}. Dificultad: ${difficulty}. Idioma: Español Neutro.
        `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: 'Eres un experto zoólogo y educador veterinario.',
        responseMimeType: 'application/json',
        responseJsonSchema: QuizJsonSchema,
      },
    });

    const rawData = JSON.parse(response.text!);
    const quizData = QuizSchema.parse(rawData);

    return res.json(quizData);
  } catch (error) {
    console.error('Error generando quiz con Gemini:', error);
    return res.status(500).json({
      error: 'Error al generar el quiz',
      details: error instanceof Error ? error.message : 'Unknown',
    });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url)) {
  const port = process.env['PORT'] || 4200;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Angular running on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or serverless platforms like Vercel.
 */
export const reqHandler = createNodeRequestHandler(app);

/**
 * Express app instance for serverless platforms
 */
export { app };

/**
 * Default export for compatibility with serverless platforms
 */
export default app;
