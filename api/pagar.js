export default async function handler(req, res) {
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: 'Valor de doação inválido.' });
  }

  try {
    // Utilizando o Client ID da sua integração e o token clássico gerado no painel
    const clientId = "c744e5e6-efa8-4fe0-8c38-eb89152bd314";
    const sellerToken = "e1046939-510d-415c-a4a0-3d72ab68ede6";

    const paymentResponse = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-picpay-id': clientId,
        'x-picpay-token': sellerToken,
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
