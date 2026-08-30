export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    // Valor simulado (mock) para a barra funcionar perfeitamente enquanto configuramos as cobranças reais
    // Você pode alterar o número "0" abaixo para testar a barra (ex: 150.00)
    const valorSimulado = 0.00;

    return res.status(200).json({ total: valorSimulado });
  } catch (error) {
    return res.status(500).json({ total: 0, error: error.message });
  }
}
