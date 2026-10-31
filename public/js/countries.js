/**
 * ISO 3166-1 alpha-2 country codes + helpers for country/phone UI.
 * Kosovo (XK) is user-assigned and excluded from ISO, so add it manually only if the business needs it.
 * Depends on libphonenumber-js (global `libphonenumber`) for dial codes.
 */
(function (global) {
  'use strict';

  /** Officially assigned ISO 3166-1 alpha-2 codes (249). */
  var ISO_CODES = [
    'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ',
    'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS',
    'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN',
    'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE',
    'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF',
    'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM',
    'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM',
    'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC',
    'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK',
    'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA',
    'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG',
    'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW',
    'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS',
    'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO',
    'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI',
    'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW'
  ];

  /**
   * @returns {{ code: string, name: string, dialCode: string, flagClass: string }[]}
   */
  function buildCountries() {
    var locale = (typeof navigator !== 'undefined' && navigator.language) || 'en';
    var displayNames = new Intl.DisplayNames([locale, 'en'], { type: 'region' });
    var phone = global.libphonenumber;
    var getCallingCode = phone && typeof phone.getCountryCallingCode === 'function'
      ? phone.getCountryCallingCode.bind(phone)
      : null;

    var list = [];
    for (var i = 0; i < ISO_CODES.length; i++) {
      var code = ISO_CODES[i];
      var name;
      try {
        name = displayNames.of(code);
      } catch (err) {
        name = null;
      }
      if (!name || name === code) continue;

      var dialDigits = '';
      if (getCallingCode) {
        try {
          dialDigits = String(getCallingCode(code));
        } catch (err) {
          dialDigits = '';
        }
      }

      list.push({
        code: code,
        name: name,
        dialCode: dialDigits ? '+' + dialDigits : '',
        flagClass: 'fi fi-' + code.toLowerCase()
      });
    }

    list.sort(function (a, b) {
      return a.name.localeCompare(b.name, locale, { sensitivity: 'base' });
    });

    // Pin India first only for en-IN browsers; otherwise keep pure alphabetical order.
    if (locale === 'en-IN') {
      var indiaIndex = -1;
      for (var j = 0; j < list.length; j++) {
        if (list[j].code === 'IN') {
          indiaIndex = j;
          break;
        }
      }
      if (indiaIndex > 0) {
        var india = list.splice(indiaIndex, 1)[0];
        list.unshift(india);
      }
    }

    return list;
  }

  global.PullerCountries = {
    ISO_CODES: ISO_CODES,
    buildCountries: buildCountries
  };
})(typeof window !== 'undefined' ? window : this);
