import "dotenv/config";
import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 3001);

const app = createApp();

app.listen(PORT, "0.0.0.0", () => {
    // eslint-disable-next-line no-console
    console.log(`Backend running on http://localhost:${PORT}`);
});
