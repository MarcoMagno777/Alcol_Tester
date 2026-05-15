export interface AlcolCatalogItem {
  id: number;
  nome: string;
  quantita: number;
  gradazione: number;
}

export interface AccountAlcolEntry {
  id: number;
  alcol_id: number;
  data_consumo: string;
  consumato_il: string;
  nome: string;
  quantita: number;
  gradazione: number;
}

export interface AlcolAddRequest {
  account_id: number;
  alcol_id: number;
  data_consumo?: string;
  consumato_il?: string;
}
