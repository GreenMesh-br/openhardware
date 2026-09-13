body: JSON.stringify({
  charge: {
    name: 'Apoio ao projeto GreenMesh',
    description: 'Apoio ao lote piloto do projeto GreenMesh',
    order_number: orderNumber,
    redirect_url: 'https://greenmesh-br.github.io/openhardware/?status=sucesso',
    payment: {
      methods: [
        'BRCODE',
        'CREDIT_CARD'
      ],
      brcode_arrangements: [
        'PICPAY',
        'PIX'
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
