export default async function handler(req, res) {
  try {
    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        etapa: "config",
        erro: "Variáveis do PicPay não encontradas"
      });
    }

    const tokenResponse = await fetch(
      "https://ecommerce-api.svc.picpay.com/oauth2/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret
        })
      }
    );

    const tokenText = await tokenResponse.text();

    if (!tokenResponse.ok) {
      return res.status(502).json({
        etapa: "oauth",
        status: tokenResponse.status,
        resposta: tokenText.substring(0, 1000)
      });
    }

    let tokenData;

    try {
      tokenData = JSON.parse(tokenText);
    } catch {
      return res.status(502).json({
        etapa: "oauth",
        erro: "PicPay não retornou JSON",
        resposta: tokenText.substring(0, 1000)
      });
    }

    if (!tokenData.access_token) {
      return res.status(502).json({
        etapa: "oauth",
        erro: "Access token não encontrado",
        resposta: tokenData
      });
    }

    return res.status(200).json({
      ok: true,
      etapa: "oauth",
      mensagem: "OAuth funcionando",
      token_type: tokenData.token_type,
      expires_in: tokenData.expires_in
    });

  } catch (error) {
    return res.status(500).json({
      etapa: "runtime",
      erro: error.message,
      nome: error.name
    });
  }
}
