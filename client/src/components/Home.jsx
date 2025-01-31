import React from "react";
import "../styles/home.css";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import usePlacesAutocomplete, {
  getDetails,
  getGeocode,
  getLatLng,
} from "use-places-autocomplete";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopover,
  ComboboxList,
  ComboboxOption,
} from "@reach/combobox";
// import { formatRelative } from "date-fns";

import "@reach/combobox/styles.css";
// import mapStyles from "../mapStyles";

const libraries = ["places"];
const mapContainerStyle = {
  height: "100%",
  width: "100%",
  minHeight: "80vh",
};
const options = {
  //styles: mapStyles,
  //disableDefaultUI: true,
  zoomControl: true,
};
const center = {
  lat: 43.6532,
  lng: -79.3832,
};

export default function Home(props) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
    libraries,
  });
  const [markers, setMarkers] = React.useState([]);
  const [selected, setSelected] = React.useState(null);

  const onMapClick = (e) => {
    let lat = e.latLng.lat();
    let lng = e.latLng.lng();
    setLocationOnMap({ lat, lng });
  };

  const mapRef = React.useRef();
  const onMapLoad = React.useCallback((map) => {
    mapRef.current = map;
  }, []);

  const panTo = React.useCallback(({ lat, lng }) => {
    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
  }, []);

  const setLocationOnMap = React.useCallback(
    async ({ lat, lng, place_id = -1 }) => {
      // Check it place id is passed or not
      if (place_id === -1) {
        const latlng = { lat: lat, lng: lng };
        let res = await getGeocode({ location: latlng });
        place_id = res[1].place_id;
      }

      let details = await getDetails({ placeId: place_id });

      // ES6 syntax
      // fat arrow syntax
      setMarkers((current) => {
        // Check if user has already marked the place
        let prev_index = current.findIndex(
          (x) => x.lat === lat && x.lng === lng
        );
        if (prev_index > -1) {
          return current;
        }
        props.handleAddLocation({lat: JSON.stringify(lat), lng: JSON.stringify(lng), location_details: JSON.stringify(details), photo_url: details.photos ? details.photos[0].getUrl() : null, place_id, like_num:0, dislike_num:0})
        return current
        // return [
        //   ...current,
        //   {
        //     lat: lat,
        //     lng: lng,
        //     placeId: place_id,
        //     details: details,
        //    // address: details.formatted_address,
        //     //name: details.name,
        //     //phone: details.formatted_phone_number,
        //     //website: details.website,
        //     //google_url: details.url,
        //     // logo: details.photos ? details.photos[0].getUrl() : null,
        //     time: new Date(),
        //   },
        // ];
      });
    },
    [props]
  );

  if (loadError) return "Error";
  if (!isLoaded) return "Loading...";
  

  const onClickHotspot = ({ lat, lng }) => {
    panTo({ lat: lat, lng: lng });
    // let currentMarker = markers.filter(m => m.lat === lat && m.lng === lng)
    //console.log(currentMarker)
    // TODO: Click on Marker programmatically
  };

    if (markers.length !== Object.values(props.locations).length) {
      setMarkers((current) => {
        let locationsArray = Object.values(props.locations)
        locationsArray = locationsArray.map((x) => {
          x.lat = parseFloat(x.lat)
          x.lng = parseFloat(x.lng)
          //debugger
          x.details = JSON.parse(x.location_details) 
          return x
        })
        console.log(locationsArray)
        return [
          ...current,
          ...locationsArray
        ]
      })
    }

  return (
    <React.Fragment>
      <div className="search-container mtxl">
        <Search panTo={panTo} setLocationOnMap={setLocationOnMap} />
      </div>

      <div style={{ display: "flex" }} className="map-container mtxl pll prl">
        {markers.length > 0 && (
          <div style={{ flex: 1 }} className="hotspotList ">
            <h4 className="your-hotspots mtl">
              {markers.length > 0 ? "YOUR HOTSPOTS" : "FIND A SPOT YOU LIKE!"}
            </h4>
            <div className="hotspot-list-container">
              {markers.map((spot, i) => (
                <p
                  onClick={() =>
                    onClickHotspot({ lat: spot.lat, lng: spot.lng })
                  }
                  className="place-item bold"
                  style={{display:'flex', justifyContent:'space-between'}}
                  key={spot.lat}
                >
                  
                  <span>{spot.details.name || spot.details.formatted_address}</span>
                  <span className="delete-icon" onClick={() => {props.handlePlaceDelete(spot.location_id)}}>
                    &#x1f5d1; 
                  </span>
                </p>
              ))}
            </div>
          </div>
        )}

        <div style={{ flex: 3 }}>
          <div style={{ maxHeight: '100%' }}>
            {/* <Locate panTo={panTo} setLocationOnMap={ setLocationOnMap } /> */}
            <GoogleMap
              id="map"
              mapContainerStyle={mapContainerStyle}
              zoom={8}
              center={center}
              options={options}
              onClick={onMapClick}
              onLoad={onMapLoad}
            >
              {markers.map((marker) => (
                <Marker
                  key={`${marker.lat}-${marker.lng}`}
                  position={{ lat: marker.lat, lng: marker.lng }}
                  onClick={() => {
                    setSelected(marker);
                  }}
                />
              ))}

              {selected ? (
                <InfoWindow
                  position={{ lat: selected.lat, lng: selected.lng }}
                  onCloseClick={() => {
                    setSelected(null);
                  }}
                >
                  <div>
                    <div style={{ display: "flex" }}>
                      { selected.photo_url && <div className="place-logo"><img className="img-logo" src={selected.photo_url} alt="Place logo" /> </div>}
                      <div className="plm ptm pbm prm place-details">
                        <h3>{selected.details.name}</h3>
                        <p>{selected.details.formatted_address}</p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          { selected.details.formatted_phone_number &&  <p><a rel="noreferrer" href={"tel:" + selected.details.formatted_phone_number} target="_blank">{selected.details.formatted_phone_number}</a></p> }
                          { selected.details.website &&  <p><a href={selected.details.website} rel="noreferrer" target="_blank">Website</a></p> }
                          { selected.details.url &&  <p><a href={selected.details.url} rel="noreferrer" target="_blank">Google URL</a></p> }
                        </div>
                      </div>
                    </div>
                  </div>
                </InfoWindow>
              ) : null}
            </GoogleMap>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}

// function Locate({ panTo, setLocationOnMap }) {
//   return (
//     <button
//       className="locate"
//       onClick={() => {
//         navigator.geolocation.getCurrentPosition(
//           (position) => {
//             panTo({
//               lat: position.coords.latitude,
//               lng: position.coords.longitude,
//             });
//             setLocationOnMap({
//               lat: position.coords.latitude,
//               lng: position.coords.longitude,
//             });
//           },
//           () => null
//         );
//       }}
//     >
//       My location
//     </button>
//   );
// }

function Search({ panTo, setLocationOnMap }) {
  const {
    ready,
    value,
    suggestions: { status, data },
    setValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 43.6532, lng: () => -79.3832 },
      radius: 100 * 1000,
    },
  });

  // https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest

  const handleInput = (e) => {
    setValue(e.target.value);
  };

  const handleSelect = async (address) => {
    setValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      console.log(results);
      const place_id = results[0].place_id;
      console.log(place_id);
      const { lat, lng } = await getLatLng(results[0]);
      panTo({ lat, lng });
      setLocationOnMap({ lat, lng, place_id });
    } catch (error) {
      console.log("😱 Error: ", error);
    }
  };

  return (
    <div className="search">
      <Combobox onSelect={handleSelect}>
        <ComboboxInput
          className="search-input"
          value={value}
          onChange={handleInput}
          disabled={!ready}
          placeholder="Search a fun location!"
        />
        <ComboboxPopover>
          <ComboboxList>
            {status === "OK" &&
              data.map(({ id, description }) => (
                <ComboboxOption key={id + description} value={description} />
              ))}
          </ComboboxList>
        </ComboboxPopover>
      </Combobox>
    </div>
  );
}
