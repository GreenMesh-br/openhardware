export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      ok: false,
      erro: "Método não permitido"
    });
  }

  try {
    const valor = Number(req.query.valor);

    if (!Number.isFinite(valor) || valor <= 0) {
      return res.status(400).json({
        ok: false,
        erro: "Valor inválido"
      });
    }

    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        ok: false,
        erro: "Credenciais PicPay não configuradas no Vercel"
      });
    }

    // 1. OAuth
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
      console.error("PicPay OAuth:", tokenResponse.status, tokenText);

      return res.status(502).json({
        ok: false,
        etapa: "oauth",
        erro: "Falha na autenticação com o PicPay"
      });
    }

    const tokenData = JSON.parse(tokenText);

    if (!tokenData.access_token) {
      return res.status(502).json({
        ok: false,
        etapa: "oauth",
        erro: "PicPay não retornou access_token"
      });
    }

    // 2. Criar Payment Link
    const reference = `greenmesh-${Date.now()}`;

    const paymentResponse = await fetch(
      "https://ecommerce-api.svc.picpay.com/v1/paymentlink/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${tokenData.access_token}`
        },
        body: JSON.stringify({
          charge: {
            name: "Apoio ao GreenMesh",
            description: "Contribuição para o projeto GreenMesh",
            order_number: reference,
            redirect_url: "https://openhardware.vercel.app/",
            payment: {
              methods: [
                "BRCODE",
                "CREDIT_CARD"
              ],
              brcode_arrangements: [
                "PICPAY",
                "PIX"
              ]
            },
            amounts: {
              product: Math.round(valor * 100)
            }
          },
          options: {
            allow_create_pix_key: true
          }
        })
      }
    );

    const paymentText = await paymentResponse.text();

    if (!paymentResponse.ok) {
      console.error(
        "PicPay Payment Link:",
        paymentResponse.status,
        paymentText
      );

      return res.status(502).json({
        ok: false,
        etapa: "paymentlink",
        statusPicPay: paymentResponse.status,
        erro: "O PicPay recusou ou bloqueou a criação do Payment Link"
      });
    }

    const paymentData = JSON.parse(paymentText);

    // O nome exato do campo de URL depende da resposta da API.
    const checkoutUrl =
      paymentData.url ||
      paymentData.payment_url ||
      paymentData.redirect_url ||
      paymentData.charge?.url;

    if (!checkoutUrl) {
      console.error("Resposta inesperada do PicPay:", paymentData);

      return res.status(502).json({
        ok: false,
        etapa: "paymentlink",
        erro: "PicPay criou a cobrança, mas não retornou URL de checkout"
      });
    }

    return res.redirect(302, checkoutUrl);

  } catch (error) {
    console.error("Erro /api/pagar:", error);

    return res.status(500).json({
      ok: false,
      erro: "Erro interno ao criar pagamento"
    });
  }
}
