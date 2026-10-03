import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Import do hook de navegação
import Header from '../components/Header';
import SpotsMap from '../components/Map';
import type { TouristSpot } from '../models/Spot';
import { 
  MapPin, 
  Search, 
  Compass, 
  Loader2, 
  Info, 
  AlertTriangle,
  Star,
  ExternalLink
} from 'lucide-react';

import { useSearch } from '../contexts/SearchContext';

export default function CitySearch() {
  const navigate = useNavigate(); // 2. Inicialização do hook
  const {searchTerm, setSearchTerm } = useSearch()
  const [cityName, setCityName] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [spots, setSpots] = useState<TouristSpot[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [apiReady, setApiReady] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_KEY;
    
    if ((window as any).google?.maps?.places) {
      setApiReady(true);
      return;
    }

    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&v=weekly&loading=async`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const checkInterval = setInterval(() => {
      if ((window as any).google?.maps?.places) {
        setApiReady(true);
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  useEffect(() => {
    if (!apiReady || !inputRef.current) return;

    try {
      const autocomplete = new (window as any).google.maps.places.Autocomplete(inputRef.current, {
        types: ['(cities)'],
        fields: ['address_components', 'formatted_address', 'geometry', 'name'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.formatted_address) {
          setCityName(place.formatted_address);
        } else if (place.name) {
          setCityName(place.name);
        }
      });
    } catch (e) {
      console.error("Erro ao iniciar autocomplete:", e);
    }
  }, [apiReady]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim() || !apiReady) return;

    setLoading(true);
    setHasSearched(true);
    setCityName(searchTerm)
    const cleanCityQuery = cityName.split(',')[0].trim();

    const dummyElement = document.createElement('div');
    const service = new (window as any).google.maps.places.PlacesService(dummyElement);

    const request = {
      query: `estabelecimentos em ${cleanCityQuery}`,
      type: 'establishment'
    };

    service.textSearch(request, (results: any[], status: any) => {
      if (status === (window as any).google.maps.places.PlacesServiceStatus.OK && results) {
        const mappedSpots: TouristSpot[] = results.slice(0, 50).map((place) => {
          let photoUrl = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
          if (place.photos && place.photos.length > 0) {
            photoUrl = place.photos[0].getUrl({ maxWidth: 600, maxHeight: 400 });
          }

          return {
            id: place.place_id || Math.random().toString(),
            city: cleanCityQuery,
            name: place.name,
            description: place.formatted_address || 'Ponto turístico local',
            category: place.types?.includes('museum') ? 'Museu' : 'Atração',
            image_url: photoUrl,
            rating: place.rating,
            lat : place.geometry?.location ? place.geometry.location.lat() : 0 ,
            lng : place.geometry?.location ? place.geometry.location.lng() : 0 ,
          };
        });

        setSpots(mappedSpots);
      } else {
        setSpots([]);
      }
      setLoading(false);
    });
  };

  // 3. Função acionada ao clicar em qualquer card
  const handleSpotClick = (spot: TouristSpot) => {
    // Redireciona para /spot/{id} enviando também os dados do ponto turístico no estado
    setSearchTerm(spot.city)
    navigate(`/spot/${spot.id}`, { state: { spot } });
  };

  return (
    <div className="min-h-screen bg-[#fbf9fa] text-[#1b1c1d] font-sans antialiased selection:bg-[#d2e4fb]">
      <Header/>

      <main className="max-w-4xl mx-auto py-8 px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[#1b1c1d] mb-1 tracking-tight">Explore Cities</h1>
          <p className="text-sm text-[#44474c]">Discover real tourist attractions with live photos from Google Places.</p>
        </div>

        <section className="bg-white p-6 rounded-xl border border-[#c4c6cd] shadow-sm mb-8">
          <form onSubmit={handleCitySearch} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="space-y-1.5 flex-1 w-full">
              <label className="text-xs font-semibold text-[#44474c]" htmlFor="cityInput">
                Enter City Name
              </label>
              
              <div className="relative">
                <input 
                  id="cityInput"
                  ref={inputRef}
                  type="text"
                  placeholder={apiReady ? "Search any city (e.g. Picuí, Rio de Janeiro, Tokyo)..." : "Loading Google Maps API..."}
                  className="w-full bg-[#f5f3f4] border border-[#74777d] rounded-lg pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:border-[#041627] focus:ring-1 focus:ring-[#041627] transition-all disabled:opacity-60"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={!apiReady}
                  required
                />
                <MapPin className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#44474c] z-10" />
              </div>
            </div>
            
            <button 
              type="submit"
              disabled={loading || !apiReady}
              className="w-full sm:w-auto min-w-[140px] bg-[#041627] hover:bg-[#1a2b3c] text-white font-bold text-xs rounded-lg py-3 px-6 transition-all shadow-sm active:scale-[0.98] uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-85"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </form>
        </section>
        <div className="mb-8">
          <SpotsMap 
            spots={spots} 
            onSpotClick={handleSpotClick} 
            height="380px" 
          />
        </div>
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 border-b border-[#c4c6cd] pb-3">
            <Compass className="w-5 h-5 text-[#041627]" />
            <h3 className="text-xs font-bold text-[#1b1c1d] uppercase tracking-widest">
              {loading ? 'Searching Attractions...' : 'Tourist Attractions'}
            </h3>
          </div>

          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-[#041627] animate-spin" />
              <p className="text-sm font-medium text-[#44474c]">Fetching live places and images from Google Maps...</p>
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="bg-[#efedef] p-6 rounded-lg flex items-start gap-4 border border-[#c4c6cd]/40">
              <Info className="w-5 h-5 text-[#54647a] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#1b1c1d]">Live Google Places API Integrated</h4>
                <p className="text-xs leading-normal text-[#54647a] mt-0.5">
                  Type any location in the search bar to load authentic tourist attractions along with their Google photos.
                </p>
              </div>
            </div>
          )}

          {!loading && hasSearched && spots.length === 0 && (
            <div className="bg-[#ffdad6]/20 border border-[#ba1a1a]/20 p-6 rounded-lg flex items-start gap-4">
              <AlertTriangle className="w-5 h-5 text-[#ba1a1a] shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-[#ba1a1a]">No Attractions Found</h4>
                <p className="text-xs leading-normal text-[#44474c] mt-0.5">
                  No registered attractions found for "{cityName}".
                </p>
              </div>
            </div>
          )}


          {!loading && spots.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {spots.map((spot) => (
                <div 
                  key={spot.id} 
                  onClick={() => handleSpotClick(spot)} // 4. Clique que dispara a navegação
                  className="bg-white rounded-xl border border-[#c4c6cd] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="h-48 bg-[#e4e2e3] relative overflow-hidden">
                    <img 
                      src={spot.image_url} 
                      alt={spot.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {spot.rating && (
                      <span className="absolute top-3 right-3 bg-[#041627]/90 text-white text-[11px] font-bold px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {spot.rating}
                      </span>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold text-[#1b1c1d] tracking-tight group-hover:text-[#041627] transition-colors">
                          {spot.name}
                        </h4>
                        <ExternalLink className="w-4 h-4 text-[#74777d] group-hover:text-[#041627] transition-colors" />
                      </div>
                      <p className="text-xs text-[#44474c] mt-1.5 leading-relaxed">{spot.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}