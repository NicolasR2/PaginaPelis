import React, { useState } from "react";
import { TextField } from "@mui/material";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [input, setInput] = useState("");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setInput(query);
    onSearch(query); // 🔍 Llama a la función para buscar en la API
  };

  return (
    <TextField
      label="Buscar películas..."
      variant="outlined"
      fullWidth
      value={input}
      onChange={handleChange}
    />
  );
};

export default SearchBar;
