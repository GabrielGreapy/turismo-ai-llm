import { useEffect, useRef } from 'react';
import type { TouristSpot } from '../models/Spot';


interface SpotsMapProps {
  spots: TouristSpot[];
  selectedSpot?: TouristSpot | null;
  onSpotClick?: (spot: TouristSpot) => void;
  height?: string;
}

export default function DashboardSpotsMap({ 
  spots, 
  selectedSpot, 
  onSpotClick, 
  height = "400px" 
}: SpotsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    let cancelled = false;

    const initMap = async () => {
      if (!mapRef.current || !(window as any).google?.maps) return;

      try {
        const { AdvancedMarkerElement, PinElement } = await (window as any).google.maps.importLibrary("marker");
        const { Map, InfoWindow } = await (window as any).google.maps.importLibrary("maps");
        const { LatLngBounds } = await (window as any).google.maps.importLibrary("core");

        if (cancelled) return;

        if (!googleMapRef.current) {
          googleMapRef.current = new Map(mapRef.current, {
            mapId: 'DEMO_MAP_ID',
            zoom: selectedSpot ? 16 : 12,
            // Fallback de segurança caso userCity não tenha lat/lng válidos
            center: { lat: -14.235, lng: -51.925 },
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: true,
          });
        }

        const map = googleMapRef.current;

        markersRef.current.forEach(m => { m.map = null });
        markersRef.current = [];

        // MODO DETALHES (Modo Ponto Único)
        if (selectedSpot && selectedSpot.lat) {
          const position = { lat: selectedSpot.lat, lng: selectedSpot.lng };
          
          map.setCenter(position);
          map.setZoom(17); 

          const spotPin = new PinElement({
            background: "#4285F4",
            borderColor: "#1A4D8F",
            glyphColor: "#fff",
          });

          const marker = new AdvancedMarkerElement({
            position,
            map,
            title: selectedSpot.name,
            content: spotPin.element,
          });

          const infoWindow = new InfoWindow({
            content: `
              <div style="padding: 4px; max-width: 180px;">
                <strong style="font-size: 13px; color: #1b1c1d;">${selectedSpot.name}</strong>
                <p style="font-size: 11px; color: #54647a; margin-top: 4px;">${selectedSpot.description}</p>
              </div>
            `,
          });

          marker.addEventListener('gmp-click', () => infoWindow.open(map, marker));
          infoWindow.open(map, marker);
          markersRef.current.push(marker);
          return;
        }

        // MODO PESQUISA (Múltiplos Pontos)
        if (spots.length > 0) {
          const bounds = new LatLngBounds();

          spots.forEach((spot) => {
            if (!spot.lat || !spot.lng) return;

            const position = { lat: spot.lat, lng: spot.lng };
            bounds.extend(position);

            const spotPin = new PinElement({
              background: "#4285F4",
              borderColor: "#1A4D8F",
              glyphColor: "#fff",
            });

            const marker = new AdvancedMarkerElement({
              position,
              map,
              title: spot.name,
              content: spotPin.element,
            });

            marker.addEventListener('gmp-click', () => {
              if (onSpotClick) onSpotClick(spot);
            });

            markersRef.current.push(marker);
          });

          map.fitBounds(bounds);
        }
      } catch (error) {
        console.error("Erro ao carregar mapa", error);
      }
    };

    initMap();

    return () => {
      cancelled = true;
    };
  }, [spots, selectedSpot]);

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-xl border border-[#c4c6cd] shadow-sm overflow-hidden" 
      style={{ height }}
    />
  );
}