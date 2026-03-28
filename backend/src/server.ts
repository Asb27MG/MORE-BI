import app from "./app";
import { testDbConnection } from "./config/db";

const PORT = Number(process.env.PORT) || 4000;

const startServer = async (): Promise<void> => {
  try {
    await testDbConnection();
    console.log("MySQL conectado correctamente");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    console.error(`No se pudo conectar a MySQL: ${message}`);
  }

  app.listen(PORT, () => {
    console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
  });
};

void startServer();
