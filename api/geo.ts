export default async function handler(req: any, res: any) {
  const response = await fetch("https://ipapi.co/json/");
  const data = await response.json();
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.json(data);
}