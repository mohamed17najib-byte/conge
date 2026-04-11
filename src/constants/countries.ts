// constants/countries.ts
export interface Country {
  code: string;
  name: string;
}

export let countries: Country[] = [];

export async function loadCountries(lang = 'fr'): Promise<Country[]> {
  try {
    // restcountries.com — gratuit, sans clé, 250 pays
    const res = await fetch(
      `https://restcountries.com/v3.1/all?fields=cca2,translations,name`
    );
    const data = await res.json();

    countries = data
      .map((c: any) => ({
        code: c.cca2,
        name:
          lang === 'fr' ? c.translations?.fra?.common :
          lang === 'ar' ? c.translations?.ara?.common :
          c.name?.common ?? c.cca2,
      }))
      .filter((c: Country) => c.code && c.name)
      .sort((a: Country, b: Country) => a.name.localeCompare(b.name));

    return countries;
  } catch {
    return [];
  }
}