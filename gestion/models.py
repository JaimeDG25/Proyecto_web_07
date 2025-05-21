from django.db import models
#gaaaaaaaaaaaaaaaaaaaaa
class Promotor(models.Model):
    nombres = models.CharField(max_length=100)
    apellidos = models.CharField(max_length=100)
    codigo = models.CharField(max_length=20, unique=True)
    telefono = models.CharField(max_length=20)
    dni = models.CharField(max_length=8, unique=True)
    correo = models.EmailField()

    def __str__(self):
        return f"{self.apellidos}, {self.nombres} ({self.codigo})"


class Apoyo(models.Model):
    nombre_completo = models.CharField(max_length=200)
    telefono = models.CharField(max_length=20)
    dni = models.CharField(max_length=8, unique=True)
    ruc = models.CharField(max_length=11, blank=True)
    correo = models.EmailField()

    def __str__(self):
        return self.nombre_completo


class Colegio(models.Model):
    nombre = models.CharField(max_length=200)
    promotor = models.ForeignKey(Promotor, on_delete=models.CASCADE)
    apellidos_encargado = models.CharField(max_length=100)
    nombres_encargado = models.CharField(max_length=100)
    telefono_encargado = models.CharField(max_length=9)
    distrito = models.CharField(max_length=100)
    link_ubicacion = models.URLField(blank=True)
    archivo_excel = models.FileField(upload_to='bases_datos/', blank=True, null=True)

    def __str__(self):
        return self.nombre


class Asistencia(models.Model):
    ROL_OPCIONES = [
        ('bus', 'Bus (S/ 50.00)'),
        ('campus', 'Campus (S/ 40.00)')
    ]
    TURNO_OPCIONES = [
        ('mañana', 'Mañana'),
        ('tarde', 'Tarde')
    ]

    apoyo = models.ForeignKey(Apoyo, on_delete=models.CASCADE)
    colegio = models.ForeignKey(Colegio, on_delete=models.CASCADE)
    rol = models.CharField(max_length=10, choices=ROL_OPCIONES)
    turno = models.CharField(max_length=10, choices=TURNO_OPCIONES)
    fecha = models.DateField()

    def __str__(self):
        return f"{self.apoyo} - {self.colegio} ({self.fecha})"


#

class OrdenPago(models.Model):
    numero_documento = models.CharField(max_length=20, unique=True)
    apoyo = models.ForeignKey(Apoyo, on_delete=models.CASCADE)
    fecha_generacion = models.DateTimeField(auto_now_add=True)
    total_pagado = models.DecimalField(max_digits=10, decimal_places=2)
    pdf_oc = models.FileField(upload_to='documentos_oc/', blank=True, null=True)
    pdf_nr = models.FileField(upload_to='documentos_nr/', blank=True, null=True)

    def __str__(self):
        return f"OC/NR {self.numero_documento} - {self.apoyo}"


class AsistenciaEnOrden(models.Model):
    orden = models.ForeignKey(OrdenPago, on_delete=models.CASCADE, related_name='asistencias')
    asistencia = models.ForeignKey(Asistencia, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.orden.numero_documento} -> {self.asistencia}"
