export type GoogleAddressComponent = {
  long_name: string;
  short_name: string;
  types: string[];
};

export type Acc45AddressFields = {
  name: string;
  address: string;
  city: string;
  postal: string;
  country: 'New Zealand';
};

function findComponent(
  components: GoogleAddressComponent[],
  type: string,
): GoogleAddressComponent | undefined {
  return components.find(c => c.types.includes(type));
}

function componentValue(
  components: GoogleAddressComponent[],
  type: string,
  preferShort = false,
): string {
  const c = findComponent(components, type);
  if (!c) {
 return '';
}
  return preferShort ? c.short_name : c.long_name;
}

export function formatNzAddressForAcc45(
  name: string,
  components: GoogleAddressComponent[],
  formattedAddress?: string,
): Acc45AddressFields {
  const unit = componentValue(components, 'subpremise');
  const streetNumber = componentValue(components, 'street_number');
  const route = componentValue(components, 'route');

  const addressLineParts: string[] = [];
  if (unit) {
 addressLineParts.push(`Unit ${unit}`);
}
  const street = [streetNumber, route].filter(Boolean).join(' ');
  if (street) {
 addressLineParts.push(street);
}
  let addressLine = addressLineParts.join(', ');

  let city
    = componentValue(components, 'locality')
      || componentValue(components, 'sublocality_level_1')
      || componentValue(components, 'administrative_area_level_2')
      || '';

  let postal = componentValue(components, 'postal_code');

  // Fallback parsing if address components are sparse
  if ((!addressLine || !city || !postal) && formattedAddress) {
    const parts = formattedAddress.split(',').map(p => p.trim());
    // Typical NZ formatted: "123 Street, Suburb, City 1234, New Zealand"
    const first = parts[0] ?? '';
    if (!addressLine && first) {
 addressLine = first;
}
    if ((!city || !postal) && parts.length >= 2) {
      // Attempt to extract postal from the second-last segment
      const maybeCityPostal = parts[parts.length - 2] ?? '';
      const match = maybeCityPostal.match(/^(.*)\s(\d{4})$/);
      if (match) {
        const cityGroup = match[1] ?? '';
        if (!city && cityGroup) {
 city = cityGroup.trim();
}
        if (!postal) {
          const codeGroup = match[2] ?? '';
          const code = codeGroup.trim();
          if (/^\d{4}$/.test(code)) {
            // basic NZ postal code pattern
            postal = code;
          }
        }
      }
    }
  }

  return {
    name,
    address: addressLine || '',
    city: city || '',
    postal: postal || '',
    country: 'New Zealand',
  };
}
