
from django.db import models
from uuid import uuid4

class Administrador(models.Model):
    id_administrador = models.AutoField(primary_key=True)
    nombre_administrador = models.CharField(max_length=100)
    apellido_administrador = models.CharField(max_length=100)
    correo_administrador = models.CharField(max_length=100)
    contraseña_administrador = models.CharField(max_length=100)
    fcreacion_administrador = models.DateField(auto_now_add=True)
    sede_administrador = models.CharField(max_length=100)

class Tarea(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    descripcion = models.CharField(max_length=100)
    terminada = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Tarea'
        verbose_name_plural = 'Tareas'
        db_table = 'Tarea'
