export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '5519998740950').replace(/\D/g, '')

export interface BookingFields {
  name: string
  service: string
  vehicle: string
  date: string
  time: string
}

function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-')
  return `${day}/${month}/${year}`
}

export function buildWhatsAppMessage(fields: BookingFields): string {
  return [
    'Olá! Gostaria de agendar um serviço na Garage 765sp:',
    `Nome: ${fields.name}`,
    `Serviço: ${fields.service}`,
    `Veículo: ${fields.vehicle}`,
    `Data: ${formatDate(fields.date)}`,
    `Horário: ${fields.time}`,
  ].join('\n')
}

export function buildWhatsAppUrl(fields: BookingFields): string {
  const text = encodeURIComponent(buildWhatsAppMessage(fields))
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`
}
