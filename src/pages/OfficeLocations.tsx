import { useEffect, useState, useMemo, useRef } from 'react';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { officeLocationService } from '../services/officeLocationService';
import type { OfficeLocation, OfficeLocationFormData } from '../types';

// Fix default Leaflet marker icon (broken in bundlers)
// @ts-expect-error - Leaflet typings don't match the actual default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const defaultCenter: [number, number] = [20.5937, 78.9629]; // Default center (India)

/** Keeps the map centered on the marker when coordinates change externally (e.g., text input) */
function MapCenterUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevRef = useRef(center);
  if (center[0] !== prevRef.current[0] || center[1] !== prevRef.current[1]) {
    prevRef.current = center;
    map.setView(center, map.getZoom());
  }
  return null;
}

/** Inner component that captures map clicks to update position */
function LocationPicker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return position ? (
    <Marker position={position} draggable={true} eventHandlers={{ dragend: (e) => {
      const marker = e.target;
      const latlng = marker.getLatLng();
      onPositionChange(latlng.lat, latlng.lng);
    }}}>
      <Popup>
        Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
      </Popup>
    </Marker>
  ) : null;
}

export default function OfficeLocations() {
  const [locations, setLocations] = useState<OfficeLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<OfficeLocation | null>(null);
  const [formData, setFormData] = useState<OfficeLocationFormData>({
    name: '',
    latitude: defaultCenter[0],
    longitude: defaultCenter[1],
    radius: 100,
    is_active: true,
  });

  const mapCenter: [number, number] = useMemo(
    () => [formData.latitude, formData.longitude],
    [formData.latitude, formData.longitude]
  );

  useEffect(() => {
    loadLocations();
  }, []);

  const loadLocations = async () => {
    try {
      setLoading(true);
      const response = await officeLocationService.getOfficeLocations();
      setLocations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading locations:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingLocation) {
        await officeLocationService.updateOfficeLocation(editingLocation.id, formData);
      } else {
        await officeLocationService.createOfficeLocation(formData);
      }
      loadLocations();
      handleCloseModal();
    } catch (error) {
      console.error('Error saving location:', error);
    }
  };

  const handleEdit = (location: OfficeLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius,
      is_active: location.is_active,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number, name: string) => {
    if (window.confirm(`Are you sure you want to delete office "${name}"?`)) {
      try {
        await officeLocationService.deleteOfficeLocation(id);
        loadLocations();
      } catch (error) {
        console.error('Error deleting location:', error);
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingLocation(null);
    setFormData({
      name: '',
      latitude: defaultCenter[0],
      longitude: defaultCenter[1],
      radius: 100,
      is_active: true,
    });
  };

  const handlePositionChange = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Office Locations</h1>
        <button
          onClick={() => {
            setEditingLocation(null);
            setFormData({
              name: '',
              latitude: 40.7128,
              longitude: -74.0060,
              radius: 500,
              is_active: true,
            });
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Office Location</span>
        </button>
      </div>

      {/* Location List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center text-gray-500 py-8">Loading locations...</div>
        ) : locations.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No office locations found. Add your first office!
          </div>
        ) : (
          locations.map((location) => (
            <div
              key={location.id}
              className={`bg-white rounded-xl shadow-sm p-6 border border-gray-200 transition-colors ${
                !location.is_active ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-orange-600" />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(location)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(location.id, location.name)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-2">{location.name}</h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Latitude</span>
                  <span className="font-medium text-gray-900">{location.latitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Longitude</span>
                  <span className="font-medium text-gray-900">{location.longitude.toFixed(6)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Radius</span>
                  <span className="font-medium text-gray-900">{location.radius}m</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    location.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {location.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Mini map preview for each location */}
              <div className="mt-4 h-32 rounded-lg overflow-hidden border border-gray-200" style={{ zIndex: isModalOpen ? 0 : 1 }}>
                <MapContainer
                  center={[location.latitude, location.longitude]}
                  zoom={14}
                  scrollWheelZoom={false}
                  dragging={false}
                  zoomControl={false}
                  attributionControl={false}
                  style={{ width: '100%', height: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[location.latitude, location.longitude]} />
                </MapContainer>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">Created: {new Date(location.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingLocation ? 'Edit Office Location' : 'Add Office Location'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Headquarters"
                />
              </div>

              {/* Map Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pick Location on Map <span className="text-gray-400 font-normal">(click or drag the marker)</span>
                </label>
                <div className="h-64 rounded-lg overflow-hidden border border-gray-300">
                  <MapContainer
                    center={mapCenter}
                    zoom={14}
                    scrollWheelZoom={true}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    />
                    <MapCenterUpdater center={mapCenter} />
                    <LocationPicker
                      position={mapCenter}
                      onPositionChange={handlePositionChange}
                    />
                  </MapContainer>
                </div>
              </div>

              {/* Coordinates display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.latitude}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value);
                      if (!isNaN(lat)) setFormData({ ...formData, latitude: lat });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="40.7128"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formData.longitude}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value);
                      if (!isNaN(lng)) setFormData({ ...formData, longitude: lng });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="-74.0060"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Radius (meters)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.radius}
                  onChange={(e) => setFormData({ ...formData, radius: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700">
                  Active
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingLocation ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
