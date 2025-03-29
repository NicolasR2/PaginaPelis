import React, { useState } from "react";
import axios from "axios";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);

  const handleSearch = () => {
    axios.get("http://ec2-54-236-45-55.compute-1.amazonaws.com:8000/movies/search/", {
      params: { query }
    })
      .then(response => setResults(response.data.movies))
      .catch(error => console.error(error));
  };

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar películas..."
      />
      <button onClick={handleSearch}>Buscar</button>
      <ul>
        {results.map(movie => (
          <li key={movie.id}>
            <h2>{movie.title}</h2>
            <p>{movie.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Search;