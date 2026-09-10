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
      throw new Error('Credenciais do PicPay não configuradas na Vercel.');
    }

    // Codifica as credenciais em Base64 para o padrão Basic Auth
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    // 1. Solicita o token OAuth 2.0 usando Basic Auth no cabeçalho
    const tokenResponse = await fetch('https://ecommerce-api.svcp.picpay.com/oauth2/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: 'grant_type=client_credentials'
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(500).json({
        erro: 'Falha na autenticação OAuth do PicPay com Basic Auth',
        detalhesDoPicPay: tokenData
      });
    }

    const accessToken = tokenData.access_token;

    // 2. Envia a cobrança utilizando o Bearer Token obtido com sucesso
    const paymentResponse = await fetch('https://ecommerce-api.svcp.picpay.com/checkout/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json'
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

    const paymentUrl = paymentData.paymentUrl || paymentData.checkoutUrl || paymentData.url;

    if (paymentResponse.ok && paymentUrl) {
      return res.redirect(303, paymentUrl);
    } else {
      return res.status(500).json({
        erro: 'Erro retornado pela API do PicPay ao criar cobrança',
        detalhes: paymentData
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      erro: 'Erro interno no servidor da Vercel', 
      detalhes: error.message 
    });
  }
}
