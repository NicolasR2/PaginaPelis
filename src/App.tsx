import { useState } from "react";
import MovieList from "./components/MovieList";
import MovieDetail from "./components/MovieDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";

// Datos de prueba para las películas
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
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [cart, setCart] = useState([]);
  const [checkout, setCheckout] = useState(false);

  // Seleccionar una película para ver detalles
  const viewMovieDetail = (movie) => {
    setSelectedMovie(movie);
  };

  // Agregar película al carrito
  const addToCart = (movie) => {
    setCart([...cart, movie]);
  };

  // Remover película del carrito
  const removeFromCart = (movieId) => {
    setCart(cart.filter((movie) => movie.id !== movieId));
  };

  // Iniciar proceso de pago
  const proceedToCheckout = () => {
    setCheckout(true);
  };

  // Confirmar el pago
  const confirmCheckout = () => {
    alert("Pago exitoso. ¡Disfruta tu película!");
    setCart([]); // Limpiamos el carrito después del pago
    setCheckout(false);
  };

  return (
    <div>
      {!checkout ? (
        <>
          {!selectedMovie ? (
            <>
              <MovieList movies={moviesData} onViewDetail={viewMovieDetail} />
              <Cart
                cart={cart}
                onRemoveFromCart={removeFromCart}
                onCheckout={proceedToCheckout}
              />
            </>
          ) : (
            <MovieDetail movie={selectedMovie} onAddToCart={addToCart} />
          )}
        </>
      ) : (
        <Checkout
          totalPrice={
            cart.length > 0
              ? cart.reduce((total, m) => total + m.rental_rate, 0)
              : 0
          }
          onConfirm={confirmCheckout}
        />
      )}
    </div>
  );
}

export default App;
