import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faTimes } from '@fortawesome/free-solid-svg-icons';
import './BreederMap.scss';
import customToast from '../../utils/toast';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 20,
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
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    libraries: ['places'],
  });

  useEffect(() => {
    if (loadError) {
      console.error('Error loading Google Maps:', loadError);
    }
  }, [loadError]);

  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [newPin, setNewPin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const searchInputRef = useRef(null);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(new window.google.maps.LatLng(85, -180));
    bounds.extend(new window.google.maps.LatLng(-85, 180));
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  const handleMapClick = (event) => {
    if (event.latLng) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setNewPin({ lat, lng });
      setIsModalOpen(true);
      setIsSidePanelOpen(false);
    }
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
    if (searchInputRef.current && map && window.google) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: searchInputRef.current.value }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          map.setCenter(location);
          map.setZoom(8);
        } else {
          let errorMessage = 'Search was not successful.';
          switch (status) {
            case 'ZERO_RESULTS':
              errorMessage += ' No results found for the given search term. Maybe add city/county to be more specific';
              break;
            case 'OVER_QUERY_LIMIT':
              errorMessage += ' You have exceeded your quota for Geocoding requests.';
              break;
            case 'REQUEST_DENIED':
              errorMessage += ' The request was denied. Please check your API key configuration.';
              break;
            case 'INVALID_REQUEST':
              errorMessage += ' The request was invalid. Please try a different search term.';
              break;
            default:
              errorMessage += ` Error: ${status}`;
          }
          console.error(errorMessage);
          customToast.error(errorMessage);
        }
      });
    } else {
      console.error('Google Maps not loaded or map not initialized');
      customToast.error('Unable to perform search. Please try again later.');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setNewPin(null);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setActiveMarker(null);
  };

  if (loadError) {
    return <div>Error loading maps: {loadError.message}</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
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
  );
}

export default BreederMap;