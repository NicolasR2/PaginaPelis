from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pymysql
import os
from dotenv import load_dotenv
from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
import psycopg2.extras

# Cargar variables de entorno
load_dotenv()

app = FastAPI()

# Configuración CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://18.206.172.229:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelos Pydantic
class Movie(BaseModel):
    id: int
    title: str
    description: Optional[str]
    release_year: Optional[int]
    rental_rate: float
    length: Optional[int]
    rating: Optional[str]

class RentalItem(BaseModel):
    film_id: int
    inventory_id: int

class RentalRequest(BaseModel):
    customer_id: int
    store_id: int  # ← AÑADE ESTO
    items: List[RentalItem]

class ReturnRequest(BaseModel):
    rental_ids: List[int]

class RentalInfo(BaseModel):
    rental_id: int
    film_id: int
    title: str
    rental_date: str

class AvailabilityResponse(BaseModel):
    available: bool
    inventory_id: int | None
    


# Conexión a la base de datos
def get_db_connection():
    return pymysql.connect(
        host=os.getenv("DB_HOST"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD"),
        database=os.getenv("DB_NAME"),
        cursorclass=pymysql.cursors.Cursor  # Asegura que el fetch devuelva tuplas
    
    )

def format_movie(movie_data):
    return {
        "id": movie_data[0],
        "title": movie_data[1],
        "description": movie_data[2],
        "release_year": movie_data[3],
        "rental_rate": float(movie_data[4]),
        "length": movie_data[5],
        "rating": movie_data[6]
    }

# Endpoints
@app.get("/", response_model=dict)
def read_root():
    return {"message": "Bienvenido a la API de alquiler de películas"}


@app.get("/movies", response_model=dict[str, List[Movie]])
def get_movies(query: str = "", store_id: int = 1):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            if query.strip():
                cursor.execute("""
                    SELECT f.film_id, f.title, f.description, f.release_year, f.rental_rate, f.length, f.rating
                    FROM film f
                    JOIN inventory i ON f.film_id = i.film_id
                    WHERE i.store_id = %s AND f.title LIKE %s
                    GROUP BY f.film_id, f.title, f.description, f.release_year, f.rental_rate, f.length, f.rating
                    ORDER BY f.title
                    LIMIT 15
                """, (store_id, f"%{query}%"))
            else:
                cursor.execute("""
                    SELECT f.film_id, f.title, f.description, f.release_year, f.rental_rate, f.length, f.rating
                    FROM film f
                    JOIN inventory i ON f.film_id = i.film_id
                    WHERE i.store_id = %s
                    GROUP BY f.film_id, f.title, f.description, f.release_year, f.rental_rate, f.length, f.rating
                    ORDER BY RAND()
                    LIMIT 15
                """, (store_id,))
            movies = [format_movie(movie) for movie in cursor.fetchall()]
            return {"movies": movies}
    finally:
        connection.close()



@app.get("/movies/search/", response_model=dict)
def search_movies(query: str = Query(..., min_length=1)):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT film_id, title, description, 
                       release_year, rental_rate, length, rating 
                FROM film 
                WHERE title LIKE %s
            """, (f"%{query}%",))
            movies = [format_movie(movie) for movie in cursor.fetchall()]
            return {"movies": movies}
    finally:
        connection.close()

@app.get("/films/{film_id}/availability", response_model=AvailabilityResponse)
def check_film_availability(film_id: int, store_id: int):
    try:
        connection = get_db_connection()
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT i.inventory_id
                FROM inventory i
                LEFT JOIN rental r ON i.inventory_id = r.inventory_id
                    AND r.return_date IS NULL
                WHERE i.film_id = %s AND i.store_id = %s
                GROUP BY i.inventory_id
                HAVING COUNT(r.rental_id) = 0
                LIMIT 1
            """, (film_id, store_id))
            result = cursor.fetchone()
            if result:
                return {"available": True, "inventory_id": result[0]}
            else:
                return {"available": False, "inventory_id": None}
    except Exception as e:
        print("Error en check_film_availability:", e)
        raise HTTPException(status_code=500, detail="Error interno en disponibilidad")
    finally:
        if 'connection' in locals():
            connection.close()


@app.post("/rentals", response_model=dict)
def create_rental(request: RentalRequest):
    store_id = request.store_id
    connection = get_db_connection()
    success_rentals = []
    failed_rentals = []

    try:
        with connection.cursor() as cursor:
            # Validar cliente
            cursor.execute("SELECT 1 FROM customer WHERE customer_id = %s", (request.customer_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Cliente no encontrado")

            for item in request.items:
                try:
                    # Verificar disponibilidad por tienda
                    availability = check_film_availability(item.film_id, request.store_id)
                    if not availability["available"] or availability["inventory_id"] != item.inventory_id:
                        failed_rentals.append({
                            "film_id": item.film_id,
                            "inventory_id": item.inventory_id,
                            "error": "No disponible"
                        })
                        continue

                    # Insertar alquiler
                    cursor.execute("""
                        INSERT INTO rental (
                            rental_date, inventory_id, 
                            customer_id, staff_id
                        ) VALUES (NOW(), %s, %s, 1)
                    """, (item.inventory_id, request.customer_id))
                    success_rentals.append({
                        "film_id": item.film_id,
                        "inventory_id": item.inventory_id,
                        "rental_id": cursor.lastrowid
                    })
                except Exception as e:
                    failed_rentals.append({
                        "film_id": item.film_id,
                        "inventory_id": item.inventory_id,
                        "error": str(e)
                    })

            connection.commit()
            return {
                "success": True,
                "completed": success_rentals,
                "failed": failed_rentals
            }
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        connection.close()

@app.get("/customers/{customer_id}/rentals", response_model=dict)
def get_customer_rentals(customer_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT r.rental_id, f.film_id, f.title, r.rental_date, i.inventory_id
                FROM rental r
                JOIN inventory i ON r.inventory_id = i.inventory_id
                JOIN film f ON i.film_id = f.film_id
                WHERE r.customer_id = %s AND r.return_date IS NULL
            """, (customer_id,))
            
            rentals = []
            for rental in cursor.fetchall():
                rentals.append({
                    "rental_id": rental[0],
                    "film_id": rental[1],
                    "title": rental[2],
                    "rental_date": rental[3].strftime("%Y-%m-%d %H:%M:%S") if rental[3] else None,
                    "inventory_id": rental[4]
                })
            
            return {"rentals": rentals}
    finally:
        connection.close()


@app.post("/returns", response_model=dict)
def process_returns(return_request: ReturnRequest):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            updated_count = 0
            
            for rental_id in return_request.rental_ids:
                cursor.execute("""
                    UPDATE rental 
                    SET return_date = NOW() 
                    WHERE rental_id = %s AND return_date IS NULL
                """, (rental_id,))
                updated_count += cursor.rowcount
            
            connection.commit()
            return {
                "success": True,
                "message": f"Se procesaron {updated_count} devoluciones",
                "updated_count": updated_count
            }
    except Exception as e:
        connection.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        connection.close()

@app.get("/customers/{customer_id}")
async def verify_customer(customer_id: int):
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM customer WHERE customer_id = %s", (customer_id,))
            result = cursor.fetchone()
            return {"exists": result[0] > 0}
    finally:
        connection.close()