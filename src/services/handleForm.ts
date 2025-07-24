import type { CheckinSchemaType } from '../schemas/CheckinSchemaZod';

export default class HandleSubmit {
  private static API_URL =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3001' // ambiente local
      : '/.netlify/functions';   // produção Netlify

  async execute(input: CheckinSchemaType): Promise<any> {
    try {
      const res = await fetch(`${HandleSubmit.API_URL}/send-form`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const errorBody = await res.text();
        throw new Error(`Erro ao enviar: ${res.status} ${res.statusText} - ${errorBody}`);
      }

      return await res.json();
    } catch (error) {
      throw error;
    }
  }
}
