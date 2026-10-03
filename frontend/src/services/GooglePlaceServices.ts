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

    return new Promise((resolve ) => {
        service.textSearch(
            { 
                query : `estabelecimentos em ${cleanQuery}`,
                type : 'establishment',
            },
            (results : any[], status : any) => {
                if(status !== (window as any).google.maps.places.PlacesServiceStatus.OK || !results){
                    return resolve([])
                }
            
            const spots = results.slice( 0, 50).map((place) => this.mapToPlaceToSpot(place , cleanQuery))
            resolve(spots);
            }
        )
    })
    }
    private static mapToPlaceToSpot( place : any, city : string) : TouristSpot {
        let photoUrl = this.DEFAULT_IMAGE;
        if( place.photo && place.photo > 0){
            photoUrl = place.photo[0].getUrl({ maxWidth : 600, maxHeight : 400});
        }
        return {
            id: place.place_id || Math.random().toString(),
            city,
            name: place.name,
            description: place.formatted_address || 'Ponto turístico local',
            category: place.types?.includes('museum') ? 'Museu' : 'Atração',
            image_url: photoUrl,
            rating: place.rating,
            lat: place.geometry?.location ? place.geometry.location.lat() : 0,
            lng: place.geometry?.location ? place.geometry.location.lng() : 0,
    };
    }
}