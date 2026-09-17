import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN!,
});

export const mpPayment = new Payment(client);
export const mpPreference = new Preference(client);
