import { FaWhatsapp } from "react-icons/fa";

const phone = "5547999253962";
const message = "Olá, Agnaldo! Vim pelo seu portfólio e gostaria de conversar.";

const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

export default function WhatsAppButton() {
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar com Agnaldo pelo WhatsApp (abre em nova aba)"
      title="Conversar pelo WhatsApp"
      className="whatsapp-color fixed z-50 inline-flex size-14 items-center justify-center rounded-full bg-[#075E54] text-white shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
      style={{
        right: "calc(1rem + env(safe-area-inset-right, 0px))",
        bottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <FaWhatsapp className="size-8" aria-hidden="true" />
    </a>
  );
}
