export interface SazietaCatalogItem {
  id: number;
  nome: string;
  descrizione: string;
}

export interface AccountSazietaEntry {
  id: number;
  stato_sazieta_id: number;
  data_consumo: string;
  consumato_il: string;
  nome: string;
  descrizione: string;
}

export interface SazietaAddRequest {
  account_id: number;
  stato_sazieta_id: number;
  data_consumo?: string;
  consumato_il?: string;
}
