export default async function handler(req, res) {
  try {
    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        ok: false,
        erro: 'Variáveis PICPAY_CLIENT_ID ou PICPAY_CLIENT_SECRET não configuradas.'
      });
    }

    const response = await fetch(
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

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        erro: 'PicPay recusou a autenticação OAuth.',
        status: response.status,
        detalhes: data
      });
    }

    return res.status(200).json({
      ok: true,
      mensagem: 'Autenticação OAuth do PicPay funcionando.',
      token_type: data.token_type,
      expires_in: data.expires_in
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      erro: 'Erro ao conectar ao PicPay.',
      detalhes: error.message
    });
  }
}
