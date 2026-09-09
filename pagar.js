export default async function handler(req, res) {
  // Pega o valor enviado pelo pagamento.html (ex: ?valor=10.00)
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor);

  // Valida se o valor é válido (mínimo R$ 0,01)
  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: 'Valor de doação inválido.' });
  }

  try {
    /* 
      SE VOCÊ FOR USAR A API OFICIAL DO PICPAY BUSINESS:
      Descomente o bloco abaixo e configure sua chave 'PICPAY_TOKEN' nas variáveis de ambiente da Vercel.
    */
    /*
    const respostaPicPay = await fetch('https://appws.picpay.com/ecommerce/public/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-picpay-token': process.env.PICPAY_TOKEN
      },
      body: JSON.stringify({
        referenceId: "greenmesh-" + Date.now(),
        callbackUrl: "https://greenmesh-br.github.io/openhardware/", 
        returnUrl: "https://greenmesh-br.github.io/openhardware/?status=sucesso",
        value: valorNumerico,
        buyer: {
          firstName: "Apoiador",
          lastName: "Anônimo",
          document: "000.000.000-00",
          email: "apoio@greenmesh.com.br"
        }
      })
    });

    const dados = await respostaPicPay.json();
    if (respostaPicPay.ok && dados.paymentUrl) {
      return res.redirect(303, dados.paymentUrl);
    }
    throw new Error(dados.message || 'Erro ao comunicar com o PicPay');
    */

    // --- MODO DE TESTE / FLUXO COMPLETO DA CARTINHA ---
    // Enquanto você não ativa a API oficial do PicPay, 
    // este comando redireciona o usuário para o seu site ativando a cartinha mágica de sucesso:
    return res.redirect(303, `https://greenmesh-br.github.io/openhardware/?status=sucesso`);

  } catch (error) {
    return res.status(500).json({ 
      erro: 'Erro ao gerar o pagamento', 
      detalhes: error.message 
    });
  }
}
