export default async function handler(req, res) {
  try {
    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        ok: false,
        erro: 'Credenciais não configuradas.'
      });
    }

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
        status: tokenResponse.status,
        detalhes: tokenData
      });
    }

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
          referenceId: `greenmesh-${Date.now()}`,
          value: 1.00,
          description: 'Apoio ao projeto GreenMesh'
        })
      }
    );

    const contentType = paymentResponse.headers.get('content-type');
    const rawResponse = await paymentResponse.text();

    return res.status(200).json({
      ok: paymentResponse.ok,
      etapa: 'paymentlink',
      status: paymentResponse.status,
      contentType,
      resposta_inicio: rawResponse.substring(0, 1000)
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      etapa: 'servidor',
      erro: error.message
    });
  }
}
