
from django.db import models
from uuid import uuid4

# Create your models here.
class Tarea(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    descripcion = models.CharField(max_length=100)
    terminada = models.BooleanField(default=False)
    fecha_creacion = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Tarea'
        verbose_name_plural = 'Tareas'
        db_table = 'Tarea'
