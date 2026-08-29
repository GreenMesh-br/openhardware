<!-- Seção de Meta de Arrecadação Automática -->
<div style="background: var(--panel); padding: 25px; border-radius: 12px; margin: 30px auto; max-width: 600px; text-align: center; color: var(--text);">
    <h3>Apoie o Lote Piloto do GreenMesh</h3>
    <p id="progress-text" style="margin: 10px 0; font-size: 1rem; color: var(--text-muted);">Sincronizando doações...</p>
    
    <!-- Barra vazia -->
    <div style="background: var(--bg-soft); border-radius: 8px; overflow: hidden; height: 24px; width: 100%; border: 1px solid rgba(255,255,255,0.1);">
        <!-- Preenchimento dinâmico -->
        <div id="progress-bar" style="background: #00c853; width: 0%; height: 100%; transition: width 0.6s ease;"></div>
    </div>
</div>

<script>
  // Meta total do lote piloto (ex: R$ 3.000,00)
  const metaTotal = 3000.00;

  async function carregarArrecadacao() {
    try {
      // Pega o valor direto da nossa função segura da Vercel
      const resposta = await fetch('/api/arrecadacao');
      const dados = await resposta.json();
      const valorArrecadado = dados.total || 0;

      let porcentagem = (valorArrecadado / metaTotal) * 100;
      if (porcentagem > 100) porcentagem = 100;

      document.getElementById('progress-bar').style.width = porcentagem + '%';
      document.getElementById('progress-text').innerHTML = 
        `Arrecadado: <strong>R$ ${valorArrecadado.toFixed(2)}</strong> de R$ ${metaTotal.toFixed(2)} (${porcentagem.toFixed(1)}%)`;
    } catch (e) {
      document.getElementById('progress-text').innerText = "Erro ao carregar dados de doação.";
    }
  }

  // Executa assim que a página abre
  carregarArrecadacao();
</script>
