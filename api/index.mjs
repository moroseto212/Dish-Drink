import app from '../server/src/app.js';

export default function handler(req, res) {
  app(req, res);
}

export const config = {
  api: {
    bodyParser: false,
  },
};