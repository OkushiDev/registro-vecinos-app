-- Migracion para bases creadas antes del fix de zona horaria (2026-11-13).
-- Asume que el backend anterior guardaba fechas locales de Chile.
-- En desarrollo es mas simple recrear el volumen: docker compose down -v.
BEGIN;

ALTER TABLE documentos
  ALTER COLUMN fecha_subida TYPE TIMESTAMPTZ
  USING fecha_subida AT TIME ZONE 'America/Santiago';

-- Backfill opcional de solicitudes antiguas. Reemplazar el cutoff por la
-- fecha/hora del despliegue antes de ejecutar.
-- UPDATE solicitudes
-- SET fecha_solicitud =
--   (fecha_solicitud AT TIME ZONE 'UTC') AT TIME ZONE 'America/Santiago'
-- WHERE fecha_solicitud < '2026-11-13 00:00:00+00';

COMMIT;
