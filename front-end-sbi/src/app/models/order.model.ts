export class Order {
  constructor(
    public contact_person_name: string,
    public contact_person_mail: string,
    public sales_agent_id: string,
    public number_pax: string,
    public date_submited: Date,
    public billing_country: string,
    public billing_phone: string,
    public billing_address: string,
    public billing_city: string,
    public check_conditions: boolean,
    public tm_code: string,
    public state_order: number,
    public tm_date_cruise: Date,
    public _id?: string
  ) {}
}
