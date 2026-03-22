import { buildApp } from "./server.js";

const PORT = process.env.PORT || 4000;

const start = async () => {
  const app = buildApp();
  try {
    await app.listen({ port: Number(PORT)})
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()