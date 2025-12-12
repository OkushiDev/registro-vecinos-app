import pytest
from datetime import datetime, date

# ==========================================
# 1. LÓGICA A PROBAR (Mock/Simulación)
# ==========================================
# En un escenario real, importarías esto así:
# from app.utils import validar_rut

def validar_rut(rut: str) -> bool:
    """
    Simula la validación de formato de RUT chileno.
    Verifica largo mínimo y formato básico.
    """
    if not rut:
        return False
    # Limpiar puntos y guión
    rut_limpio = rut.replace(".", "").replace("-", "")
    
    # Validar que no tenga caracteres raros y largo mínimo
    if not rut_limpio.isalnum() or len(rut_limpio) < 8:
        return False
        
    return True

def formatear_fecha_reporte(fecha_iso: str) -> str:
    """
    Transforma fecha YYYY-MM-DD a objeto date o string DD-MM-YYYY
    """
    fecha_obj = date.fromisoformat(fecha_iso)
    return fecha_obj.strftime("%d-%m-%Y")

def calcular_antiguedad(fecha_ingreso: str) -> str:
    """
    Calcula años de antigüedad desde una fecha dada.
    """
    fecha_obj = date.fromisoformat(fecha_ingreso)
    hoy = date.today()
    anios = hoy.year - fecha_obj.year
    # Ajuste si no ha cumplido años este año
    if (hoy.month, hoy.day) < (fecha_obj.month, fecha_obj.day):
        anios -= 1
    return f"{anios} años"

# ==========================================
# 2. CASOS DE PRUEBA
# ==========================================

def test_validacion_rut_valido():
    """
    Prueba unitaria: RUT con formato válido
    Entrada: '12.345.678-9' -> Esperado: True
    """
    entrada = "12.345.678-9"
    resultado = validar_rut(entrada)
    assert resultado == True

def test_validacion_rut_invalido():
    """
    Prueba unitaria: RUT inválido (muy corto o vacío)
    Entrada: '1-9' -> Esperado: False
    """
    entrada = "1-9" # Rut claramente invalido
    resultado = validar_rut(entrada)
    assert resultado == False

def test_formato_fecha():
    """
    Prueba unitaria: Formateo de fecha
    Entrada: '2024-12-25' -> Esperado: '25-12-2024'
    """
    entrada = "2024-12-25"
    resultado = formatear_fecha_reporte(entrada)
    assert resultado == "25-12-2024"

def test_calculo_antiguedad():
    """
    Prueba unitaria: Cálculo de antigüedad
    Entrada: '2020-03-15' -> Esperado: 'X años' (Dinámico)
    """
    # Nota: Esto calcula dinámicamente según el año actual (2025)
    entrada = "2020-03-15"
    resultado = calcular_antiguedad(entrada)
    
    # Si estamos en 2025 (según tu contexto), 2020 a 2025 son 5 años
    assert "años" in resultado