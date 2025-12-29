'use client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const getIcon = (color) => {
  let url = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png";
  if (color === 'red') url = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png";
  if (color === 'yellow') url = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png";
  if (color === 'green') url = "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png";

  return L.icon({
    iconUrl: url,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

export default function Map({ data }) {
  const center = [-6.2088, 106.8456]; // Jakarta Center
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render map until component is mounted (client-side only)
  if (!isMounted) {
    return (
      <div className="w-full h-[500px] rounded-2xl bg-slate-800/50 flex items-center justify-center">
        <div className="animate-pulse text-slate-400">Memuat peta...</div>
      </div>
    );
  }

  return (
    <div
      className="w-full rounded-2xl overflow-hidden shadow-inner border border-slate-700/50 relative z-0"
      style={{ height: '500px' }}
    >
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        {data.map((item, idx) => (
          <Marker
            key={item.id_pengaduan || idx}
            position={[item.latitude, item.longitude]}
            icon={getIcon(item.pin_color)}
          >
            <Popup className="text-slate-900">
              <div className="flex flex-col gap-1 min-w-[150px]">
                {item.foto_bukti_awal && (
                  <img src={`/uploads/pengaduan/${item.foto_bukti_awal}`} alt="Foto" className="w-full h-24 object-cover rounded mb-1" />
                )}
                <b className="text-sm font-bold">{item.judul_laporan}</b>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded w-fit text-white ${item.status_pengaduan === 'Pending' ? 'bg-red-500' :
                  item.status_pengaduan === 'Diproses' ? 'bg-yellow-500' : 'bg-green-500'
                  }`}>
                  {item.status_pengaduan}
                </span>
                <span className="text-xs text-slate-500">{item.lokasi}</span>
                <Link href={`/tiket/${item.id_pengaduan}`} className="text-blue-600 text-xs font-bold mt-1 hover:underline">
                  Lihat Detail →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}