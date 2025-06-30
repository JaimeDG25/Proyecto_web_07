from django.urls import path
from . import views 
urlpatterns = [
    path('layout/',views.layout, name='layout'),
    path('index/',views.index, name='index_link'),
    path('registrar_apoyo/', views.registrar_apoyo, name='registrar_apoyo'),
    path('promotores/',views.promotores, name='promotor_link'),
    path('colegios/',views.colegios, name='colegio_link'),
    path('asistencias/',views.asistencia, name='asistencia_link'),
    path('generadores/',views.generador, name='generador_link'),
]