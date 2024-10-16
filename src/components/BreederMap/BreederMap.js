import React, { useState, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import './BreederMap.scss';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 0,
  lng: 0
};

const mapOptions = {
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  restriction: {
    latLngBounds: {
      north: 85,
      south: -85,
      west: -180,
      east: 180,
    },
    strictBounds: false,
  },
  minZoom: 2,
};

function BreederMap() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY
  });

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [newPin, setNewPin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const searchInputRef = useRef(null);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds(center);
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  const handleMapClick = (event) => {
    const lat = event.latLng.lat();
    const lng = event.latLng.lng();
    setNewPin({ lat, lng });
    setIsModalOpen(true);
    setIsSidePanelOpen(false);
  };

  const handleMarkerClick = (marker) => {
    setActiveMarker(marker);
    setIsSidePanelOpen(true);
  };

  const handlePinSubmit = (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const species = e.target.species.value;
    const contactInfo = e.target.contactInfo.value;
    
    if (name && species && contactInfo && newPin) {
      const newMarker = {
        ...newPin,
        name,
        species,
        contactInfo
      };
      setMarkers([...markers, newMarker]);
      setNewPin(null);
      setIsModalOpen(false);
    }
  };

  const handleSearch = () => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: searchInputRef.current.value }, (results, status) => {
      if (status === 'OK' && map) {
        map.setCenter(results[0].geometry.location);
        map.setZoom(15); // Zoom in to street level
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPin(null);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setActiveMarker(null);
  };

  return isLoaded ? (
    <div className="breeder-map">
      <h1 className="section-title">Breeder Map</h1>
      <div className="search-container">
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search for a location"
        />
        <button onClick={handleSearch}>
          <FontAwesomeIcon icon={faSearch} /> Search
        </button>
      </div>
      <div className="map-wrapper">
        <div className="map-container">
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={center}
            zoom={2}
            onLoad={onLoad}
            onUnmount={onUnmount}
            onClick={handleMapClick}
            options={mapOptions}
          >
            {markers.map((marker, index) => (
              <Marker
                key={index}
                position={{ lat: marker.lat, lng: marker.lng }}
                onClick={() => handleMarkerClick(marker)}
                icon={{
                  path: faMapMarkerAlt.icon[4],
                  fillColor: "#bd692d",
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#ffffff",
                  scale: 0.075,
                }}
              />
            ))}
            {newPin && (
              <Marker
                position={{ lat: newPin.lat, lng: newPin.lng }}
                icon={{
                  path: faMapMarkerAlt.icon[4],
                  fillColor: "#ff6b6b",
                  fillOpacity: 1,
                  strokeWeight: 1,
                  strokeColor: "#ffffff",
                  scale: 0.075,
                }}
              />
            )}
          </GoogleMap>
        </div>
        {isSidePanelOpen && activeMarker && (
          <div className="side-panel">
            <button className="close-button" onClick={handleCloseSidePanel}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>{activeMarker.name}</h3>
            <p><strong>Species:</strong> {activeMarker.species}</p>
            <p><strong>Contact:</strong> {activeMarker.contactInfo}</p>
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>Add New Pin</h3>
            <form onSubmit={handlePinSubmit}>
              <input type="text" name="name" placeholder="Name (Identifier)" required />
              <input type="text" name="species" placeholder="Species" required />
              <input type="text" name="contactInfo" placeholder="Contact Info" required />
              <button type="submit">Add Pin</button>
            </form>
          </div>
        </div>
      )}
    </div>
  ) : <div>Loading...</div>;
}

export default BreederMap;