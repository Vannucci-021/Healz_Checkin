import type { CheckinSchemaType } from '../schemas/CheckinSchemaZod';

export default class HandleSubmit {
  // Altere para sua URL de backend real, local ou produção
  private static API_URL = 
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? 'http://localhost:3001' // backend local
      : 'https://sua-api-producao.com'; // backend produção (ajuste aqui)

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
