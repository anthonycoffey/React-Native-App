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
  error_message?: string;
}

const GEOCODING_API_KEY = process.env.EXPO_PUBLIC_GEOCODING_API_KEY;

const geocodeAddress = async (address: string): Promise<any> => {
  try {
    const href = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${GEOCODING_API_KEY}`;

    const response = await fetch(href);
    if (!response.ok) {
      let errorBody = `Google Geocoding API request failed with status ${response.status}`;
      try {
        const body = await response.json();
        errorBody = body?.error_message || body?.status || errorBody;
      } catch (e) {}
      throw new Error(errorBody);
    }

    const data = (await response.json()) as GeocodeResponse;
    const { status, results } = data;

    if (status === 'OK' && results && results.length > 0) {
      const { geometry, place_id, formatted_address } = results[0];
      const { location, location_type } = geometry;
      return { ...location, place_id, location_type, formatted_address };
    } else {
      throw new Error(
        `Geocoding failed with status: ${status}. ${data.error_message || 'No additional error message provided.'}`.trim()
      );
    }
  } catch (error: any) {
    console.log('Geocoding error:', error.message);
    throw new Error(
      error.message || 'Geocoding failed due to an unexpected error.'
    );
  }
};

export default geocodeAddress;
