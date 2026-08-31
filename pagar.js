export default async function handler(req, res) {
  // Pega o valor enviado pelo formulário do site (ex: ?valor=50)
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor) || 25.00; // Valor padrão se não passar nada

  try {
    // 💡 Substitua abaixo pela sua lógica ou integração direta com a API do PicPay
    // Se você estiver usando o PicPay Business / E-commerce API:
    /*
    const response = await fetch('https://app.picpay.com/ecommerce/public/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-picpay-token': process.env.PICPAY_TOKEN // Sua chave salva nas variáveis de ambiente da Vercel
      },
      body: JSON.stringify({
        referenceId: "greenmesh-" + Date.now(),
        callbackUrl: "https://seusite.vercel.app/", // URL do seu site
        returnUrl: "https://seusite.vercel.app/?status=sucesso",
        value: valorNumerico,
        buyer: { ... }
      })
    });
    const data = await response.json();
    return res.redirect(303, data.paymentUrl); // Redireciona para o PicPay
    */

    // --- EXEMPLO PRÁTICO PARA TESTES/LINK DIRETO ---
    // Se preferir usar um link direto de pagamento do PicPay (ex: seu perfil público ou QR Code fixo ajustado)
    // Ou redirecionar para uma página intermediária de sucesso simulada:
    
    // Redirecionamento simulado para testes (ou link direto do seu PicPay):
    const urlPicPayGenerica = `https://picpay.me/seuusuario/${valorNumerico}`;
    
    // Para fins do fluxo real, redirecionamos o usuário:
    return res.redirect(303, urlPicPayGenerica);

  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao gerar pagamento', detalhes: error.message });
  }
}
