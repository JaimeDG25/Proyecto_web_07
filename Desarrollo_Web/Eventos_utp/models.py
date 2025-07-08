#Desarrollo_Web/Eventos_utp/models.py
from django.db import models

class Promotor(models.Model):
    nombre_completo_promotor = models.CharField(max_length=100)
    codigo_promotor = models.CharField(max_length=20, unique=True)
    telefono_promotor = models.CharField(max_length=20)
    dni_promotor = models.CharField(max_length=8, unique=True)
    correo_promotor = models.EmailField()
    def __str__(self):
        return f"{self.nombre_completo_promotor} ({self.codigo_promotor})"

class Apoyo(models.Model):
    nombre_completo_apoyo = models.CharField(max_length=200)
    telefono_apoyo = models.CharField(max_length=20)
    dni_apoyo = models.CharField(max_length=8, unique=True)
    ruc_apoyo = models.CharField(max_length=11, blank=True)
    correo_apoyo = models.EmailField()
    def __str__(self):
        return self.nombre_completo

class Colegio(models.Model):
    nombre_colegio = models.CharField(max_length=200)
    promotor_colegio = models.ForeignKey(Promotor, on_delete=models.CASCADE)
    nombre_completo_encargado_colegio = models.CharField(max_length=100)
    telefono_encargado_colegio = models.CharField(max_length=9)
    distrito_colegio = models.CharField(max_length=100)
    link_ubicacion_colegio = models.URLField(blank=True)
    archivo_excel_colegio = models.BinaryField(null=True, blank=True)
    def __str__(self):
        return self.nombre

class Asistencia(models.Model):
    apoyo_asistencia = models.ForeignKey(Apoyo, on_delete=models.CASCADE)
    colegio_asistencia = models.ForeignKey(Colegio, on_delete=models.CASCADE)
    fecha_asistencia = models.DateField() 
    rol_asistencia = models.CharField(max_length=50)
    turno_asistencia = models.CharField(max_length=50)
    asistencia_asistencia = models.BooleanField(default=False)
    monto_pagado_asistencia = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    def __str__(self):
        return f"{self.apoyo} - {self.colegio} ({self.fecha})"


class OrdenPago(models.Model):
    numero_documento = models.CharField(max_length=20, unique=True)
    apoyo = models.ForeignKey(Apoyo, on_delete=models.CASCADE)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    total_pagado = models.DecimalField(max_digits=10, decimal_places=2)
    pdf_oc = models.FileField(upload_to='documentos_oc/', blank=True, null=True)
    pdf_nr = models.FileField(upload_to='documentos_nr/', blank=True, null=True)
    def __str__(self):
        return f"OC/NR {self.numero_documento} - {self.apoyo}"
