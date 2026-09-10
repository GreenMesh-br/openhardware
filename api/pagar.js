export default async function handler(req, res) {
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: 'Valor de doação inválido.' });
  }

  try {
    // Tenta capturar as credenciais considerando qualquer variação de nome na Vercel
    const clientId = process.env.PICPAY_CLIENT_ID || process.env.ID_DO_CLIENTE_PICP;
    const sellerToken = process.env.PICPAY_SELLER_TOKEN || process.env.X_SELLER_TOKEN;

    if (!clientId || !sellerToken) {
      return res.status(500).json({
        erro: 'Credenciais ausentes na Vercel',
        detalhes: {
          temClientId: !!clientId,
          temSellerToken: !!sellerToken
        }
      });
    }

    const paymentResponse = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-picpay-id': clientId,
        'x-seller-token': sellerToken,
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
        erro: 'Erro retornado pela API do PicPay',
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
