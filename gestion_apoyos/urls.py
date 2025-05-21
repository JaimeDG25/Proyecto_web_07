
from django.contrib import admin
from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from schema_graph.views import Schema # Importa Schema (¡con 'c' y 'h'!)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('schema/', Schema.as_view(), name='schema_graph'), 
]
#para acceder al archivo subido desde URL /media/bases_datos/archivo.xlsx
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)