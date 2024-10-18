import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faMapMarkerAlt, faTimes, faPencilAlt, faCheck, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { collection, getDocs, doc, updateDoc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import './BreederMap.scss';

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

export default function BreederMap() {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_FIREBASE_API_KEY || '',
    libraries: ['places'],
  });

  const { currentUser } = useAuth();
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [activeMarker, setActiveMarker] = useState(null);
  const [newPin, setNewPin] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editedMarker, setEditedMarker] = useState(null);
  const [userData, setUserData] = useState(null);
  const [species, setSpecies] = useState(['']);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (loadError) {
      console.error('Error loading Google Maps:', loadError);
      customToast.error('Failed to load Google Maps. Please try again later.');
    }
  }, [loadError]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            setUserData(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          customToast.error('Failed to fetch user data. Please try again later.');
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    const fetchBreederLocations = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const fetchedMarkers = usersSnapshot.docs
          .filter(doc => doc.data().breederData)
          .map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data.breederData,
              lat: data.breederData.location.latitude,
              lng: data.breederData.location.longitude,
              ownerName: `${data.firstName} ${data.lastName}`,
            };
          });
        setMarkers(fetchedMarkers);
      } catch (error) {
        console.error('Error fetching breeder locations:', error);
        customToast.error('Failed to fetch breeder locations. Please try again later.');
      }
    };

    fetchBreederLocations();
  }, []);

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
    if (currentUser && !userData?.breederData) {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      setNewPin({ lat, lng });
      setIsModalOpen(true);
      setIsSidePanelOpen(false);
      setSpecies(['']);
    } else if (!currentUser) {
      customToast.error('Please sign in to add a breeder location.');
    } else if (userData?.breederData) {
      customToast.error('You have already added a breeder location.');
    }
  };

  const handleMarkerClick = (marker) => {
    try {
      console.log('Marker clicked:', marker);
      setActiveMarker(marker);
      setIsSidePanelOpen(true);
      setEditMode(false);
      setEditedMarker(null);
      setSpecies(marker.species || ['']);
    } catch (error) {
      console.error('Error in handleMarkerClick:', error);
      customToast.error('An error occurred. Please try again.');
    }
  };

  const handlePinSubmit = async (e) => {
    e.preventDefault();
    const breeder = e.target.breeder.value;
    const contactInfo = e.target.contactInfo.value;
    
    if (breeder && contactInfo && newPin && currentUser && !userData?.breederData) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const newBreederData = {
          breeder,
          species: species.filter(s => s.trim() !== ''),
          contactInfo,
          location: { latitude: newPin.lat, longitude: newPin.lng },
        };
        await updateDoc(userRef, {
          breederData: newBreederData
        });
        const updatedUserData = { ...userData, breederData: newBreederData };
        setUserData(updatedUserData);
        setMarkers([...markers, {
          id: currentUser.uid,
          ...newBreederData,
          lat: newPin.lat,
          lng: newPin.lng,
          ownerName: `${userData.firstName} ${userData.lastName}`,
        }]);
        setNewPin(null);
        setIsModalOpen(false);
        customToast.success('Breeder location added successfully!');
      } catch (error) {
        console.error('Error adding breeder location:', error);
        customToast.error('Failed to add breeder location. Please try again.');
      }
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
    setSpecies(['']);
  };

  const handleCloseSidePanel = () => {
    setIsSidePanelOpen(false);
    setActiveMarker(null);
    setEditMode(false);
    setEditedMarker(null);
    setSpecies(['']);
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditedMarker({ ...activeMarker });
    setSpecies(activeMarker.species || ['']);
  };

  const handleSaveEdit = async () => {
    try {
      const userRef = doc(db, 'users', editedMarker.id);
      await updateDoc(userRef, {
        'breederData.breeder': editedMarker.breeder,
        'breederData.species': species.filter(s => s.trim() !== ''),
        'breederData.contactInfo': editedMarker.contactInfo,
      });
      const updatedMarker = {
        ...editedMarker,
        species: species.filter(s => s.trim() !== ''),
      };
      setMarkers(markers.map(marker => 
        marker.id === updatedMarker.id ? updatedMarker : marker
      ));
      setActiveMarker(updatedMarker);
      setEditMode(false);
      customToast.success('Breeder information updated successfully!');
    } catch (error) {
      console.error('Error updating breeder information:', error);
      customToast.error('Failed to update breeder information. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    setEditedMarker({ ...editedMarker, [e.target.name]: e.target.value });
  };

  const handleAddSpecies = () => {
    setSpecies([...species, '']);
  };

  const handleRemoveSpecies = (index) => {
    setSpecies(species.filter((_, i) => i !== index));
  };

  const handleSpeciesChange = (index, value) => {
    const newSpecies = [...species];
    newSpecies[index] = value;
    setSpecies(newSpecies);
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
            {markers.map((marker) => (
              <Marker
                key={marker.id}
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
            <h3>{activeMarker.breeder}</h3>
            {editMode ? (
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                <div className="info-item">
                  <label htmlFor="breeder">Breeder:</label>
                  <input
                    type="text"
                    id="breeder"
                    name="breeder"
                    value={editedMarker.breeder}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="info-item">
                  <label>Species:</label>
                  {species.map((s, index) => (
                    <div key={index} className="species-input">
                      <input
                        type="text"
                        value={s}
                        onChange={(e) => handleSpeciesChange(index, e.target.value)}
                      />
                      <button type="button" onClick={() => handleRemoveSpecies(index)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={handleAddSpecies} className="add-species">
                    <FontAwesomeIcon icon={faPlus} /> Add Species
                  </button>
                </div>
                <div className="info-item">
                  <label htmlFor="contactInfo">Contact:</label>
                  <input
                    type="text"
                    id="contactInfo"
                    name="contactInfo"
                    value={editedMarker.contactInfo}
                    onChange={handleInputChange}
                  />
                </div>
                <button type="submit" className="save-button">
                  <FontAwesomeIcon icon={faCheck} /> Save
                </button>
              </form>
            ) : (
              <>
                <div className="info-item">
                  <strong>Owner:</strong>
                  <span>{activeMarker.ownerName}</span>
                </div>
                <div className="info-item">
                  <strong>Species:</strong>
                  <ul>
                    {activeMarker.species && activeMarker.species.map((s, index) => (
                      <li key={index}>{s}</li>
                    ))}
                  </ul>
                </div>
                <div className="info-item">
                  
                  <strong>Contact:</strong>
                  <span>{activeMarker.contactInfo}</span>
                </div>
                {currentUser && currentUser.uid === activeMarker.id && (
                  <button className="edit-button" onClick={handleEditClick}>
                    <FontAwesomeIcon icon={faPencilAlt} /> Edit
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="close-button" onClick={handleCloseModal}>
              <FontAwesomeIcon icon={faTimes} />
            </button>
            <h3>Add Your Breeder Location</h3>
            <form onSubmit={handlePinSubmit}>
              <div className="form-group">
                <label htmlFor="breeder">Breeder Name:</label>
                <input type="text" id="breeder" name="breeder" placeholder="Breeder Name" required />
              </div>
              <div className="form-group">
                <label>Gecko Species:</label>
                {species.map((s, index) => (
                  <div key={index} className="species-input">
                    <input
                      type="text"
                      value={s}
                      onChange={(e) => handleSpeciesChange(index, e.target.value)}
                      placeholder="Gecko Species"
                    />
                    {index > 0 && (
                      <button type="button" onClick={() => handleRemoveSpecies(index)}>
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddSpecies} className="add-species">
                  <FontAwesomeIcon icon={faPlus} /> Add Species
                </button>
              </div>
              <div className="form-group">
                <label htmlFor="contactInfo">Contact Info:</label>
                <input type="text" id="contactInfo" name="contactInfo" placeholder="Contact Info" required />
              </div>
              <button type="submit">Add Location</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}