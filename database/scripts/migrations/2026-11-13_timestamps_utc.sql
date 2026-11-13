-- Migracion para bases creadas antes del fix de zona horaria (2026-11-13).
-- Asume que el backend anterior guardaba fechas locales de Chile.
--
-- Uso:
--   psql -v cutoff="2026-11-13 02:00:00+00" -f 2026-11-13_timestamps_utc.sql
--
-- `cutoff` debe ser el instante UTC en que se desplego el backend nuevo:
-- las solicitudes anteriores se convierten; las posteriores ya estan en UTC.
-- Ejecutar una sola vez, antes de arrancar el backend nuevo.
-- En desarrollo es mas simple recrear el volumen: docker compose down -v.
BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'documentos'
      AND column_name = 'fecha_subida'
      AND data_type = 'timestamp without time zone'
  ) THEN
    ALTER TABLE documentos
      ALTER COLUMN fecha_subida TYPE TIMESTAMPTZ
      USING fecha_subida AT TIME ZONE 'America/Santiago';
  END IF;
END $$;

UPDATE solicitudes
SET fecha_solicitud =
  (fecha_solicitud AT TIME ZONE 'UTC') AT TIME ZONE 'America/Santiago'
WHERE fecha_solicitud < :'cutoff';

COMMIT;
