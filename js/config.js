/**
 * Centralized Configuration for Shayaan Mechanic / Atelier Bespoke Moto
 * Easily customize workshop details, contact information, and demo settings.
 */
window.ATELIER_CONFIG = {
  // Workshop Branding
  workshopName: "SHAYAAN MECHANIC",
  workshopFullTitle: "SHAYAAN MOTOR MECHANIC & BESPOKE ATELIER",
  tagline: "BESPOKE ROYAL ENFIELD ATELIER",
  locationShort: "NALLASOPARA, MAHARASHTRA",
  locationFull: "Nallasopara, Palghar District, Maharashtra, India",
  coordinates: "19.4182° N, 72.8024° E",
  mapDirectionsUrl: "https://maps.google.com/?q=Nallasopara+Maharashtra+India",

  // Communication & Dispatch
  phoneDisplay: "+91 98200 12345",
  phoneNumberRaw: "+919820012345",
  whatsappNumber: "919820012345",
  defaultWhatsAppMessage: "Hello Shayaan Mechanic! I am interested in discussing a custom Royal Enfield build.",
  instagramHandle: "@shayaan_moto_atelier",
  instagramUrl: "https://instagram.com/",
  email: "commissions@shayaanmechanic.demo",

  // Operational Specs
  operatingHours: "Mon – Sat: 10:00 AM – 8:30 PM (Sunday by Appointment)",
  turnaroundEstimate: "4 – 8 Weeks (Scope Dependent)",
  serviceRadius: "Mumbai, Thane, Palghar & MMR Region",
  platforms: "Royal Enfield Classic 350/500, Hunter 350, Bullet 350/500, Continental GT 650, Interceptor 650",

  // Demo Notification
  isDemo: true,
  demoDisclaimer: "This website is an interactive demonstration showcase for Shayaan Mechanic. Contact enquiries generate prefilled WhatsApp messages for direct communication."
};

/**
 * Generates a prefilled WhatsApp chat link
 * @param {string} customText - Optional custom message
 * @returns {string} - WhatsApp API URL
 */
window.getWhatsAppLink = function(customText) {
  const config = window.ATELIER_CONFIG;
  const text = encodeURIComponent(customText || config.defaultWhatsAppMessage);
  return `https://wa.me/${config.whatsappNumber}?text=${text}`;
};
