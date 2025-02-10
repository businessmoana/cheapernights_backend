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
    }
}

module.exports = currencies;