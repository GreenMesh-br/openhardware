export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do PicPay não configuradas na Vercel.');
    }

    // 1. Gera o token de acesso usando Client ID e Client Secret
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const authResponse = await fetch('https://appws.picpay.com/ecommerce/oauth/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ grant_type: 'client_credentials' })
    });

    const authData = await authResponse.json();
    if (!authResponse.ok) throw new Error('Erro na autenticação com o PicPay');

    const accessToken = authData.access_token;

    // 2. Busca os pagamentos/pedidos na API do PicPay
    const paymentsResponse = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const paymentsData = await paymentsResponse.json();
    if (!paymentsResponse.ok) throw new Error('Erro ao buscar pagamentos no PicPay');

    // 3. Soma o valor dos pagamentos pagos
    let totalArrecadado = 0;
    const lista = Array.isArray(paymentsData) ? paymentsData : (paymentsData.payments || []);
    
    totalArrecadado = lista
      .filter(item => item.status === 'paid' || item.status === 'completed')
      .reduce((acc, item) => acc + parseFloat(item.value || item.amount || 0), 0);

    return res.status(200).json({ total: totalArrecadado });
  } catch (error) {
    return res.status(500).json({ total: 0, error: error.message });
  }
}
