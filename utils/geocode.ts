import axios from 'axios';

interface GeocodeResponse {
    status: string;
    results: {
        geometry: {
            location: {
                lat: number;
                lng: number;
            };
            location_type: string;
        };
        place_id: string;
        formatted_address: string;
    }[];
}

const GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;

const geocodeAddress = async (address: string): Promise<any> => {
    try {
        const href = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
        )}&key=${GEOCODING_API_KEY}`;
        const response = await axios.get<GeocodeResponse>(href);
        const { status, results } = response.data;

        if (status === 'OK') {
            const { geometry, place_id, formatted_address } = results[0];
            const { location, location_type } = geometry;
            return { ...location, place_id, location_type, formatted_address };
        }
    } catch {
        throw new Error('Geocoding failed');
    }
};

export default geocodeAddress;