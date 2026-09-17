import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Satellite, MapPin, ArrowRight, ShieldAlert, Radio } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIncidentStore, IncidentMarker } from '../../stores/incident-store';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface LocationOption {
  id: string;
  name: string;
  shortName: string;
  lng: number;
  lat: number;
  zoom: number;
  pitch: number;
  bearing: number;
  asset: string;
}

const FIELD_LOCATIONS: LocationOption[] = [
  {
    id: 'ALL',
    name: 'All Field Basins (National Heatmap)',
    shortName: 'National View',
    lng: 78.9629,
    lat: 22.5937,
    zoom: 4.2,
    pitch: 0,
    bearing: 0,
    asset: 'All Active Sites'
  },
  {
    id: 'ASSAM',
    name: 'Assam / Duliajan Basin',
    shortName: 'Assam (Duliajan)',
    lng: 95.32,
    lat: 27.35,
    zoom: 12.8,
    pitch: 52,
    bearing: 25,
    asset: 'Wellhead WH-44 & Rig #12'
  },
  {
    id: 'RAJASTHAN',
    name: 'Rajasthan / Barmer Basin',
    shortName: 'Rajasthan (Barmer)',
    lng: 71.38,
    lat: 25.75,
    zoom: 12.5,
    pitch: 50,
    bearing: 15,
    asset: 'Drilling Rig DR-03'
  },
  {
    id: 'GUJARAT',
    name: 'Gujarat / Mehsana Basin',
    shortName: 'Gujarat (Mehsana)',
    lng: 72.40,
    lat: 23.60,
    zoom: 12.2,
    pitch: 45,
    bearing: -10,
    asset: 'GGS Plant 01'
  },
  {
    id: 'KG_OFFSHORE',
    name: 'KG Offshore Deepwater Block',
    shortName: 'KG Offshore',
    lng: 82.30,
    lat: 16.50,
    zoom: 11.2,
    pitch: 40,
    bearing: 0,
    asset: 'Offshore Platform Alpha'
  }
];

export const HomeScreenMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const incidents = useIncidentStore((s) => s.incidents);
  const activeIncident = useIncidentStore((s) => s.activeIncident);

  const [selectedId, setSelectedId] = useState<string>('ASSAM');
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const activeLoc = FIELD_LOCATIONS.find(l => l.id === selectedId) || FIELD_LOCATIONS[1];

  // Count incidents for active field
  const localIncidents = selectedId === 'ALL'
    ? incidents
    : incidents.filter(inc => 
        inc.locationName.toLowerCase().includes(activeLoc.shortName.toLowerCase().split(' ')[0]) ||
        (selectedId === 'ASSAM' && (inc.locationName.includes('Assam') || inc.locationName.includes('Duliajan'))) ||
        (selectedId === 'RAJASTHAN' && inc.locationName.includes('Rajasthan')) ||
        (selectedId === 'GUJARAT' && inc.locationName.includes('Gujarat')) ||
        (selectedId === 'KG_OFFSHORE' && inc.locationName.includes('KG'))
      );

  const criticalCount = localIncidents.filter(i => i.severity === 'CRITICAL').length;
  const highCount = localIncidents.filter(i => i.severity === 'HIGH').length;

  // Initialize Mapbox in Satellite View
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const instance = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/satellite-streets-v12',
      center: [activeLoc.lng, activeLoc.lat],
      zoom: activeLoc.zoom,
      pitch: activeLoc.pitch,
      bearing: activeLoc.bearing,
      attributionControl: false,
    });

    instance.addControl(new mapboxgl.NavigationControl({ showCompass: true }), 'bottom-right');

    instance.on('load', () => {
      setIsLoaded(true);
    });

    map.current = instance;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      instance.remove();
      map.current = null;
    };
  }, []);

  // Update Camera & Render Dynamic Incident Markers
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap || !isLoaded) return;

    // Camera flyTo
    currentMap.flyTo({
      center: [activeLoc.lng, activeLoc.lat],
      zoom: activeLoc.zoom,
      pitch: activeLoc.pitch,
      bearing: activeLoc.bearing,
      speed: 1.4,
      curve: 1.2,
      essential: true
    });

    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Filter which incidents to show based on dropdown selection
    const displayList = selectedId === 'ALL' ? incidents : localIncidents;

    displayList.forEach((inc) => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer flex flex-col items-center select-none';

      const isCrit = inc.severity === 'CRITICAL';
      const isHigh = inc.severity === 'HIGH';
      const isLive = inc.isLiveWorkerReport;

      const dotColor = isCrit ? '#EF4444' : isHigh ? '#F97316' : '#14B8A6';
      const bgColor = isCrit ? '#FEF2F2' : isHigh ? '#FFF7ED' : '#F0FDFA';

      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${isCrit || isLive ? `<div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background-color: ${dotColor}; opacity: 0.45; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>` : ''}
          <div style="width: 22px; height: 22px; border-radius: 50%; background-color: ${bgColor}; border: 2.5px solid ${dotColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center;">
            <div style="width: 7px; height: 7px; border-radius: 50%; background-color: ${dotColor};"></div>
          </div>
        </div>
        <div style="margin-top: 4px; background: rgba(15, 23, 42, 0.9); backdrop-filter: blur(4px); border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 2px 6px; box-shadow: 0 2px 6px rgba(0,0,0,0.5); font-family: monospace; font-size: 10px; font-weight: bold; color: white; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
          ${isLive ? '<span style="color: #F87171;">● LIVE:</span>' : ''} ${inc.asset.split('&')[0].trim()} · ${inc.severity}
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 6px; font-family: sans-serif; max-width: 220px;">
          <div style="font-weight: bold; font-size: 12px; color: #0F172A; display: flex; justify-content: space-between;">
            <span>${inc.id}</span>
            <span style="color: ${dotColor}; font-weight: bold;">${inc.severity}</span>
          </div>
          <div style="font-size: 11px; color: #334155; margin-top: 3px; line-height: 1.3;">
            ${inc.reportText.slice(0, 100)}...
          </div>
          <div style="font-size: 10px; color: #64748B; margin-top: 4px; font-family: monospace;">
            Asset: <strong>${inc.asset}</strong> · ${inc.timestamp}
          </div>
        </div>
      `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat([inc.lng, inc.lat])
        .setPopup(popup)
        .addTo(currentMap);

      markersRef.current.push(marker);
    });
  }, [selectedId, incidents, isLoaded]);

  // If a new worker report was just added, auto-focus that region
  useEffect(() => {
    if (activeIncident && activeIncident.isLiveWorkerReport && map.current) {
      map.current.flyTo({
        center: [activeIncident.lng, activeIncident.lat],
        zoom: 13,
        pitch: 55,
        speed: 1.5,
        essential: true
      });
    }
  }, [activeIncident]);

  return (
    <div className="bg-surface-1 border border-border rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Header & Location Selection Strip */}
      <div className="p-2.5 sm:px-3 border-b border-border bg-surface-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Satellite className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="font-mono text-xs font-bold text-foreground uppercase tracking-wider">
            Satellite Hazard Map
          </span>
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-mono text-[10px] font-bold">
              <Radio className="w-2.5 h-2.5 animate-pulse text-red-600" /> {criticalCount} Critical Active
            </span>
          )}
        </div>

        {/* Location Dropdown / Select Option */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="field-select" className="text-[11px] font-mono text-foreground-muted shrink-0">
            Field:
          </label>
          <select
            id="field-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-7 rounded border border-border bg-surface-2 px-2 text-[11px] font-mono font-semibold text-foreground outline-none focus:border-primary cursor-pointer hover:bg-surface-3 transition-colors"
          >
            {FIELD_LOCATIONS.map(loc => (
              <option key={loc.id} value={loc.id}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Surface (Compact Height) */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden">
        {/* Mapbox container */}
        <div ref={mapContainer} className="w-full h-full" />

        {/* Minimalist Floating Overlay for Selected Location */}
        <div className="absolute bottom-2.5 left-2.5 z-10 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-md border border-border/80 shadow-sm pointer-events-auto flex items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <span className={cn(
              "w-2 h-2 rounded-full",
              criticalCount > 0 ? 'bg-red-600 animate-pulse' : 'bg-orange-500'
            )}></span>
            <span className="font-bold text-foreground">{activeLoc.shortName}</span>
          </div>
          <span className="text-border">|</span>
          <span className="text-[11px]">
            <strong className={criticalCount > 0 ? 'text-red-600' : 'text-orange-600'}>
              {localIncidents.length} Hazards ({criticalCount} Critical)
            </strong>
          </span>
          <span className="text-border">|</span>
          <Link 
            to="/globe" 
            className="text-primary hover:underline font-semibold flex items-center gap-0.5 text-[11px]"
          >
            3D Globe <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Satellite Mode Badge */}
        <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white rounded text-[10px] font-mono font-bold tracking-wider uppercase border border-white/20">
            Mapbox Satellite
          </span>
        </div>
      </div>
    </div>
  );
};
