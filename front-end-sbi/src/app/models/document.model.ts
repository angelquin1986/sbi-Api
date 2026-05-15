export class Documento {
  constructor(
    public document_date: any,
    public document_name: string,
    public document_name_user: string,
    public document_size: string,
    public document_id_order: string,
    // public doccument_encode: string,
    public document_status?: string,
    public _id?: string
) {}
}
