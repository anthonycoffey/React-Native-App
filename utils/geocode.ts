interface GeocodeResponse {
    status: string; // e.g., "OK", "ZERO_RESULTS", "REQUEST_DENIED"
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
    error_message?: string; // Optional: Google includes this on error
}

const GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;

const geocodeAddress = async (address: string): Promise<any> => {
    try {
        const href = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
            address
        )}&key=${GEOCODING_API_KEY}`;
        
        const response = await fetch(href);
        if (!response.ok) {
            // Attempt to get more info from response if possible, then throw
            let errorBody = `Google Geocoding API request failed with status ${response.status}`;
            try {
                const body = await response.json(); // Google API usually returns JSON errors
                errorBody = body?.error_message || body?.status || errorBody;
            } catch (e) {
                // Ignore if error body parsing fails
            }
            throw new Error(errorBody);
        }

        const data = await response.json() as GeocodeResponse;
        const { status, results } = data;

        if (status === 'OK' && results && results.length > 0) {
            const { geometry, place_id, formatted_address } = results[0];
            const { location, location_type } = geometry;
            return { ...location, place_id, location_type, formatted_address };
        } else {
            // Handle cases like 'ZERO_RESULTS' or other non-'OK' statuses from Google
            // Access error_message from the parsed data object
            throw new Error(`Geocoding failed with status: ${status}. ${data.error_message || 'No additional error message provided.'}`.trim());
        }
    } catch (error: any) {
        // Re-throw or wrap the error
        console.error('Geocoding error:', error.message);
        throw new Error(error.message || 'Geocoding failed due to an unexpected error.');
    }
};

export default geocodeAddress;
