export interface Address {
  name: string; // home/work or any other
  street: string; // Collins Square, Level 31, Tower 5/727 Collins St
  suburb: string; // Docklands
  postcode: string; // 3008
  state: string; // VIC
  country: string; // Australia
}

export function validateAddress(body: string): Address {
  const parsed = JSON.parse(body) as Address;
  // ignore anything else explicitly
  return {
    name: parsed.name,
    street: parsed.street,
    suburb: parsed.suburb,
    postcode: parsed.postcode,
    state: parsed.state,
    country: parsed.country,
  };
}