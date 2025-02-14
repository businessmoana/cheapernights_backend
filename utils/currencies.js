const currencies = {
    'airbnb': {
        type: 'currency',
        currencies: [
            'AED', 'AUD', 'BGN', 'BTL', 'CAD', 'CHF', 'CLP', 'CNY',
            'COP', 'CRC', 'CZK', 'DKK', 'EGP', 'EUR', 'GBP', 'GHS', 'HKD', 'HRK', 'HUF', 'IDR', 'ILS', 'INR', 'JPY', 'KES', 'KZT', 'KRW', 'MAD', 'MXN', 'MYR', 'NOK', 'NZD', 'PEN', 'PHP', 'PLN', 'QAR', 'ROn', 'SAR', 'SGD', 'SEK', 'THB', 'TRY', 'TWD', 'UGX', 'UAH', 'USD', 'UYU', 'VND', 'ZAR'
        ]
    },
    'booking': {
        type: 'currency',
        currencies: [
            'ARS', 'AUD', 'AZN', 'BHD', 'BRL', 'BGN', 'CAD', 'CLP', 'CNY', 'COP', 'CZK', 'DKK', 'EGP', 'EUR', 'FJD', 'GEL', 'HKD', 'HUF', 'ISK', 'INR', 'IDR', 'ILS', 'JPY', 'JOD', 'KZT', 'KWD', 'MOP', 'MYR', 'MXN', 'MDL', 'NAD', 'TWD', 'NZD', 'NOK', 'OMR', 'PLN', 'GBP', 'QAR', 'RON', 'RUB', 'SAR', 'SGD', 'ZAR', 'KRW', 'SEK', 'CHF', 'THB', 'TRY', 'USD', 'UAH', 'AED', 'XOF'
        ]
    },
    'vrbo': {
        type: 'country',
        'AU': 'en-au/holiday-rental',
        'BR': 'pt-br/imovel',
        'CA': 'en-ca/cottage-rental',
        'DK': 'da-dk/feriehus',
        'ES': 'es-es',
        'IT': 'it-it/affitto-vacanze',
        'MX': 'es-mx/propiedad',
        'NL': 'nl-nl/vakantiewoning',
        'NZ': 'en-nz/holiday-accommodation',
        'NO': 'no-no/feriebolig',
        'PT': 'pt-pt/arrendamento-ferias',
        'SG': 'en-sg',
        'FI': 'fi-fi/loma-asunto',
        'SE': 'sv-se/semesterhus',
        'GB': 'en-gb',
        'AT': 'de-at/ferienwohnung-ferienhaus',
        'GR': 'el-gr/ενοικιάσεις-εξοχικών-κατοικιών',
        'JP': 'ja-jp',
    },
    'expedia': {
        type: 'country',
        "AR" : {
            "url":"expedia.com.ar",
            "currency":"ARS",
            "addPath":"en",
        },
        "AU" : {
            "url":"expedia.com.au",
            "currency":"AUD",
            "addPath":"",
        },
        "AT" : {
            "url":"expedia.at",
            "currency":"EUR",
            "addPath":"en",
        },
        "BE" : {
            "url":"expedia.be",
            "currency":"EUR",
            "addPath":"en",
        },
        "BR" : {
            "url":"expedia.br",
            "currency":"BRL",
            "addPath":"en",
        },
        "CA" : {
            "url":"expedia.ca",
            "currency":"CAD",
            "addPath":"",
        },
        "CL" : {
            "url":"expedia.com",
            "currency":"CLP",
            "addPath":"",
        },
        "CN" : {
            "url":"expedia.com",
            "currency":"CNY",
            "addPath":"cn",
        },
        "CO" : {
            "url":"expedia.com",
            "currency":"COP",
            "addPath":"es",
        },
        "CR" : {
            "url":"expedia.com",
            "currency":"USD",
            "addPath":"es",
        },
        "DK" : {
            "url":"expedia.dk",
            "currency":"DKK",
            "addPath":"en",
        },
        "EG" : {
            "url":"expedia.com",
            "currency":"EGP",
            "addPath":"",
        },
        "FI" : {
            "url":"expedia.fi",
            "currency":"EUR",
            "addPath":"en",
        },
        "FR" : {
            "url":"expedia.fr",
            "currency":"EUR",
            "addPath":"en",
        },
        "DE" : {
            "url":"expedia.de",
            "currency":"EUR",
            "addPath":"en",
        },
        "HK" : {
            "url":"expedia.com.hk",
            "currency":"HKD",
            "addPath":"en",
        },
        "IN" : {
            "url":"expedia.co.in",
            "currency":"INR",
            "addPath":"",
        },
        "ID" : {
            "url":"expedia.co.id",
            "currency":"IDR",
            "addPath":"en",
        },
        "IE" : {
            "url":"expedia.ie",
            "currency":"EUR",
            "addPath":"",
        },
        "IT" : {
            "url":"expedia.it",
            "currency":"EUR",
            "addPath":"en",
        },
        "JP" : {
            "url":"expedia.co.jp",
            "currency":"JPY",
            "addPath":"en",
        },
        "MY" : {
            "url":"expedia.com.my",
            "currency":"MYR",
            "addPath":"",
        },
        "MX" : {
            "url":"expedia.mx",
            "currency":"MXN",
            "addPath":"en",
        },
        "NL" : {
            "url":"expedia.nl",
            "currency":"EUR",
            "addPath":"en",
        },
        "NZ" : {
            "url":"expedia.co.nz",
            "currency":"NZD",
            "addPath":"",
        },
        "NO" : {
            "url":"expedia.no",
            "currency":"NOK",
            "addPath":"en",
        },
        "PE" : {
            "url":"expedia.com",
            "currency":"PEN",
            "addPath":"es",
        },
        "PH" : {
            "url":"expedia.com.ph",
            "currency":"PHP",
            "addPath":"en",
        },
        "SA" : {
            "url":"expedia.sa",
            "currency":"SAR",
            "addPath":"",
        },
        "SG" : {
            "url":"expedia.com.sg",
            "currency":"SGD ",
            "addPath":"",
        },
        "KR" : {
            "url":"expedia.co.kr",
            "currency":"KRW",
            "addPath":"en",
        },
        "ES" : {
            "url":"expedia.es",
            "currency":"EUR",
            "addPath":"en",
        },
        "SE" : {
            "url":"expedia.se",
            "currency":"SEK",
            "addPath":"en",
        },
        "CH" : {
            "url":"expedia.ch",
            "currency":"CHF",
            "addPath":"en",
        },
        "TW" : {
            "url":"expedia.com.tw",
            "currency":"TWD",
            "addPath":"en",
        },
        "TH" : {
            "url":"expedia.co.th",
            "currency":"THB",
            "addPath":"en",
        },
        "AE" : {
            "url":"expedia.ae",
            "currency":"AED",
            "addPath":"",
        },
        "GB" : {
            "url":"expedia.co.uk",
            "currency":"GBP",
            "addPath":"",
        },
        "US" : {
            "url":"expedia.com",
            "currency":"USD",
            "addPath":"",
        },
        "VN" : {
            "url":"expedia.com.vn",
            "currency":"VND",
            "addPath":"en",
        },
        
    }
}

module.exports = currencies;