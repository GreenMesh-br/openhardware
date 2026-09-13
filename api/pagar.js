export default async function handler(req, res) {
  try {
    const { valor } = req.query;
    const valorNumerico = Number(valor);

    if (!Number.isFinite(valorNumerico) || valorNumerico <= 0) {
      return res.status(400).json({
        ok: false,
        etapa: "valor",
        erro: "Informe um valor válido."
      });
    }

    const clientId = process.env.PICPAY_CLIENT_ID;
    const clientSecret = process.env.PICPAY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return res.status(500).json({
        ok: false,
        etapa: "config",
        erro: "Credenciais do PicPay não encontradas."
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
      return res.status(502).json({
        ok: false,
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
        ok: false,
        etapa: "oauth",
        erro: "Resposta do OAuth não é JSON.",
        resposta: tokenText.substring(0, 1000)
      });
    }

    if (!tokenData.access_token) {
      return res.status(502).json({
        ok: false,
        etapa: "oauth",
        erro: "Access token não encontrado."
      });
    }

    // 2. Criar Payment Link
    const valorCentavos = Math.round(valorNumerico * 100);

    const orderNumber = `GM-${Date.now()}`;

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
            name: "Apoio ao projeto GreenMesh",
            description: "Apoio ao lote piloto do projeto GreenMesh",
            order_number: orderNumber,
            redirect_url:
              "https://greenmesh-br.github.io/openhardware/?status=sucesso",
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
              product: valorCentavos,
              delivery: 0
            }
          },
          options: {
            allow_create_pix_key: true,
            card_max_installment_number: 3
          }
        })
      }
    );

    const paymentText = await paymentResponse.text();

    return res.status(200).json({
      ok: paymentResponse.ok,
      etapa: "paymentlink",
      status: paymentResponse.status,
      contentType: paymentResponse.headers.get("content-type"),
      resposta: paymentText.substring(0, 5000)
    });

  } catch (error) {
    return res.status(500).json({
      ok: false,
      etapa: "runtime",
      nome: error.name,
      erro: error.message
    });
  }
}
