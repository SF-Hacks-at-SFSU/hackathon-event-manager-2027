import './env';
import app from './app';

// Railway (and most PaaS hosts) assign a port at runtime via $PORT and expect
// the app to listen on it; BACKEND_PORT is our own local-dev convention.
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger docs at http://localhost:${PORT}/api-docs`);
});
