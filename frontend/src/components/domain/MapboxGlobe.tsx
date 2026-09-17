import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Maximize2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface MapboxGlobeProps {
  className?: string;
  height?: string;
  initialZoom?: number;
  showExpandButton?: boolean;
}

const HOTSPOTS = [
  { name: 'Assam (Duliajan)', sif: 14, lng: 95.32, lat: 27.35, severity: 'CRITICAL' },
  { name: 'Rajasthan (Barmer)', sif: 8, lng: 71.38, lat: 25.75, severity: 'HIGH' },
  { name: 'Gujarat (Mehsana)', sif: 5, lng: 72.40, lat: 23.60, severity: 'REVIEW' },
  { name: 'KG Offshore Block', sif: 3, lng: 82.30, lat: 16.50, severity: 'ROUTINE' },
];

export const MapboxGlobe: React.FC<MapboxGlobeProps> = ({
  className,
  height = 'h-72',
  initialZoom = 3.8,
  showExpandButton = true,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [style, setStyle] = useState<'light-v11' | 'satellite-streets-v12'>('light-v11');

  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${style}`,
      center: [79.0, 22.0], // Center of India
      zoom: initialZoom,
      projection: 'globe' as any,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right');

    map.on('load', () => {
      try {
        map.setFog({
          color: 'rgb(248, 250, 252)',
          'high-color': 'rgb(215, 235, 245)',
          'horizon-blend': 0.1,
          'space-color': 'rgb(241, 245, 249)',
          'star-intensity': 0.0,
        });
      } catch (err) {
        // Fallback if fog not supported
      }

      // Add pins
      HOTSPOTS.forEach((spot) => {
        const el = document.createElement('div');
        el.className = 'cursor-pointer flex flex-col items-center';

        const isCrit = spot.severity === 'CRITICAL';
        const isHigh = spot.severity === 'HIGH';
        const dotColor = isCrit ? '#DC2626' : isHigh ? '#EA580C' : '#0D9488';
        const bgColor = isCrit ? '#FEE2E2' : isHigh ? '#FFEDD5' : '#CCFBF1';

        el.innerHTML = `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            ${isCrit ? '<div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background-color: rgba(220,38,38,0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
            <div style="width: 16px; height: 16px; border-radius: 50%; background-color: ${bgColor}; border: 2px solid ${dotColor}; box-shadow: 0 1px 4px rgba(0,0,0,0.2); display: flex; align-items: center; justify-content: center;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${dotColor};"></div>
            </div>
          </div>
          <div style="margin-top: 2px; background: white; border: 1px solid #E2E8F0; border-radius: 3px; padding: 1px 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.1); font-family: monospace; font-size: 9px; font-weight: bold; color: #0F172A; white-space: nowrap;">
            ${spot.name.split(' ')[0]} (${spot.sif})
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat([spot.lng, spot.lat])
          .addTo(map);

        markersRef.current.push(marker);
      });
    });

    mapInstance.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapInstance.current = null;
    };
  }, [style, initialZoom]);

  const resetView = () => {
    mapInstance.current?.flyTo({
      center: [79.0, 22.0],
      zoom: initialZoom,
      speed: 1.2,
    });
  };

  return (
    <div className={cn("relative bg-surface-1 border border-border rounded-lg overflow-hidden shadow-sm flex flex-col", height, className)}>
      {/* Floating Header */}
      <div className="absolute top-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-xs px-2 py-1 rounded-md border border-border/80 shadow-xs pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="font-mono text-[10px] font-bold text-foreground">3D MAPBOX GLOBE</span>
        </div>

        <div className="flex items-center gap-1 pointer-events-auto">
          <button
            onClick={() => setStyle(style === 'light-v11' ? 'satellite-streets-v12' : 'light-v11')}
            className="px-2 py-0.5 bg-white/90 hover:bg-white text-foreground-muted hover:text-foreground text-[10px] font-mono font-medium rounded border border-border shadow-xs transition-colors"
          >
            {style === 'light-v11' ? 'Satellite' : 'Light'}
          </button>
          <button
            onClick={resetView}
            className="p-1 bg-white/90 hover:bg-white text-foreground-muted hover:text-foreground rounded border border-border shadow-xs transition-colors"
            title="Reset Globe View"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
          {showExpandButton && (
            <Link
              to="/globe"
              className="p-1 bg-white/90 hover:bg-white text-primary rounded border border-border shadow-xs transition-colors flex items-center gap-1 text-[10px] font-mono font-semibold px-2"
              title="Expand Fullscreen Geospatial View"
            >
              <Maximize2 className="w-3 h-3" /> Full
            </Link>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
};
