export default async function handler(req, res) {
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: 'Valor de doação inválido.' });
  }

  try {
    // Captura as chaves independentemente do nome cadastrado na Vercel
    const clientId = process.env.PICPAY_CLIENT_ID || process.env.ID_DO_CLIENTE_PICP;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('Credenciais do PicPay não configuradas nas variáveis de ambiente da Vercel.');
    }

    // Comunicação direta com o gateway oficial da Carteira E-commerce do PicPay
    const paymentResponse = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-picpay-id': clientId,
        'x-picpay-token': clientSecret
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

    // Captura a URL de redirecionamento oficial do checkout
    const paymentUrl = paymentData.paymentUrl || paymentData.checkoutUrl || paymentData.url;

    if (paymentResponse.ok && paymentUrl) {
      return res.redirect(303, paymentUrl);
    } else {
      return res.status(500).json({
        erro: 'Erro ao gerar pagamento na Carteira E-commerce do PicPay',
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
