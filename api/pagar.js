export default async function handler(req, res) {
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: 'Valor de doação inválido.' });
  }

  try {
    // 1. Pega as credenciais das variáveis de ambiente da Vercel
    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do PicPay não configuradas nas variáveis de ambiente da Vercel.');
    }

    // 2. Autenticação OAuth 2.0 para obter o token de acesso temporário do PicPay
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    
    const tokenResponse = await fetch('https://api.picpay.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials&scope=charges'
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      throw new Error(tokenData.message || 'Falha na autenticação OAuth com o PicPay');
    }

    const accessToken = tokenData.access_token;

    // 3. Cria a cobrança oficial utilizando o token gerado
    const paymentResponse = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        referenceId: "greenmesh-" + Date.now(),
        callbackUrl: "https://greenmesh-br.github.io/openhardware/",
        returnUrl: "https://greenmesh-br.github.io/openhardware/?status=sucesso",
        value: valorNumerico,
        buyer: {
          firstName: "Apoiador",
          lastName: "GreenMesh",
          document: "000.000.000-00",
          email: "apoio@greenmesh.com.br"
        }
      })
    });

    const paymentData = await paymentResponse.json();

    // 4. Redireciona para o checkout oficial do PicPay retornado pela API
    if (paymentResponse.ok && paymentData.paymentUrl) {
      return res.redirect(303, paymentData.paymentUrl);
    } else {
      throw new Error(paymentData.message || 'Erro ao gerar link de pagamento no PicPay');
    }

  } catch (error) {
    return res.status(500).json({ 
      erro: 'Erro ao processar a API do PicPay', 
      detalhes: error.message 
    });
  }
}
