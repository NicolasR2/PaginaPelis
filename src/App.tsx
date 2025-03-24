import { useState } from "react";
import MovieList from "./components/MovieList";
import Cart from "./components/Cart";
import SearchBar from "./components/SearchBar";
import { Button, Container, Box } from "@mui/material";

const moviesData = [
  {
    id: 1,
    title: "Titanic",
    description: "A love story on a doomed ship",
    rental_rate: 4.99,
  },
  {
    id: 2,
    title: "Inception",
    description: "A dream within a dream",
    rental_rate: 3.99,
  },
  {
    id: 3,
    title: "Interstellar",
    description: "Exploring the universe beyond time",
    rental_rate: 5.99,
  },
];

function App() {
  const [cart, setCart] = useState<Movie[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const addToCart = (movie: Movie) => {
    if (!cart.some((m) => m.id === movie.id)) {
      setCart((prevCart) => [...prevCart, movie]);
    }
  };

  const removeFromCart = (movieId: number) => {
    setCart((prevCart) => prevCart.filter((movie) => movie.id !== movieId));
  };

  const toggleCart = () => {
    setShowCart((prev) => !prev);
  };

  return (
    <Container>
      {/* 🔹 Contenedor fijo para barra de búsqueda y botón de carrito */}
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          backgroundColor: "white",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center", // ✅ Asegura que los elementos estén alineados verticalmente
          justifyContent: "space-between",
          boxShadow: "0px 2px 5px rgba(0,0,0,0.2)",
          zIndex: 1000,
          height: "60px", // ✅ Se le da una altura fija para mejor alineación
        }}
      >
        {/* 🔎 Barra de búsqueda */}
        <Box sx={{ flex: 1, marginRight: 2 }}>
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </Box>

        {/* 🛒 Botón "Ver Carrito" alineado correctamente */}
        <Button
          variant="contained"
          color="secondary"
          onClick={toggleCart}
          sx={{
            height: "40px", // ✅ Le damos una altura similar a la barra de búsqueda
            display: "flex",
            alignItems: "center",
          }}
        >
          {showCart ? "Volver a Películas" : `Ver Carrito (${cart.length})`}
        </Button>
      </Box>

      {/* Añadimos un margen superior para que el contenido no quede tapado */}
      <Box sx={{ marginTop: "80px" }}>
        {!showCart ? (
          <MovieList
            movies={moviesData}
            onAddToCart={addToCart}
            cart={cart}
            searchTerm={searchTerm}
          />
        ) : (
          <Cart cart={cart} onRemoveFromCart={removeFromCart} />
        )}
      </Box>
    </Container>
  );
}

export default App;
