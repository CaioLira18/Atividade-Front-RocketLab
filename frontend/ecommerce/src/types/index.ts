export interface Produto {
  id_produto: string
  nome_produto: string
  categoria_produto: string
  peso_produto_gramas?: number
  comprimento_centimetros?: number
  altura_centimetros?: number
  largura_centimetros?: number
  link_imagem?: string
}

export interface ProdutoUpdate {
  nome_produto?: string
  categoria_produto?: string
  peso_produto_gramas?: number
  comprimento_centimetros?: number
  altura_centimetros?: number
  largura_centimetros?: number
}

export interface Avaliacao {
  id_avaliacao: string
  id_pedido: string
  avaliacao: number
  titulo_comentario?: string
  comentario?: string
  data_comentario?: string
  data_resposta?: string
}

export interface ItemPedido {
  id_pedido: string
  id_item: number
  id_produto: string
  id_vendedor: string
  preco_BRL: number
  preco_frete: number
}