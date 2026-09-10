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

    // Chamada direta utilizando as credenciais de Link de Pagamento - API do painel
    const response = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
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

    const data = await response.json();

    if (response.ok && data.paymentUrl) {
      return res.redirect(303, data.paymentUrl);
    } else {
      return res.status(500).json({
        erro: 'Erro retornado pela API do PicPay',
        detalhes: data
      });
    }

  } catch (error) {
    return res.status(500).json({ 
      erro: 'Erro interno ao processar pagamento', 
      detalhes: error.message 
    });
  }
}
