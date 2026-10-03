import type { TouristSpot } from '../models/Spot';


export class GooglePlaceService {
    private static DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';

    public static async fetchSpots( searchTerm : string) : Promise<TouristSpot []>{
        if( !searchTerm.trim() || !(window as any).google?.maps.places){
            return []
        }

        const cleanQuery = searchTerm.split(',')[0].trim();
    const dummyElement = document.createElement('div');
    const service = new (window as any).google.maps.places.PlacesService(dummyElement);
    
    const [ establishments, touristicPoints]  = await Promise.all([
        this.executeTextSearch( service, `estabelecimentos em ${cleanQuery}`, 'establishment'),
        this.executeTextSearch(service, `pontos turisticos em ${cleanQuery}`),
    ])

    const rawResults = [ ...establishments, ...touristicPoints];
    const spotMap = new Map<string, TouristSpot> ()

    rawResults.forEach((place) => {
        const spot = this.mapToPlaceToSpot( place, cleanQuery);
        if ( spot.id && !spotMap.has(spot.id)){
            spotMap.set(spot.id, spot)
        }
    })

    return Array.from(spotMap.values())
    }

    private static executeTextSearch(service: any, query: string, type?: string): Promise<any[]> {
        return new Promise((resolve) => {
        const request: any = { query };
        if (type) request.type = type;

        service.textSearch(request, (results: any[], status: any) => {
            if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
            resolve(results);
            } else {
            resolve([]);
            }
        });
        });
    
    }
    private static mapToPlaceToSpot( place : any, city : string) : TouristSpot {
        let photoUrl = this.DEFAULT_IMAGE;
        if( place.photos && place.photos.length > 0){
            photoUrl = place.photos[0].getUrl({ maxWidth : 600, maxHeight : 400});
        }
        return {
            id: place.place_id || Math.random().toString(),
            city,
            name: place.name,
            description: place.formatted_address || 'Ponto turístico local',
            category: place.types || 'Não identificado',
            image_url: photoUrl,
            rating: place.rating,
            lat: place.geometry?.location ? place.geometry.location.lat() : 0,
            lng: place.geometry?.location ? place.geometry.location.lng() : 0,
    };
    }
}