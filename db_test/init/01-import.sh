#!/bin/bash
# Restaura el backup de producción en bookingDB
# Se ejecuta automáticamente cuando el volumen de MongoDB está vacío

set -e
DB="bookingDB"
DIR="/docker-entrypoint-initdb.d/bookings"

echo "🗄️  Restaurando backup de producción en $DB..."

import_collection() {
  local file=$1
  local coll=$2
  if [ -f "$DIR/$file" ]; then
    mongoimport --db "$DB" --collection "$coll" \
      --file "$DIR/$file" --jsonArray --quiet
    echo "  ✅ $coll importado"
  else
    echo "  ⚠️  $file no encontrado, saltando $coll"
  fi
}

import_collection "bookings.sellers.json"    "sellers"
import_collection "bookings.contacts.json"   "contacts"
import_collection "bookings.orders.json"     "orders"
import_collection "bookings.passengers.json" "passengers"
import_collection "bookings.files.json"      "files"
import_collection "bookings.documents.json"  "documents"
# countries → colección 'country' (nombre distinto al backup)
import_collection "bookings.countries.json"  "country"

echo "✅ Restauración completada."
