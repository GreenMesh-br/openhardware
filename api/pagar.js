export default async function handler(req, res) {
  // Pega o valor enviado pelo pagamento.html (ex: ?valor=10.00)
  const { valor } = req.query;
  const valorNumerico = parseFloat(valor);

  if (isNaN(valorNumerico) || valorNumerico <= 0) {
    return res.status(400).json({ erro: 'Valor de doação inválido.' });
  }

  try {
    // Redireciona o usuário para o site principal ativando a cartinha mágica de sucesso
    const urlSucesso = `https://greenmesh-br.github.io/openhardware/?status=sucesso`;
    
    return res.redirect(303, urlSucesso);

  } catch (error) {
    return res.status(500).json({ 
      erro: 'Erro ao processar o pagamento', 
      detalhes: error.message 
    });
  }
}
