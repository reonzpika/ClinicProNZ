import { describe, expect, it } from 'vitest';

import { formatNzAddressForAcc45, type GoogleAddressComponent } from '@/src/lib/utils/acc45-address';

describe('formatNzAddressForAcc45', () => {
  it('extracts standard NZ components', () => {
    const components: GoogleAddressComponent[] = [
      { long_name: '12', short_name: '12', types: ['street_number'] },
      { long_name: 'Queen Street', short_name: 'Queen St', types: ['route'] },
      { long_name: 'Auckland', short_name: 'AKL', types: ['locality', 'political'] },
      { long_name: '1010', short_name: '1010', types: ['postal_code'] },
      { long_name: 'New Zealand', short_name: 'NZ', types: ['country', 'political'] },
    ];
    const out = formatNzAddressForAcc45('Acme Ltd', components, '12 Queen Street, Auckland 1010, New Zealand');
    expect(out).toEqual({
      name: 'Acme Ltd',
      address: '12 Queen Street',
      city: 'Auckland',
      postal: '1010',
      country: 'New Zealand',
    });
  });

  it('handles unit/subpremise', () => {
    const components: GoogleAddressComponent[] = [
      { long_name: '5', short_name: '5', types: ['subpremise'] },
      { long_name: '3', short_name: '3', types: ['street_number'] },
      { long_name: 'High Street', short_name: 'High St', types: ['route'] },
      { long_name: 'Wellington', short_name: 'WLG', types: ['locality', 'political'] },
      { long_name: '6011', short_name: '6011', types: ['postal_code'] },
    ];
    const out = formatNzAddressForAcc45('Beta Clinic', components);
    expect(out.address.startsWith('Unit 5')).toBe(true);
    expect(out.city).toBe('Wellington');
    expect(out.postal).toBe('6011');
  });
});
