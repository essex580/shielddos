// A lightweight mapping of ISO 3166-1 alpha-2 country codes to approximate center coordinates.
// Used for visualizing attack origins on the 3D WebGL Globe without requiring a heavy geojson database.

export const CountryCoordinates: Record<string, { lat: number; lng: number }> = {
    'US': { lat: 37.0902, lng: -95.7129 },
    'CN': { lat: 35.8617, lng: 104.1954 },
    'RU': { lat: 61.5240, lng: 105.3188 },
    'KR': { lat: 35.9078, lng: 127.7669 },
    'GB': { lat: 55.3781, lng: -3.4360 },
    'DE': { lat: 51.1657, lng: 10.4515 },
    'FR': { lat: 46.2276, lng: 2.2137 },
    'JP': { lat: 36.2048, lng: 138.2529 },
    'IN': { lat: 20.5937, lng: 78.9629 },
    'BR': { lat: -14.2350, lng: -51.9253 },
    'CA': { lat: 56.1304, lng: -106.3468 },
    'AU': { lat: -25.2744, lng: 133.7751 },
    'IT': { lat: 41.8719, lng: 12.5674 },
    'ES': { lat: 40.4637, lng: -3.7492 },
    'MX': { lat: 23.6345, lng: -102.5528 },
    'TR': { lat: 38.9637, lng: 35.2433 },
    'IR': { lat: 32.4279, lng: 53.6880 },
    'NL': { lat: 52.1326, lng: 5.2913 },
    'SE': { lat: 60.1282, lng: 18.6435 },
    'CH': { lat: 46.8182, lng: 8.2275 },
    'SG': { lat: 1.3521, lng: 103.8198 },
    'RO': { lat: 45.9432, lng: 24.9668 },
    'PL': { lat: 51.9194, lng: 19.1451 },
    'UA': { lat: 48.3794, lng: 31.1656 },
    'ZA': { lat: -30.5595, lng: 22.9375 },
    'AE': { lat: 23.4241, lng: 53.8478 },
    'HK': { lat: 22.3193, lng: 114.1694 },
    'VN': { lat: 14.0583, lng: 108.2772 },
    'ID': { lat: -0.7893, lng: 113.9213 },
    'TW': { lat: 23.6978, lng: 120.9605 },
    'MY': { lat: 4.2105, lng: 101.9758 },
    'TH': { lat: 15.8700, lng: 100.9925 },
    'PH': { lat: 12.8797, lng: 121.7740 },
    'SA': { lat: 23.8859, lng: 45.0792 },
    'IL': { lat: 31.0461, lng: 34.8516 },
    'AF': { lat: 33.9391, lng: 67.7100 },
    'PK': { lat: 30.3753, lng: 69.3451 },
    'NG': { lat: 9.0820, lng: 8.6753 },
    'EG': { lat: 26.8206, lng: 30.8025 },
    'AR': { lat: -38.4161, lng: -63.6167 },
    'CO': { lat: 4.5709, lng: -74.2973 },
    'PE': { lat: -9.1900, lng: -75.0152 },
    'CL': { lat: -35.6751, lng: -71.5430 },
    'VE': { lat: 7.1193, lng: -66.5897 },
    // If an unknown country is detected, we'll fall back to Null Island [0,0] or similar.
};

export function getGeoCoordinates(countryCode: string) {
    return CountryCoordinates[countryCode.toUpperCase()] || { lat: 0, lng: 0 };
}
