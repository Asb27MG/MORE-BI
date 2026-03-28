import { Router } from "express";
import { ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { getDbPool, testDbConnection } from "../config/db";
import { getGroqClient, getGroqModel } from "../config/groq";

const router = Router();

router.get("/", (_req, res) => {
  res.json({ message: "API lista" });
});

router.get("/db/ping", async (_req, res) => {
  try {
    await testDbConnection();
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    res.status(500).json({ status: "error", database: "disconnected", message });
  }
});

router.get("/consultas", async (_req, res) => {
  try {
    const db = getDbPool();
    const [rows] = await db.query<RowDataPacket[]>(
      "SELECT id, empresa, email, proyecto, mensaje, fecha FROM consultas ORDER BY fecha DESC",
    );

    res.status(200).json(rows);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    res.status(500).json({ status: "error", message });
  }
});

router.post("/consultas", async (req, res) => {
  const { empresa, email, proyecto, mensaje } = req.body as {
    empresa?: string;
    email?: string;
    proyecto?: string;
    mensaje?: string;
  };

  if (!empresa || !email) {
    res.status(400).json({ message: "empresa y email son obligatorios" });
    return;
  }

  try {
    const db = getDbPool();
    const [result] = await db.query<ResultSetHeader>(
      "INSERT INTO consultas (empresa, email, proyecto, mensaje) VALUES (?, ?, ?, ?)",
      [empresa, email, proyecto ?? null, mensaje ?? null],
    );

    res.status(201).json({
      message: "Consulta creada",
      id: result.insertId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    res.status(500).json({ status: "error", message });
  }
});

router.post("/chat", async (req, res) => {
  const { mensaje } = req.body as { mensaje?: string };

  if (!mensaje || !mensaje.trim()) {
    res.status(400).json({ message: "mensaje es obligatorio" });
    return;
  }

  try {
    const groq = getGroqClient();
    const model = getGroqModel();

    const response = await groq.chat.completions.create({
      model,
      temperature: 0.7,
      max_completion_tokens: 1024,
      messages: [
        {
          role: "system",
          content:
            "Sos un asistente experto en analitica de datos, inteligencia artificial y automatizacion para empresas. Responde claro, accionable y en espanol.",
        },
        {
          role: "user",
          content: mensaje,
        },
      ],
    });

    const reply = response.choices[0]?.message?.content?.trim() || "No obtuve respuesta del modelo.";
    res.status(200).json({ reply });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown Groq API error";
    console.error("Error en /api/chat:", message);
    res.status(500).json({ status: "error", message: "Error en la IA" });
  }
});

export default router;
