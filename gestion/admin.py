from django.contrib import admin
from .models import Promotor, Apoyo, Colegio, Asistencia, OrdenPago, AsistenciaEnOrden

admin.site.register(Promotor)
admin.site.register(Apoyo)
admin.site.register(Colegio)
admin.site.register(Asistencia)
admin.site.register(OrdenPago)
admin.site.register(AsistenciaEnOrden)
