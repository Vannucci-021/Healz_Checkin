import { VercelRequest, VercelResponse } from '@vercel/node';
import cors from 'cors';
import { google } from 'googleapis';

const corsMiddleware = cors();

function runMiddleware(req: VercelRequest, res: VercelResponse, fn: Function) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

function getCredentials() {
  return {
    type: process.env.GOOGLE_TYPE,
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    auth_uri: process.env.GOOGLE_AUTH_URI,
    token_uri: process.env.GOOGLE_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT,
    client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
  };
}

async function getSheetsService() {
  const auth = new google.auth.GoogleAuth({
    credentials: getCredentials(),
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await runMiddleware(req, res, corsMiddleware);

  const spreadsheetId = process.env.SPREADSHEET_ID;
  if (!spreadsheetId) {
    return res.status(500).json({ error: 'SPREADSHEET_ID não definido nas variáveis de ambiente' });
  }

  if (req.method === 'GET' && req.url?.startsWith('/fetch-user')) {
    const token = req.query.token;
    if (token === 'abc123') {
      return res.json({
        name: 'Maria Teste',
        cpf: '12345678900',
        birthDate: '1990-01-01',
        phoneNumber: '11999999999',
        zipCode: '12345678',
        street: 'Rua Fictícia',
        complement: 'apto 5',
        number: '123',
        city: 'São Paulo',
        state: 'SP',
      });
    }
    return res.status(404).json({ error: 'Token inválido' });
  }

  if (req.method === 'POST' && req.url?.startsWith('/send-form')) {
    try {
      const {
        name,
        cpf,
        birthDate,
        phoneNumber,
        zipCode,
        street,
        complement,
        number,
        city,
        state,
      } = req.body;

      const sheets = await getSheetsService();

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'A:J',
        valueInputOption: 'RAW',
        requestBody: {
          values: [
            [name, cpf, birthDate, phoneNumber, zipCode, street, complement, number, city, state],
          ],
        },
      });

      return res.status(200).json({ message: 'Dados salvos com sucesso!' });
    } catch (err: unknown) {
      console.error('Erro ao enviar dados:', err);
      if (err instanceof Error) {
        return res.status(500).json({ error: err.message });
      }
      return res.status(500).json({ error: 'Erro desconhecido ao enviar os dados.' });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
}
