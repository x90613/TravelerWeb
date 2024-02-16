import React, { useState, useEffect, forwardRef } from "react";

import { Loader } from "@googlemaps/js-api-loader";

interface PlaceAutocompleteProps {
  onPlaceSelected: (place: google.maps.places.PlaceResult) => void;
  location: string;
}

const PlaceAutocomplete = forwardRef<HTMLInputElement, PlaceAutocompleteProps>(
  ({ onPlaceSelected, location }, ref) => {
    const [autocomplete, setAutocomplete] =
      useState<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
      const loader = new Loader({
        apiKey: "Your API key", // 你的 API key
        libraries: ["places"],
      });

      loader.load().then(() => {
        if (ref && "current" in ref && ref.current) {
          const autocompleteInstance =
            new window.google.maps.places.Autocomplete(ref.current);

          autocompleteInstance.addListener("place_changed", () => {
            const place = autocompleteInstance.getPlace();
            if (place.geometry) {
              onPlaceSelected(place);
            }
          });

          setAutocomplete(autocompleteInstance);
        }
      });
    }, [ref, onPlaceSelected]);

    return (
      <input
        className="h-8 w-fit rounded-md border border-gray-300 px-2"
        ref={ref}
        defaultValue={location}
        type="text"
        placeholder="Enter your address"
      />
    );
  },
);

PlaceAutocomplete.displayName = "PlaceAutocomplete";
export default PlaceAutocomplete;
