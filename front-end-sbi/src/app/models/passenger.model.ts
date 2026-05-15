export class Passenger {
  constructor(
    public pax_title: string,
    public pax_first_name: string,
    public pax_last_name: string,
    public pax_nationality: string,
    public pax_date_month: string,
    public pax_date_day: string,
    public pax_date_year: string,
    public pax_passport: string,
    public pax_passport_exp_month: string,
    public pax_passport_exp_day: string,
    public pax_passport_exp_year: string,
    public pax_emergency_contact: string,
    public pax_marital_status: string,
    public pax_arrival_date: Date,
    public pax_arrival_flight: string,
    public pax_departure_date: Date,
    public pax_departure_flight: string,
    public pax_insurance_company: string,
    public pax_insurance_number: string,
    public pax_contact_hotel: string,
    public pax_restrictions: string,
    public pax_type_acomm: string,
    public pax_us_shoe_size: string,
    public pax_id_order: string,
    public data_encrypt: boolean,
    public key_encrypt: string,
  public _id?: string

) {}
}
