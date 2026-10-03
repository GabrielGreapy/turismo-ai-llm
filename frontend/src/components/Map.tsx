import { useEffect, useRef } from 'react';
import type { TouristSpot } from '../models/Spot';

interface SpotsMapProps {
  spots: TouristSpot[];
  selectedSpot?: TouristSpot | null;
  onSpotClick?: (spot: TouristSpot) => void;
  height?: string;
}

export default function SpotsMap({ 
  spots, 
  selectedSpot, 
  onSpotClick, 
  height = "400px" 
}: SpotsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (!mapRef.current || !(window as any).google?.maps) return;

    // Inicializa o mapa se ainda não existir
    if (!googleMapRef.current) {
      googleMapRef.current = new (window as any).google.maps.Map(mapRef.current, {
        zoom: selectedSpot ? 16 : 12,
        center: selectedSpot 
          ? { lat: selectedSpot.lat, lng: selectedSpot.lng }
          : { lat: -14.235, lng: -51.925 }, // Centro do Brasil como fallback
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      });
    }

    const map = googleMapRef.current;

    // Limpa marcadores antigos
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // MODO DETALHES (Modo Ponto Único)
    if (selectedSpot && selectedSpot.lat) {
      const position = { lat: selectedSpot.lat, lng: selectedSpot.lng };
      
      map.setCenter(position);
      map.setZoom(17); // Zoom bem focado no lugar

      const marker = new (window as any).google.maps.Marker({
        position,
        map,
        title: selectedSpot.name,
        animation: (window as any).google.maps.Animation.DROP,
      });

      const infoWindow = new (window as any).google.maps.InfoWindow({
        content: `
          <div style="padding: 4px; max-width: 180px;">
            <strong style="font-size: 13px; color: #1b1c1d;">${selectedSpot.name}</strong>
            <p style="font-size: 11px; color: #54647a; margin-top: 4px;">${selectedSpot.description}</p>
          </div>
        `,
      });

      marker.addListener('click', () => infoWindow.open(map, marker));
      infoWindow.open(map, marker);
      markersRef.current.push(marker);
      return;
    }

    // MODO PESQUISA (Múltiplos Pontos)
    if (spots.length > 0) {
      const bounds = new (window as any).google.maps.LatLngBounds();

      spots.forEach((spot) => {
        if (!spot.lat || !spot.lng) return;

        const position = { lat: spot.lat, lng: spot.lng };
        bounds.extend(position);

        const marker = new (window as any).google.maps.Marker({
          position,
          map,
          title: spot.name,
        });

        marker.addListener('click', () => {
          if (onSpotClick) onSpotClick(spot);
        });

        markersRef.current.push(marker);
      });

      map.fitBounds(bounds);
    }
  }, [spots, selectedSpot]);

  return (
    <div 
      ref={mapRef} 
      className="w-full rounded-xl border border-[#c4c6cd] shadow-sm overflow-hidden" 
      style={{ height }}
    />
  );
}