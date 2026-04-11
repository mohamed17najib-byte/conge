// api/geo.ts
export default async function handler(req: any, res: any) {
  // Récupère l'IP réelle du visiteur
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.socket?.remoteAddress || '';
  
  const response = await fetch(`https://freeipapi.com/api/json/${ip}`);
  const data = await response.json();
  
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json({
    country_code: data.countryCode,
    country_name: data.countryName,
  });
}