export default async function handler(req, res) {
  const { valor } = req.query;
  const valorNumerico = Number(valor);

  if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({
      ok: false,
      erro: 'Valor inválido.'
    });
  }

  try {
    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        ok: false,
        erro: 'Credenciais do PicPay não configuradas na Vercel.'
      });
    }

    // 1. Obtém o token OAuth
    const tokenResponse = await fetch(
      'https://ecommerce-api.svc.picpay.com/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret
        })
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      return res.status(502).json({
        ok: false,
        etapa: 'oauth',
        erro: 'Não foi possível obter o token OAuth.',
        status: tokenResponse.status,
        detalhes: tokenData
      });
    }

    // 2. Identificador único da cobrança
    const reference = `greenmesh-${Date.now()}`;

    // 3. Cria o Payment Link
    const paymentResponse = await fetch(
      'https://ecommerce-api.svc.picpay.com/paymentlink/create',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          referenceId: reference,
          value: Number(valorNumerico.toFixed(2)),
          description: 'Apoio ao projeto GreenMesh',
          returnUrl: 'https://greenmesh-br.github.io/openhardware/?status=sucesso'
        })
      }
    );

    const paymentData = await paymentResponse.json();

    return res.status(paymentResponse.status).json({
      ok: paymentResponse.ok,
      etapa: 'paymentlink',
      status: paymentResponse.status,
      resposta: paymentData
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      etapa: 'servidor',
      erro: error.message
    });
  }
}
