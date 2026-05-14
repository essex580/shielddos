// Comprehensive mapping of ISO 3166-1 alpha-2 country codes to capital/major city coordinates.
// Used for accurate visualization of attack origins on the 3D WebGL Globe.

export const CountryCoordinates: Record<string, { lat: number; lng: number }> = {
    // Europe
    'RO': { lat: 44.4268, lng: 26.1025 },  // Bucharest
    'GB': { lat: 51.5074, lng: -0.1278 },  // London
    'DE': { lat: 52.5200, lng: 13.4050 },  // Berlin
    'FR': { lat: 48.8566, lng: 2.3522 },   // Paris
    'IT': { lat: 41.9028, lng: 12.4964 },  // Rome
    'ES': { lat: 40.4168, lng: -3.7038 },  // Madrid
    'NL': { lat: 52.3676, lng: 4.9041 },   // Amsterdam
    'SE': { lat: 59.3293, lng: 18.0686 },  // Stockholm
    'CH': { lat: 46.9480, lng: 7.4474 },   // Bern
    'PL': { lat: 52.2297, lng: 21.0122 },  // Warsaw
    'UA': { lat: 50.4501, lng: 30.5234 },  // Kyiv
    'NO': { lat: 59.9139, lng: 10.7522 },  // Oslo
    'FI': { lat: 60.1699, lng: 24.9384 },  // Helsinki
    'DK': { lat: 55.6761, lng: 12.5683 },  // Copenhagen
    'AT': { lat: 48.2082, lng: 16.3738 },  // Vienna
    'BE': { lat: 50.8503, lng: 4.3517 },   // Brussels
    'PT': { lat: 38.7223, lng: -9.1393 },  // Lisbon
    'GR': { lat: 37.9838, lng: 23.7275 },  // Athens
    'CZ': { lat: 50.0755, lng: 14.4378 },  // Prague
    'HU': { lat: 47.4979, lng: 19.0402 },  // Budapest
    'BG': { lat: 42.6977, lng: 23.3219 },  // Sofia
    'RS': { lat: 44.7866, lng: 20.4489 },  // Belgrade
    'HR': { lat: 45.8150, lng: 15.9819 },  // Zagreb
    'SK': { lat: 48.1486, lng: 17.1077 },  // Bratislava
    'IE': { lat: 53.3498, lng: -6.2603 },  // Dublin
    'LT': { lat: 54.6872, lng: 25.2797 },  // Vilnius
    'LV': { lat: 56.9496, lng: 24.1052 },  // Riga
    'EE': { lat: 59.4370, lng: 24.7536 },  // Tallinn
    'MD': { lat: 47.0105, lng: 28.8638 },  // Chisinau

    // North America
    'US': { lat: 38.9072, lng: -77.0369 },  // Washington DC
    'CA': { lat: 45.4215, lng: -75.6972 },  // Ottawa
    'MX': { lat: 19.4326, lng: -99.1332 },  // Mexico City

    // Asia
    'CN': { lat: 39.9042, lng: 116.4074 },  // Beijing
    'JP': { lat: 35.6762, lng: 139.6503 },  // Tokyo
    'KR': { lat: 37.5665, lng: 126.9780 },  // Seoul
    'IN': { lat: 28.6139, lng: 77.2090 },   // New Delhi
    'SG': { lat: 1.3521, lng: 103.8198 },   // Singapore
    'HK': { lat: 22.3193, lng: 114.1694 },  // Hong Kong
    'TW': { lat: 25.0330, lng: 121.5654 },  // Taipei
    'VN': { lat: 21.0285, lng: 105.8542 },  // Hanoi
    'TH': { lat: 13.7563, lng: 100.5018 },  // Bangkok
    'MY': { lat: 3.1390, lng: 101.6869 },   // Kuala Lumpur
    'ID': { lat: -6.2088, lng: 106.8456 },  // Jakarta
    'PH': { lat: 14.5995, lng: 120.9842 },  // Manila
    'PK': { lat: 33.6844, lng: 73.0479 },   // Islamabad
    'BD': { lat: 23.8103, lng: 90.4125 },   // Dhaka
    'KZ': { lat: 51.1694, lng: 71.4491 },   // Astana
    'UZ': { lat: 41.2995, lng: 69.2401 },   // Tashkent

    // Middle East
    'TR': { lat: 39.9334, lng: 32.8597 },   // Ankara
    'IR': { lat: 35.6892, lng: 51.3890 },   // Tehran
    'SA': { lat: 24.7136, lng: 46.6753 },   // Riyadh
    'AE': { lat: 25.2048, lng: 55.2708 },   // Dubai
    'IL': { lat: 31.7683, lng: 35.2137 },   // Jerusalem
    'IQ': { lat: 33.3152, lng: 44.3661 },   // Baghdad
    'QA': { lat: 25.2854, lng: 51.5310 },   // Doha

    // Africa
    'ZA': { lat: -25.7461, lng: 28.1881 },  // Pretoria
    'NG': { lat: 9.0579, lng: 7.4951 },     // Abuja
    'EG': { lat: 30.0444, lng: 31.2357 },   // Cairo
    'KE': { lat: -1.2921, lng: 36.8219 },   // Nairobi
    'MA': { lat: 33.9716, lng: -6.8498 },   // Rabat
    'GH': { lat: 5.6037, lng: -0.1870 },    // Accra
    'TN': { lat: 36.8065, lng: 10.1815 },   // Tunis
    'AF': { lat: 34.5553, lng: 69.2075 },   // Kabul

    // South America
    'BR': { lat: -15.7975, lng: -47.8919 }, // Brasilia
    'AR': { lat: -34.6037, lng: -58.3816 }, // Buenos Aires
    'CL': { lat: -33.4489, lng: -70.6693 }, // Santiago
    'CO': { lat: 4.7110, lng: -74.0721 },   // Bogota
    'PE': { lat: -12.0464, lng: -77.0428 }, // Lima
    'VE': { lat: 10.4806, lng: -66.9036 },  // Caracas
    'EC': { lat: -0.1807, lng: -78.4678 },  // Quito
    'UY': { lat: -34.9011, lng: -56.1645 }, // Montevideo

    // Oceania
    'AU': { lat: -33.8688, lng: 151.2093 }, // Sydney
    'NZ': { lat: -41.2866, lng: 174.7756 }, // Wellington

    // Russia & CIS
    'RU': { lat: 55.7558, lng: 37.6173 },   // Moscow
    'BY': { lat: 53.9045, lng: 27.5615 },   // Minsk
    'GE': { lat: 41.7151, lng: 44.8271 },   // Tbilisi
    'AM': { lat: 40.1792, lng: 44.4991 },   // Yerevan
    'AZ': { lat: 40.4093, lng: 49.8671 },   // Baku
};

export function getGeoCoordinates(countryCode: string): { lat: number; lng: number } {
    if (!countryCode) return { lat: 0, lng: 0 };
    return CountryCoordinates[countryCode.toUpperCase()] || { lat: 0, lng: 0 };
}
