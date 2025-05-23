import express from 'express';
import * as path from 'path';
import { connectToDatabase } from './utils';
import cors from 'cors';
import * as trpcExpress from '@trpc/server/adapters/express';
import { appAouter, createContext } from '@monorepo/shared';
import multer from 'multer';
import { Request } from 'express';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config()

const app = express();
connectToDatabase();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Configure multer to save files with their original extension
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'assets'));
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appAouter,
    createContext: createContext
  })
);

app.get('/api', (req, res) => {
  res.send({ message: 'Welcome to backend!' });
});

app.post('/api/upload', upload.single('file'), (req: Request, res) => {
  const file = req.file as Express.Multer.File | undefined;
  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  // Determine file type from mimetype
  const fileType = file.mimetype;
  // Return the public URL and file type
  return res.json({
    url: `${req.protocol}://${req.get('host')}/assets/${file.filename}`,
    fileType,
    filename: file.filename,
    originalname: file.originalname
  });
});

const port = process.env.PORT || 3333  ;
const server = app.listen(Number(port),'0.0.0.0', () => {
  console.log(`Listening at http://localhost:${port}/api`);
});
server.on('error', console.error);
