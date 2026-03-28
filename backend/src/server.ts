import app from "./app";
import { testDbConnection } from "./config/db";

const PORT = Number(process.env.PORT) || 4000;

const startServer = async (): Promise<void> => {
  try {
    await testDbConnection();
    console.log("MySQL conectado correctamente");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const detail = message && message.trim().length > 0 ? message : JSON.stringify(error);
    console.error(`No se pudo conectar a MySQL: ${detail}`);
  }

  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  });
};

void startServer();
