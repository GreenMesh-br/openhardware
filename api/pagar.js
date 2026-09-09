
export default async function handler(req, res) {
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: 'Valor de doação inválido.' });
  }

  try {
    // Requisição segura puxando o token diretamente das variáveis de ambiente da Vercel
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
          lastName: "GreenMesh",
          document: "000.000.000-00",
          email: "apoio@greenmesh.com.br"
        }
      })
    });

    const dados = await respostaPicPay.json();

    if (respostaPicPay.ok && dados.paymentUrl) {
      return res.redirect(303, dados.paymentUrl);
    } else {
      throw new Error(dados.message || 'Erro ao gerar checkout no PicPay');
    }

  } catch (error) {
    return res.status(500).json({ 
      erro: 'Erro ao processar o pagamento com o PicPay', 
      detalhes: error.message 
    });
  }
}
