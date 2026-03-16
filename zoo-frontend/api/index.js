// api/index.js
export default async function handler(req, res) {
  console.log(`[SSR] Request: ${req.method} ${req.url}`);
  
  try {
    // Importar la función de request handler de Angular SSR
    const { reqHandler } = await import('../dist/zoo-connect-web/server/server.mjs');
    
    // Ejecutar el handler de Angular
    return reqHandler(req, res);
  } catch (error) {
    console.error('SSR Error:', error);
    
    // Fallback al HTML estático en caso de error
    try {
      const fs = await import('fs');
      const path = await import('path');
      
      const indexPath = path.join(process.cwd(), 'dist/zoo-connect-web/browser/index.html');
      const indexHtml = fs.readFileSync(indexPath, 'utf-8');
      
      console.log('[SSR] Serving fallback HTML');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(indexHtml);
    } catch (fallbackError) {
      console.error('Fallback Error:', fallbackError);
      res.status(500).send(`
        <html>
          <body>
            <h1>Error del Servidor</h1>
            <p>La aplicación no se pudo cargar correctamente.</p>
            <pre>${error.message}</pre>
          </body>
        </html>
      `);
    }
  }
}