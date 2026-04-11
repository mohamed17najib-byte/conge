export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    const ip = req.headers['x-forwarded-for']?.split(',')[0].trim() 
      || req.socket?.remoteAddress 
      || '';

    const response = await fetch(`https://freeipapi.com/api/json/${ip}`);
    if (!response.ok) throw new Error(`freeipapi error: ${response.status}`);
    const data = await response.json();

    if (!data.countryCode || data.countryCode === '-') throw new Error('Invalid country');

    res.json({
      country_code: data.countryCode,
      country_name: data.countryName,
    });
  } catch {
    // Fallback to MA if geo detection fails
    res.json({
      country_code: 'MA',
      country_name: 'Maroc',
    });
  }
}