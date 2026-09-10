export default async function handler(req, res) {
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: 'Valor de doação inválido.' });
  }

  try {
    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do PicPay não configuradas nas variáveis de ambiente da Vercel.');
    }

    // 1. Solicita o token de acesso OAuth 2.0 oficial do PicPay
    const tokenResponse = await fetch('https://api.picpay.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(500).json({
        erro: 'Falha na autenticação OAuth com o PicPay',
        detalhes: tokenData
      });
    }

    const accessToken = tokenData.access_token;

    // 2. Cria a cobrança utilizando o token Bearer obtido
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

    // 3. Redireciona para o checkout oficial gerado pelo PicPay
    if (paymentResponse.ok && paymentData.paymentUrl) {
      return res.redirect(303, paymentData.paymentUrl);
    } else {
      return res.status(500).json({
        erro: 'Erro ao gerar link de pagamento no PicPay',
        detalhes: paymentData
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      erro: 'Erro interno ao processar a API', 
      detalhes: error.message 
    });
  }
}
