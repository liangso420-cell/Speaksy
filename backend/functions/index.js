// Speaksy — Cloud Function: análisis de pronunciación real vía Azure Speech.
// Estado: ESCRITO, NO DESPLEGADO NI PROBADO en este entorno (sin acceso a red
// ni a Azure/Firebase reales). Revisar STATUS.md antes de confiar en esto.
//
// Por qué existe esto: la clave de Azure NUNCA debe estar en el navegador.
// Esta función vive en el servidor de Firebase, recibe el audio del usuario,
// llama a Azure con la clave guardada de forma segura, y devuelve solo el
// resultado (puntajes) al navegador.
 
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const fetch = require("node-fetch");
 
admin.initializeApp();
 
// Configura esto con:
//   firebase functions:config:set azure.key="TU_CLAVE" azure.region="TU_REGION"
// (por ejemplo azure.region="eastus" — la región que elegiste al crear el
// recurso de Azure Speech).
const AZURE_KEY = process.env.AZURE_KEY;
const AZURE_REGION = process.env.AZURE_REGION;
 
exports.assessPronunciation = functions.https.onRequest(async (req, res) => {
  // CORS básico para poder llamarla directo desde speaksy.html
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") { res.status(204).send(""); return; }
  if (req.method !== "POST") { res.status(405).json({ error: "Método no permitido" }); return; }
 
  if (!AZURE_KEY || !AZURE_REGION) {
    res.status(500).json({ error: "Azure no está configurado en el servidor todavía." });
    return;
  }
 
  // Verifica que quien llama esté autenticado con Firebase (mismo login que
  // usa speaksy.html), para que nadie ajeno gaste tu cuota de Azure.
  const authHeader = req.headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Falta el token de autenticación." });
    return;
  }
  try {
    await admin.auth().verifyIdToken(authHeader.split(" ")[1]);
  } catch (e) {
    res.status(401).json({ error: "Token inválido." });
    return;
  }
 
  const { audioBase64, referenceText } = req.body || {};
  if (!audioBase64 || !referenceText) {
    res.status(400).json({ error: "Falta audioBase64 o referenceText en el cuerpo de la petición." });
    return;
  }
 
  const pronunciationConfig = Buffer.from(JSON.stringify({
    ReferenceText: referenceText,
    GradingSystem: "HundredMark",
    Granularity: "Phoneme",
    Dimension: "Comprehensive",
  })).toString("base64");
 
  try {
    const azureRes = await fetch(
      `https://${AZURE_REGION}.stt.speech.microsoft.com/speech/recognition/conversation/cognitiveservices/v1?language=es-ES&format=detailed`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY,
          "Content-Type": "audio/wav; codecs=audio/pcm; samplerate=16000",
          "Pronunciation-Assessment": pronunciationConfig,
          "Accept": "application/json",
        },
        body: Buffer.from(audioBase64, "base64"),
      }
    );
 
    if (!azureRes.ok) {
      const text = await azureRes.text();
      res.status(502).json({ error: "Azure respondió con un error", detail: text });
      return;
    }
 
    const data = await azureRes.json();
    const best = data?.NBest?.[0];
    if (!best) {
      res.status(200).json({ error: "No se pudo reconocer audio suficiente para evaluar." });
      return;
    }
 
    res.status(200).json({
      accuracy: best.PronunciationAssessment?.AccuracyScore ?? null,
      fluency: best.PronunciationAssessment?.FluencyScore ?? null,
      completeness: best.PronunciationAssessment?.CompletenessScore ?? null,
      overall: best.PronunciationAssessment?.PronScore ?? null,
      words: (best.Words || []).map((w) => ({
        word: w.Word,
        accuracy: w.PronunciationAssessment?.AccuracyScore ?? null,
        errorType: w.PronunciationAssessment?.ErrorType ?? "None",
      })),
    });
  } catch (e) {
    res.status(500).json({ error: "Error llamando a Azure", detail: String(e) });
  }
});