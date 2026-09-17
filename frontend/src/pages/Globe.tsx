import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { 
  Globe as GlobeIcon, MapPin, Layers, Navigation, ZoomIn, ZoomOut, 
  RefreshCw, ShieldAlert, AlertTriangle, Eye, ArrowRight, Database 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useIncidentStore } from '../stores/incident-store';
import { useDatasetStore, DATASETS } from '../stores/dataset-store';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || '';

interface FieldLocation {
  id: string;
  name: string;
  region: string;
  lng: number;
  lat: number;
  zoom: number;
  severity: 'CRITICAL' | 'HIGH' | 'REVIEW' | 'ROUTINE';
  reports: number;
  sifPotential: number;
  primaryHazard: string;
  keyAsset: string;
}

const BASE_LOCATIONS = [
  {
    id: 'LOC-ASM',
    name: 'Assam / Duliajan Basin',
    region: 'Northeast Asset Hub',
    lng: 95.32,
    lat: 27.35,
    zoom: 9.5,
    searchKeys: ['assam', 'duliajan', 'wh-44', 'rig #12', 'naharkatia'],
    keyAsset: 'Wellhead WH-44 & Rig #12',
    defaultHazard: 'BOP barrier degradation & high pressure gas leak'
  },
  {
    id: 'LOC-RAJ',
    name: 'Rajasthan / Barmer Basin',
    region: 'Western Onshore Block',
    lng: 71.38,
    lat: 25.75,
    zoom: 9.5,
    searchKeys: ['rajasthan', 'barmer', 'dr-03', 'esp'],
    keyAsset: 'Drilling Rig DR-03',
    defaultHazard: 'Line of fire around kelly bushing & VSD electrical'
  },
  {
    id: 'LOC-GUJ',
    name: 'Gujarat / Mehsana Basin',
    region: 'Western Production Hub',
    lng: 72.40,
    lat: 23.60,
    zoom: 9.5,
    searchKeys: ['gujarat', 'mehsana', 'ggs', 'separator'],
    keyAsset: 'GGS Plant 01 & Separator 04',
    defaultHazard: 'Flange weeping & flowline third-party activity'
  },
  {
    id: 'LOC-KG',
    name: 'KG Offshore Deepwater Block',
    region: 'Eastern Deepwater Offshore',
    lng: 82.30,
    lat: 16.50,
    zoom: 8.5,
    searchKeys: ['kg', 'offshore', 'platform alpha', 'manifold', 'crane'],
    keyAsset: 'Platform Alpha & Subsea Block',
    defaultHazard: 'Subsea riser breakthrough & crane lifting hazards'
  }
];

export default function Globe() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const incidents = useIncidentStore((s) => s.incidents);
  const activeDatasetId = useDatasetStore((s) => s.activeDatasetId);
  const activeMeta = DATASETS.find((d) => d.id === activeDatasetId);

  // Compute dynamic field locations based on current incidents
  const fieldLocations: FieldLocation[] = BASE_LOCATIONS.map((base) => {
    const locIncidents = incidents.filter(i => {
      const text = `${i.locationName} ${i.asset} ${i.reportText}`.toLowerCase();
      return base.searchKeys.some(k => text.includes(k));
    });

    const hasCrit = locIncidents.some(i => i.severity === 'CRITICAL');
    const hasHigh = locIncidents.some(i => i.severity === 'HIGH');
    const hasRev = locIncidents.some(i => i.severity === 'REVIEW');
    const severity: 'CRITICAL' | 'HIGH' | 'REVIEW' | 'ROUTINE' = 
      hasCrit ? 'CRITICAL' : hasHigh ? 'HIGH' : hasRev ? 'REVIEW' : 'ROUTINE';

    const sifCount = locIncidents.filter(i => (i.severity === 'CRITICAL' || i.severity === 'HIGH') && i.barrierStatus !== 'INTACT').length;
    const topHazard = locIncidents[0]?.reportText ? locIncidents[0].reportText.slice(0, 75) + '...' : base.defaultHazard;
    const topAsset = locIncidents[0]?.asset || base.keyAsset;

    return {
      id: base.id,
      name: base.name,
      region: base.region,
      lng: base.lng,
      lat: base.lat,
      zoom: base.zoom,
      severity,
      reports: locIncidents.length > 0 ? locIncidents.length : (activeDatasetId === 'demo' ? 24 : 0),
      sifPotential: sifCount > 0 ? sifCount : (activeDatasetId === 'demo' ? 6 : 0),
      primaryHazard: topHazard,
      keyAsset: topAsset,
    };
  });

  const [selectedLocId, setSelectedLocId] = useState<string>(BASE_LOCATIONS[0].id);
  const selectedLoc = fieldLocations.find(l => l.id === selectedLocId) || fieldLocations[0];
  const [mapStyle, setMapStyle] = useState<'light-v11' | 'satellite-streets-v12' | 'streets-v12'>('light-v11');
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // Initialize Mapbox 3D Globe
  useEffect(() => {
    if (!mapContainer.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    const instance = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: [78.9629, 22.5937],
      zoom: 4.2,
      projection: 'globe' as any,
    });

    instance.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');

    instance.on('load', () => {
      setIsMapLoaded(true);

      try {
        instance.setFog({
          color: 'rgb(248, 250, 252)',
          'high-color': 'rgb(209, 229, 240)',
          'horizon-blend': 0.1,
          'space-color': 'rgb(241, 245, 249)',
          'star-intensity': 0.0
        });
      } catch (err) {
        console.warn('Atmospheric fog config error:', err);
      }
    });

    map.current = instance;

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      instance.remove();
      map.current = null;
    };
  }, []);

  // Update map style if changed
  useEffect(() => {
    if (!map.current || !isMapLoaded) return;
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
  }, [mapStyle, isMapLoaded]);

  // Render Pins & Popups on Map
  useEffect(() => {
    const currentMap = map.current;
    if (!currentMap || !isMapLoaded) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    fieldLocations.forEach(loc => {
      const el = document.createElement('div');
      el.className = 'cursor-pointer group flex flex-col items-center';

      const isCrit = loc.severity === 'CRITICAL';
      const isHigh = loc.severity === 'HIGH';

      const dotColor = isCrit ? '#DC2626' : isHigh ? '#EA580C' : '#0D9488';
      const bgColor = isCrit ? '#FEE2E2' : isHigh ? '#FFEDD5' : '#CCFBF1';

      el.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          ${isCrit ? '<div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background-color: rgba(220,38,38,0.3); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>' : ''}
          <div style="width: 20px; height: 20px; border-radius: 50%; background-color: ${bgColor}; border: 2.5px solid ${dotColor}; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center;">
            <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${dotColor};"></div>
          </div>
        </div>
        <div style="margin-top: 4px; background: white; border: 1px solid #E2E8F0; border-radius: 4px; padding: 2px 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); font-family: monospace; font-size: 10px; font-weight: bold; color: #0F172A; white-space: nowrap;">
          ${loc.name.split('/')[0]} (${loc.sifPotential} SIFs)
        </div>
      `;

      const popup = new mapboxgl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 6px; font-family: sans-serif;">
          <div style="font-weight: bold; font-size: 12px; color: #0F172A;">${loc.name}</div>
          <div style="font-size: 10px; color: #64748B; margin-top: 2px;">Asset: <strong>${loc.keyAsset}</strong></div>
          <div style="font-size: 11px; margin-top: 4px; color: ${dotColor}; font-weight: 600;">
            ${loc.sifPotential} SIF Precursors · ${loc.reports} Total Reports
          </div>
        </div>
      `);

      el.addEventListener('click', () => {
        setSelectedLocId(loc.id);
        currentMap.flyTo({
          center: [loc.lng, loc.lat],
          zoom: loc.zoom,
          pitch: 45,
          speed: 1.2
        });
      });

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.lng, loc.lat])
        .setPopup(popup)
        .addTo(currentMap);

      markersRef.current.push(marker);
    });
  }, [isMapLoaded, incidents, mapStyle]);

  const handleFlyTo = (loc: FieldLocation) => {
    setSelectedLocId(loc.id);
    map.current?.flyTo({
      center: [loc.lng, loc.lat],
      zoom: loc.zoom,
      pitch: 45,
      bearing: 20,
      speed: 1.3
    });
  };

  const handleResetGlobe = () => {
    map.current?.flyTo({
      center: [78.9629, 22.5937],
      zoom: 4.2,
      pitch: 0,
      bearing: 0,
      speed: 1.2
    });
  };

  return (
    <div className="p-4 bg-background text-foreground space-y-4">
      {/* Top Bar */}
      <div className="flex flex-wrap justify-between items-center gap-3">
        <div>
          <h1 className="text-xl font-bold font-mono tracking-tight text-foreground flex items-center gap-2">
            <GlobeIcon className="w-5 h-5 text-primary" /> Geospatial Precursor Intelligence (Mapbox)
          </h1>
          <p className="text-xs text-foreground-muted mt-0.5">
            Powered by Mapbox 3D Globe View · Visualizing operational high-energy hazards across India.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded text-xs font-mono font-semibold">
            MAPBOX GL CONNECTED
          </span>
          {activeDatasetId === 'demo' ? (
            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded text-xs font-mono font-semibold">
              DEMO GEODATA
            </span>
          ) : (
            <span className="px-2.5 py-1 bg-violet-50 text-violet-800 border border-violet-200 rounded text-xs font-mono font-semibold flex items-center gap-1.5">
              <Database className="w-3 h-3 text-violet-600" />
              {activeMeta?.label.toUpperCase()} ({activeMeta?.tag})
            </span>
          )}
        </div>
      </div>

      {/* Main Map Container + Inspector Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Map View */}
        <div className="lg:col-span-8 bg-surface-1 border border-border rounded-lg shadow-sm p-3 flex flex-col h-[600px] relative overflow-hidden">
          {/* Top Floating Controls */}
          <div className="absolute top-6 left-6 z-10 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-xs p-1.5 rounded-lg border border-border shadow-md">
            <button
              onClick={() => setMapStyle('light-v11')}
              className={cn("px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer", mapStyle === 'light-v11' ? "bg-primary text-primary-foreground font-semibold" : "text-foreground-muted hover:bg-surface-2")}
            >
              Light Command
            </button>
            <button
              onClick={() => setMapStyle('satellite-streets-v12')}
              className={cn("px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer", mapStyle === 'satellite-streets-v12' ? "bg-primary text-primary-foreground font-semibold" : "text-foreground-muted hover:bg-surface-2")}
            >
              Satellite Terrain
            </button>
            <button
              onClick={() => setMapStyle('streets-v12')}
              className={cn("px-2.5 py-1 rounded text-xs font-mono font-medium transition-all cursor-pointer", mapStyle === 'streets-v12' ? "bg-primary text-primary-foreground font-semibold" : "text-foreground-muted hover:bg-surface-2")}
            >
              Streets
            </button>
            <div className="h-4 w-px bg-border mx-1" />
            <button
              onClick={handleResetGlobe}
              className="px-2 py-1 rounded text-xs font-mono text-foreground-dim hover:text-foreground hover:bg-surface-2 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Reset View
            </button>
          </div>

          <div ref={mapContainer} className="w-full h-full rounded-md overflow-hidden" />
        </div>

        {/* Regional Inspector Sidebar */}
        <div className="lg:col-span-4 bg-surface-1 border border-border rounded-lg shadow-sm p-4 flex flex-col space-y-4">
          <div>
            <h3 className="text-foreground-muted font-mono text-xs font-semibold uppercase tracking-wider">
              Operational Field Clusters
            </h3>
            <p className="text-[11px] text-foreground-dim mt-0.5">
              Click any site node to fly directly to its physical wellheads.
            </p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto">
            {fieldLocations.map(loc => {
              const isSelected = selectedLoc.id === loc.id;
              const isCrit = loc.severity === 'CRITICAL';
              return (
                <div
                  key={loc.id}
                  onClick={() => handleFlyTo(loc)}
                  className={cn(
                    "p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col space-y-2",
                    isSelected ? "bg-primary/5 border-primary shadow-xs" : "bg-surface-2/60 border-border hover:bg-surface-2"
                  )}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <MapPin className={cn("w-4 h-4", isCrit ? "text-red-600" : "text-primary")} />
                      <span className="font-semibold text-foreground text-xs">{loc.name}</span>
                    </div>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-mono font-bold",
                      isCrit ? "bg-red-100 text-red-800" : loc.severity === 'HIGH' ? "bg-orange-100 text-orange-800" : "bg-teal-100 text-teal-800"
                    )}>
                      {loc.severity}
                    </span>
                  </div>

                  <p className="text-[11px] text-foreground-muted leading-tight font-sans">
                    <strong>Precursor Pattern:</strong> {loc.primaryHazard}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-foreground-dim pt-1 border-t border-border/50">
                    <span>SIFs: <strong className="text-red-600">{loc.sifPotential}</strong></span>
                    <span>Total Reports: <strong className="text-foreground">{loc.reports}</strong></span>
                    <span className="text-primary font-semibold flex items-center gap-0.5">
                      Fly <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Field Focus Card */}
          <div className="p-4 bg-surface-2 border border-border rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-foreground-dim">ACTIVE FOCUS</span>
              <span className="font-bold text-foreground">{selectedLoc.keyAsset}</span>
            </div>
            <div className="text-xs text-foreground font-sans leading-snug">
              Coordinates: <span className="font-mono text-foreground-dim">{selectedLoc.lat.toFixed(2)}° N, {selectedLoc.lng.toFixed(2)}° E</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <Link to="/triage" className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> View Linked Precursors
              </Link>
              <Link to="/assets" className="text-xs text-foreground-muted font-semibold hover:underline">
                Asset Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
